#!/usr/bin/env node
// Supabase I/O for the orchestrator. Called by the Claude Code commands in .claude/commands.
// Reads SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY from ../.env (never committed).
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { waLink, buildWhatsappText, validateBrief, validateConcepts, validatePricingCard, validateQa } from './lib.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const envFile = join(here, '..', '.env');
if (existsSync(envFile)) for (const line of readFileSync(envFile, 'utf8').split(/\r?\n/)) {
  const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
  if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^['"]|['"]$/g, '');
}
const URL_ = process.env.SUPABASE_URL, KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!URL_ || !KEY) { console.error('Missing SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY in .env (see .env.example)'); process.exit(2); }
const H = { apikey: KEY, Authorization: `Bearer ${KEY}`, 'Content-Type': 'application/json' };
const portfolio = JSON.parse(readFileSync(join(here, 'portfolio.json'), 'utf8')).map(p => p.file);

async function rest(path, { method = 'GET', body, prefer } = {}) {
  const res = await fetch(`${URL_}/rest/v1/${path}`, { method, headers: { ...H, ...(prefer ? { Prefer: prefer } : {}) }, body: body ? JSON.stringify(body) : undefined });
  const text = await res.text();
  if (!res.ok) throw new Error(`${method} ${path} -> ${res.status} ${text}`);
  return text ? JSON.parse(text) : null;
}
const readJson = f => JSON.parse(readFileSync(f, 'utf8'));
const out = v => console.log(JSON.stringify(v, null, 2));
const fail = (msg, extra) => { console.error(msg); if (extra) console.error(JSON.stringify(extra, null, 2)); process.exit(1); };

const cmds = {
  // New leads = submissions that have no design brief yet
  async 'leads:new'() {
    out(await rest('contact_submissions?select=*,design_briefs(id)&design_briefs=is.null&source=neq.qa_test&order=created_at.asc'));
  },
  // Download the customer's reference image so Claude Code can look at it
  async 'image:download'(path, dest) {
    if (!/^[0-9a-f-]{36}\.(jpg|png|webp)$/.test(path || '')) fail('bad image path');
    const res = await fetch(`${URL_}/storage/v1/object/reference-images/${path}`, { headers: H });
    if (!res.ok) fail(`download failed: ${res.status}`);
    writeFileSync(dest, Buffer.from(await res.arrayBuffer()));
    out({ saved: dest });
  },
  async 'run:start'(flow, sourceId) {
    const [r] = await rest('orchestrator_runs', { method: 'POST', body: { flow, source_id: sourceId || null }, prefer: 'return=representation' });
    out({ run_id: r.id });
  },
  // Validates the agent's output against its contract before saving it
  async 'step:log'(runId, agent, model, attempt, file) {
    const output = readJson(file);
    const checks = { intake: () => validateBrief(output), design: () => validateConcepts(output, portfolio),
      'pricing-prep': () => validatePricingCard(output), qa: () => validateQa(output) };
    const errors = checks[agent] ? checks[agent]() : [];
    const [s] = await rest('agent_steps', { method: 'POST', prefer: 'return=representation',
      body: { run_id: runId, agent, model, attempt: Number(attempt) || 1, output_json: output, status: errors.length ? 'invalid_output' : 'ok' } });
    if (agent === 'qa' && !errors.length)
      await rest('qa_results', { method: 'POST', body: output.criteria.map(c => ({ step_id: s.id, criterion: c.id, passed: c.passed, reason: c.reason || null })) });
    out({ step_id: s.id, valid: !errors.length, errors });
    if (errors.length) process.exit(3);
  },
  async 'brief:save'(submissionId, runId, briefFile, conceptsFile, cardFile, status = 'awaiting_price') {
    const body = { submission_id: submissionId, run_id: runId, brief_json: readJson(briefFile),
      concepts_json: readJson(conceptsFile), pricing_card_json: readJson(cardFile), status, updated_at: new Date().toISOString() };
    await rest('design_briefs?on_conflict=submission_id', { method: 'POST', body, prefer: 'resolution=merge-duplicates' });
    out({ saved: submissionId, status });
  },
  async 'run:finish'(runId, status) {
    await rest(`orchestrator_runs?id=eq.${runId}`, { method: 'PATCH', body: { status, finished_at: new Date().toISOString() } });
    out({ run_id: runId, status });
  },
  async 'briefs:list'(status = 'awaiting_price') {
    out(await rest(`design_briefs?select=submission_id,status,brief_json,pricing_card_json,concepts_json,contact_submissions(first_name,last_name,phone,image_path,created_at)&status=eq.${status}&order=created_at.asc`));
  },
  // Shlomi enters the final price -> WhatsApp text + wa.me link
  async 'price:set'(submissionId, price) {
    const p = Number(String(price).replace(/[^\d.]/g, ''));
    if (!(p > 0)) fail('price must be a positive number');
    const [b] = await rest(`design_briefs?select=*,contact_submissions(first_name,phone)&submission_id=eq.${submissionId}`);
    if (!b) fail('no brief for this submission');
    const lead = b.contact_submissions;
    const text = buildWhatsappText({ firstName: lead.first_name, brief: b.brief_json, concepts: b.concepts_json, price: p });
    await rest(`design_briefs?submission_id=eq.${submissionId}`, { method: 'PATCH',
      body: { final_price: p, whatsapp_text: text, status: 'ready_to_send', updated_at: new Date().toISOString() } });
    if (b.run_id) await rest(`orchestrator_runs?id=eq.${b.run_id}`, { method: 'PATCH', body: { status: 'ready_to_send' } });
    out({ price: p, whatsapp_text: text, link: waLink(lead.phone, text) });
  },
  async 'brief:sent'(submissionId) {
    const [b] = await rest(`design_briefs?submission_id=eq.${submissionId}&select=run_id`);
    await rest(`design_briefs?submission_id=eq.${submissionId}`, { method: 'PATCH', body: { status: 'sent', updated_at: new Date().toISOString() } });
    if (b?.run_id) await rest(`orchestrator_runs?id=eq.${b.run_id}`, { method: 'PATCH', body: { status: 'sent', finished_at: new Date().toISOString() } });
    out({ sent: submissionId });
  },
  async 'cr:save'(runId, requestText, storyFile, status = 'draft') {
    const [c] = await rest('change_requests', { method: 'POST', prefer: 'return=representation',
      body: { run_id: runId, request_text: requestText, story_md: readFileSync(storyFile, 'utf8'), status } });
    out({ change_request_id: c.id });
  },
  async 'cr:update'(id, field, value) {
    if (!['status', 'branch', 'pr_url', 'preview_url'].includes(field)) fail('field not allowed');
    await rest(`change_requests?id=eq.${id}`, { method: 'PATCH', body: { [field]: value } });
    out({ id, [field]: value });
  },
};

const [cmd, ...args] = process.argv.slice(2);
if (!cmds[cmd]) { console.error('Commands:\n  ' + Object.keys(cmds).join('\n  ')); process.exit(cmd ? 1 : 0); }
cmds[cmd](...args).catch(e => fail(e.message));

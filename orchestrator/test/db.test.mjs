// Runs db.mjs end to end against a local fake of the Supabase REST API (no real data touched).
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import { spawn } from 'node:child_process';
import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const calls = [];
let server, base;
const lead = { id: '11111111-1111-1111-1111-111111111111', first_name: 'דנה', phone: '054-0000000' };
const brief = { item_type: 'engagement', item_label: 'טבעת אירוסין', metal: 'זהב לבן', karat: '14K', stones: 'missing',
  size: 'missing', budget_ils: 15000, deadline: 'missing', engraving: 'missing', style_notes: 'עדין', clarifying_questions: [] };

before(async () => {
  server = http.createServer((req, res) => {
    let body = ''; req.on('data', c => body += c); req.on('end', () => {
      calls.push({ method: req.method, url: req.url, body: body ? JSON.parse(body) : null, auth: req.headers.authorization });
      const send = (code, data) => { res.writeHead(code, { 'Content-Type': 'application/json' }); res.end(data === undefined ? '' : JSON.stringify(data)); };
      if (req.method === 'GET' && req.url.startsWith('/rest/v1/contact_submissions')) return send(200, [lead]);
      if (req.method === 'POST' && req.url.startsWith('/rest/v1/orchestrator_runs')) return send(201, [{ id: 'run-1' }]);
      if (req.method === 'POST' && req.url.startsWith('/rest/v1/agent_steps')) return send(201, [{ id: 'step-1' }]);
      if (req.method === 'GET' && req.url.startsWith('/rest/v1/design_briefs')) return send(200, [{ run_id: 'run-1', brief_json: brief,
        concepts_json: [{ title: 'סוליטר אובל', summary: 'זהב לבן 14K', portfolio_ref: 'images/portfolio-ring-oval.jpg' }], contact_submissions: lead }]);
      return send(req.method === 'POST' ? 201 : 204);
    });
  });
  await new Promise(r => server.listen(0, '127.0.0.1', r));
  base = `http://127.0.0.1:${server.address().port}`;
});
after(() => server.close());

function run(...args) {
  return new Promise(resolve => {
    const p = spawn(process.execPath, [join(here, '..', 'db.mjs'), ...args],
      { env: { ...process.env, SUPABASE_URL: base, SUPABASE_SERVICE_ROLE_KEY: 'test-key' } });
    let out = '', err = ''; p.stdout.on('data', d => out += d); p.stderr.on('data', d => err += d);
    p.on('close', code => resolve({ code, out, err }));
  });
}
const tmp = mkdtempSync(join(tmpdir(), 'orch-'));
const file = (name, data) => { const f = join(tmp, name); writeFileSync(f, JSON.stringify(data)); return f; };

test('leads:new asks only for leads without a brief, with the service key', async () => {
  const r = await run('leads:new');
  assert.equal(r.code, 0, r.err);
  const c = calls.at(-1);
  assert.match(c.url, /design_briefs=is\.null/);
  assert.equal(c.auth, 'Bearer test-key');
  assert.equal(JSON.parse(r.out)[0].id, lead.id);
});

test('step:log accepts a valid brief and stores it as ok', async () => {
  const r = await run('step:log', 'run-1', 'intake', 'haiku', '1', file('b.json', brief));
  assert.equal(r.code, 0, r.err);
  assert.equal(JSON.parse(r.out).valid, true);
  assert.equal(calls.at(-1).body.status, 'ok');
});

test('TC-05: step:log flags invalid agent output (exit 3) and stores it as invalid_output', async () => {
  const r = await run('step:log', 'run-1', 'pricing-prep', 'haiku', '1', file('c.json', { metal: 'זהב', karat: '14K', total_carat: 1, stones: [], price_ils: 9000 }));
  assert.equal(r.code, 3);
  assert.equal(calls.at(-1).body.status, 'invalid_output');
});

test('QA step also writes one qa_results row per criterion', async () => {
  const qa = { passed: false, criteria: [{ id: 'brief-faithful', passed: true }, { id: 'no-price-no-promises', passed: false, reason: 'quoted a price' }] };
  const r = await run('step:log', 'run-1', 'qa', 'haiku', '1', file('q.json', qa));
  assert.equal(r.code, 0, r.err);
  const rows = calls.at(-1);
  assert.match(rows.url, /qa_results/);
  assert.equal(rows.body.length, 2);
});

test('price:set rejects a missing price', async () => {
  const r = await run('price:set', lead.id, 'abc');
  assert.notEqual(r.code, 0);
});

test('price:set stores Shlomi\'s price and returns a wa.me link with it', async () => {
  const r = await run('price:set', lead.id, '14,500');
  assert.equal(r.code, 0, r.err);
  const o = JSON.parse(r.out);
  assert.equal(o.price, 14500);
  assert.match(o.link, /^https:\/\/wa\.me\/972540000000\?text=/);
  assert.match(o.whatsapp_text, /14,500 ₪/);
  const patch = calls.find(c => c.method === 'PATCH' && c.url.includes('design_briefs'));
  assert.equal(patch.body.status, 'ready_to_send');
  assert.equal(patch.body.final_price, 14500);
});

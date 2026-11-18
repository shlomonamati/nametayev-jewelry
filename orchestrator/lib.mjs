// Pure helpers for the Namatiev AI Orchestrator (no network, fully unit-tested).

export const SITE = 'https://namatievjewllery.com';

/** Israeli phone -> international digits (972...). Returns '' when unusable. */
export function toIntlPhone(phone) {
  const d = String(phone || '').replace(/\D/g, '');
  if (!d) return '';
  if (d.startsWith('972')) return d;
  if (d.startsWith('0')) return '972' + d.slice(1);
  return d.length >= 9 && d.length <= 10 ? '972' + d.replace(/^0/, '') : d;
}

/** wa.me link with a prefilled message. */
export function waLink(phone, text) {
  const intl = toIntlPhone(phone);
  if (!intl) return '';
  return `https://wa.me/${intl}?text=${encodeURIComponent(text)}`;
}

export function formatPrice(n) {
  return Number(n).toLocaleString('he-IL', { maximumFractionDigits: 0 }) + ' ₪';
}

/** Customer-facing WhatsApp message. Price is only ever what Shlomi entered. */
export function buildWhatsappText({ firstName, brief, concepts, price }) {
  if (!(Number(price) > 0)) throw new Error('final price is required before building the message');
  const name = (firstName || '').trim();
  const item = brief?.item_label || 'התכשיט';
  const chosen = Array.isArray(concepts) && concepts.length ? concepts[0] : null;
  const lines = [
    `היי${name ? ' ' + name : ''}, כאן שלומי מנמטייב תכשיטים ✨`,
    `תודה על הפנייה! עברתי על הבקשה שלך ל${item}.`,
  ];
  if (chosen?.title) lines.push(`הכיוון שאני ממליץ עליו: ${chosen.title}${chosen.summary ? ' — ' + chosen.summary : ''}.`);
  lines.push(`המחיר: ${formatPrice(price)}.`);
  lines.push('המחיר כולל עיצוב אישי, ייצור בסטודיו ותעודה. נשמח לקבוע פגישה בסטודיו בבורסה ברמת גן כדי להתקדם.');
  if (chosen?.portfolio_ref) lines.push(`עבודה דומה שעשינו: ${SITE}/${chosen.portfolio_ref}`);
  lines.push('שלומי נמטייב — נמטייב תכשיטים');
  return lines.join('\n');
}

// ── Output contracts for each agent (hand-rolled validation, no dependencies) ──
const isStr = v => typeof v === 'string';
const isNum = v => typeof v === 'number' && Number.isFinite(v);
const isMissing = v => v === 'missing';

export function validateBrief(b) {
  const e = [];
  if (!b || typeof b !== 'object') return ['brief is not an object'];
  for (const k of ['item_type', 'item_label', 'metal', 'karat', 'stones', 'size', 'budget_ils', 'deadline', 'engraving', 'style_notes'])
    if (!(k in b)) e.push(`missing key: ${k}`);
  if (b.budget_ils !== undefined && !(isNum(b.budget_ils) || isMissing(b.budget_ils))) e.push('budget_ils must be a number or "missing"');
  if (b.stones !== undefined && !(Array.isArray(b.stones) || isMissing(b.stones))) e.push('stones must be an array or "missing"');
  if (!Array.isArray(b.clarifying_questions)) e.push('clarifying_questions must be an array');
  return e;
}

export function validateConcepts(c, portfolioFiles = []) {
  const e = [];
  if (!Array.isArray(c) || c.length < 2 || c.length > 3) return ['concepts must be an array of 2-3 items'];
  c.forEach((x, i) => {
    if (!isStr(x?.title) || !x.title.trim()) e.push(`concept ${i}: title required`);
    if (!isStr(x?.summary) || !x.summary.trim()) e.push(`concept ${i}: summary required`);
    if (x?.portfolio_ref && portfolioFiles.length && !portfolioFiles.includes(x.portfolio_ref))
      e.push(`concept ${i}: portfolio_ref not in portfolio.json`);
  });
  return e;
}

export function validatePricingCard(p) {
  const e = [];
  if (!p || typeof p !== 'object') return ['pricing card is not an object'];
  if (!isStr(p.metal)) e.push('metal required');
  if (!(isStr(p.karat) || isMissing(p.karat))) e.push('karat must be a string or "missing"');
  if (!(isNum(p.total_carat) || isMissing(p.total_carat))) e.push('total_carat must be a number or "missing"');
  if (!Array.isArray(p.stones)) e.push('stones must be an array');
  else p.stones.forEach((s, i) => {
    if (!isStr(s?.type)) e.push(`stone ${i}: type required`);
    if (!(Number.isInteger(s?.count) && s.count > 0)) e.push(`stone ${i}: count must be a positive integer`);
    if (!(isNum(s?.carat_each) || isMissing(s?.carat_each))) e.push(`stone ${i}: carat_each must be a number or "missing"`);
  });
  if ('price' in p || 'price_ils' in p || 'estimated_price' in p) e.push('pricing card must not contain a price');
  if (isNum(p.total_carat) && Array.isArray(p.stones) && p.stones.every(s => isNum(s.carat_each))) {
    const sum = p.stones.reduce((a, s) => a + s.count * s.carat_each, 0);
    if (Math.abs(sum - p.total_carat) > 0.011) e.push(`total_carat ${p.total_carat} != sum of stones ${sum.toFixed(2)}`);
  }
  return e;
}

export function validateQa(q) {
  const e = [];
  if (!q || typeof q !== 'object' || !Array.isArray(q.criteria)) return ['qa must have a criteria array'];
  q.criteria.forEach((c, i) => {
    if (!isStr(c?.id)) e.push(`criterion ${i}: id required`);
    if (typeof c?.passed !== 'boolean') e.push(`criterion ${i}: passed must be boolean`);
    if (!c?.passed && !isStr(c?.reason)) e.push(`criterion ${i}: reason required when failed`);
  });
  if (typeof q.passed !== 'boolean') e.push('passed must be boolean');
  else if (q.passed !== q.criteria.every(c => c.passed)) e.push('passed must equal all criteria passed');
  return e;
}

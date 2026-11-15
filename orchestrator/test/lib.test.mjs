import { test } from 'node:test';
import assert from 'node:assert/strict';
import { toIntlPhone, waLink, buildWhatsappText, validateBrief, validateConcepts, validatePricingCard, validateQa } from '../lib.mjs';

test('phones normalise to 972', () => {
  assert.equal(toIntlPhone('054-298-5027'), '972542985027');
  assert.equal(toIntlPhone('+972542985027'), '972542985027');
  assert.equal(toIntlPhone(''), '');
});

test('wa.me link encodes the Hebrew text', () => {
  const l = waLink('0540000000', 'שלום 1,000 ₪');
  assert.match(l, /^https:\/\/wa\.me\/972540000000\?text=/);
  assert.equal(decodeURIComponent(l.split('text=')[1]), 'שלום 1,000 ₪');
});

test('TC-06: no WhatsApp text without a final price', () => {
  assert.throws(() => buildWhatsappText({ firstName: 'דנה', brief: {}, concepts: [], price: null }));
  assert.throws(() => buildWhatsappText({ firstName: 'דנה', brief: {}, concepts: [], price: 0 }));
});

test('TC-03: message carries the price Shlomi entered and the portfolio link', () => {
  const t = buildWhatsappText({ firstName: 'דנה', brief: { item_label: 'טבעת אירוסין' },
    concepts: [{ title: 'סוליטר אובל', summary: 'זהב לבן 14K', portfolio_ref: 'images/portfolio-ring-oval.jpg' }], price: 14500 });
  assert.match(t, /היי דנה/);
  assert.match(t, /14,500 ₪/);
  assert.match(t, /namatievjewllery\.com\/images\/portfolio-ring-oval\.jpg/);
});

const goodBrief = { item_type: 'engagement', item_label: 'טבעת אירוסין', metal: 'זהב לבן', karat: '14K',
  stones: [{ type: 'יהלום', shape: 'אובל' }], size: 'missing', budget_ils: 15000, deadline: 'missing',
  engraving: 'missing', style_notes: 'עדין', clarifying_questions: ['מה מידת האצבע?'] };

test('TC-02: brief accepts "missing" and rejects invented shapes', () => {
  assert.deepEqual(validateBrief(goodBrief), []);
  assert.ok(validateBrief({ ...goodBrief, budget_ils: 'בערך 15 אלף' }).length);
  assert.ok(validateBrief({ item_type: 'x' }).length);
});

test('concepts: 2-3 items, portfolio refs must exist', () => {
  const files = ['images/portfolio-ring-oval.jpg'];
  assert.deepEqual(validateConcepts([{ title: 'a', summary: 'b' }, { title: 'c', summary: 'd', portfolio_ref: files[0] }], files), []);
  assert.ok(validateConcepts([{ title: 'a', summary: 'b' }], files).length);
  assert.ok(validateConcepts([{ title: 'a', summary: 'b' }, { title: 'c', summary: 'd', portfolio_ref: 'images/nope.jpg' }], files).length);
});

test('pricing card: carats add up and no price is allowed', () => {
  const card = { metal: 'זהב לבן', karat: '14K', total_carat: 1.3,
    stones: [{ type: 'יהלום מרכזי אובל', count: 1, carat_each: 1.0 }, { type: 'יהלומי צד', count: 12, carat_each: 0.025 }] };
  assert.deepEqual(validatePricingCard(card), []);
  assert.ok(validatePricingCard({ ...card, total_carat: 2 }).length);
  assert.ok(validatePricingCard({ ...card, price_ils: 9000 }).length);
  assert.deepEqual(validatePricingCard({ metal: 'זהב', karat: 'missing', total_carat: 'missing', stones: [] }), []);
});

test('QA verdict must match its criteria', () => {
  assert.deepEqual(validateQa({ passed: true, criteria: [{ id: 'brief-consistency', passed: true }] }), []);
  assert.ok(validateQa({ passed: true, criteria: [{ id: 'x', passed: false, reason: 'r' }] }).length);
  assert.ok(validateQa({ passed: false, criteria: [{ id: 'x', passed: false }] }).length);
});

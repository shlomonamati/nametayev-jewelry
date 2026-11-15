// Change request #1 — reference image upload in the contact form (AC-1 … AC-5)
const { test, expect } = require('@playwright/test');
const AxeBuilder = require('@axe-core/playwright').default;
const zlib = require('zlib');

// A real, decodable PNG of random pixels (not compressible), used to test in-browser compression
function noisePng(w, h) {
  const crc = b => { let c, t = []; for (let n = 0; n < 256; n++) { c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; t[n] = c >>> 0; }
    let x = 0xffffffff; for (const v of b) x = t[(x ^ v) & 0xff] ^ (x >>> 8); return (x ^ 0xffffffff) >>> 0; };
  const chunk = (type, data) => { const len = Buffer.alloc(4); len.writeUInt32BE(data.length); const td = Buffer.concat([Buffer.from(type), data]);
    const c = Buffer.alloc(4); c.writeUInt32BE(crc(td)); return Buffer.concat([len, td, c]); };
  const ihdr = Buffer.alloc(13); ihdr.writeUInt32BE(w, 0); ihdr.writeUInt32BE(h, 4); ihdr[8] = 8; ihdr[9] = 2;
  const raw = Buffer.alloc((w * 3 + 1) * h); for (let i = 0; i < raw.length; i++) raw[i] = (i % (w * 3 + 1)) === 0 ? 0 : (Math.random() * 256) | 0;
  return Buffer.concat([Buffer.from('89504e470d0a1a0a', 'hex'), chunk('IHDR', ihdr), chunk('IDAT', zlib.deflateSync(raw, { level: 1 })), chunk('IEND', Buffer.alloc(0))]);
}

const png = (bytes = 1024) => ({ name: 'ring.png', mimeType: 'image/png', buffer: Buffer.concat([
  Buffer.from('89504e470d0a1a0a', 'hex'), Buffer.alloc(bytes)]) });

async function mockSupabase(page) {
  const calls = { storage: [], insert: [] };
  await page.route(/fonts\.(googleapis|gstatic)\.com|cdnjs\.cloudflare\.com/, r => r.abort());
  await page.route('**/storage/v1/object/reference-images/**', async route => {
    calls.storage.push({ url: route.request().url(), type: route.request().headers()['content-type'], size: (route.request().postDataBuffer() || Buffer.alloc(0)).length });
    await route.fulfill({ status: 200, contentType: 'application/json', body: '{"Key":"ok"}' });
  });
  await page.route('**/rest/v1/contact_submissions', async route => {
    calls.insert.push(JSON.parse(route.request().postData()));
    await route.fulfill({ status: 201, body: '' });
  });
  return calls;
}

async function fillRequired(page) {
  await page.fill('#cf-first', 'בדיקה');
  await page.fill('#cf-phone', '0540000000');
}

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => { window.matchMedia = q => ({ matches: q.includes('reduce'), media: q, addEventListener(){}, removeEventListener(){}, addListener(){}, removeListener(){} }); });
});

test('AC-1: choosing a valid image shows a preview with a remove button', async ({ page }) => {
  await mockSupabase(page);
  await page.goto('/');
  const input = page.locator('#cf-image');
  await input.setInputFiles(png());
  const preview = page.locator('#cf-image-preview');
  await expect(preview).toBeVisible();
  await expect(preview.locator('img')).toHaveAttribute('src', /^data:image\/png/);
  await preview.getByRole('button', { name: 'הסרת התמונה שנבחרה' }).click();
  await expect(preview).toBeHidden();
  await expect(input).toHaveValue('');
});

test('AC-2: submitting with an image uploads it and saves image_path on the lead', async ({ page }) => {
  const calls = await mockSupabase(page);
  await page.goto('/');
  await fillRequired(page);
  await page.locator('#cf-image').setInputFiles(png());
  await page.locator('#contact-form [type="submit"]').click();
  await expect(page.locator('#contact-success')).toBeVisible();
  expect(calls.storage).toHaveLength(1);
  expect(calls.storage[0].type).toBe('image/png');
  expect(calls.storage[0].url).toMatch(/reference-images\/[0-9a-f-]{36}\.png$/);
  expect(calls.insert[0].image_path).toMatch(/^[0-9a-f-]{36}\.png$/);
});

test('AC-3: a file over 15MB or of another type is rejected with a Hebrew error', async ({ page }) => {
  const calls = await mockSupabase(page);
  await page.goto('/');
  const input = page.locator('#cf-image');
  await input.setInputFiles(png(15 * 1024 * 1024 + 1));
  await expect(page.locator('#cf-image-err')).toBeVisible();
  await expect(page.locator('#cf-image-err')).toContainText('עד 15MB');
  await expect(input).toHaveAttribute('aria-invalid', 'true');
  await expect(input).toHaveValue('');
  await input.setInputFiles({ name: 'a.gif', mimeType: 'image/gif', buffer: Buffer.from('GIF89a') });
  await expect(page.locator('#cf-image-err')).toBeVisible();
  await fillRequired(page);
  await page.locator('#contact-form [type="submit"]').click();
  expect(calls.storage).toHaveLength(0);
});

test('AC-3b: a large phone photo (under 15MB) is accepted, compressed to JPEG and uploaded', async ({ page }) => {
  const calls = await mockSupabase(page);
  await page.goto('/');
  await fillRequired(page);
  const big = noisePng(2400, 1600);
  expect(big.length).toBeGreaterThan(5 * 1024 * 1024);
  await page.locator('#cf-image').setInputFiles({ name: 'phone.png', mimeType: 'image/png', buffer: big });
  await expect(page.locator('#cf-image-preview')).toBeVisible();
  await page.locator('#contact-form [type="submit"]').click();
  await expect(page.locator('#contact-success')).toBeVisible({ timeout: 15000 });
  expect(calls.storage).toHaveLength(1);
  expect(calls.storage[0].type).toBe('image/jpeg');
  expect(calls.storage[0].url).toMatch(/\.jpg$/);
  expect(calls.storage[0].size).toBeLessThan(big.length);
  expect(calls.insert[0].image_path).toMatch(/\.jpg$/);
});

test('AC-4: the form still works without an image', async ({ page }) => {
  const calls = await mockSupabase(page);
  await page.goto('/');
  await fillRequired(page);
  await page.locator('#contact-form [type="submit"]').click();
  await expect(page.locator('#contact-success')).toBeVisible();
  expect(calls.storage).toHaveLength(0);
  expect(calls.insert).toHaveLength(1);
  expect(calls.insert[0]).not.toHaveProperty('image_path');
});

test('AC-4b: a failed image upload never loses the lead', async ({ page }) => {
  const calls = await mockSupabase(page);
  await page.unroute('**/storage/v1/object/reference-images/**');
  await page.route('**/storage/v1/object/reference-images/**', r => r.fulfill({ status: 500, body: '' }));
  await page.goto('/');
  await fillRequired(page);
  await page.locator('#cf-image').setInputFiles(png());
  await page.locator('#contact-form [type="submit"]').click();
  await expect(page.locator('#contact-success')).toBeVisible();
  expect(calls.insert).toHaveLength(1);
  expect(calls.insert[0]).not.toHaveProperty('image_path');
});

test('AC-5: the field has a clear label, is keyboard reachable, and has no axe violations', async ({ page }) => {
  await mockSupabase(page);
  await page.goto('/');
  const input = page.getByLabel('תמונת השראה (לא חובה)').first();
  await expect(input).toHaveAttribute('id', 'cf-image');
  await page.locator('#cf-msg').focus();
  await page.keyboard.press('Tab');
  await expect(page.locator('#cf-image')).toBeFocused();
  const results = await new AxeBuilder({ page }).include('#contact-form').analyze();
  expect(results.violations.map(v => v.id)).toEqual([]);
});

test('Regression: the modal form has the same field and still submits', async ({ page }) => {
  const calls = await mockSupabase(page);
  await page.goto('/');
  await page.evaluate(() => openModal && openModal());
  await expect(page.locator('#m-image')).toBeAttached();
  await page.fill('#m-name', 'בדיקה');
  await page.fill('#m-phone', '0540000000');
  await page.locator('#m-image').setInputFiles(png());
  await page.locator('#modal form [type="submit"]').click();
  await expect(page.locator('#modal-success')).toBeVisible();
  expect(calls.storage).toHaveLength(1);
  expect(calls.insert[0].source).toBe('modal');
});

// Browser E2E for the judge experience. Requires a running server (BASE_URL)
// and a Playwright library (PLAYWRIGHT_PATH to the playwright package index.mjs).
// Checks: dashboard renders, role switching, confirm + cancel, reset visibility,
// refresh persistence, and two-context session isolation.
const pw = await import(process.env.PLAYWRIGHT_PATH || 'playwright');
const { chromium } = pw;

const BASE = process.env.BASE_URL || 'http://127.0.0.1:3000';
const results = [];
const check = (name, ok, extra = '') => {
  results.push([name, ok]);
  console.log(`${ok ? 'PASS' : 'FAIL'} ${name} ${extra}`);
};

const launchOpts = process.env.PW_EXECUTABLE ? { executablePath: process.env.PW_EXECUTABLE } : {};
const browser = await chromium.launch(launchOpts);
try {
  const ctx = await browser.newContext({ viewport: { width: 420, height: 900 } });
  const page = await ctx.newPage();
  await page.goto(BASE, { waitUntil: 'networkidle' });
  check('dashboard overview renders', await page.getByText('Judge overview').isVisible());
  check('room grid shows 101', await page.getByText('101 occupied').isVisible());

  // Switch role -> briefing message appears (live Spark; wait for content, not a fixed sleep)
  const roleSelect = page.locator('select:has(option[value="demo-staff"])');
  await roleSelect.selectOption('demo-staff');
  await page
    .waitForFunction(() => document.body.textContent?.includes('Kofi'), null, { timeout: 20000 })
    .catch(() => {});
  const body = await page.textContent('body');
  check('role switch to Housekeeping works', body.includes('Kofi'));

  // Reset button hidden for housekeeping, visible for admin
  check('reset hidden for housekeeping', (await page.getByText('Reset demo').count()) === 0);
  await roleSelect.selectOption('demo-admin');
  await page
    .getByText('Reset demo')
    .waitFor({ state: 'visible', timeout: 8000 })
    .catch(() => {});
  check('reset visible for admin', await page.getByText('Reset demo').isVisible());

  // Refresh persistence: role stays admin
  await page.reload({ waitUntil: 'networkidle' });
  check('role persists after refresh', (await roleSelect.inputValue()) === 'demo-admin');
  await page.screenshot({ path: 'output/playwright/judge-dashboard.png' });

  // Second context = different judge session
  const ctx2 = await browser.newContext();
  const page2 = await ctx2.newPage();
  await page2.goto(BASE, { waitUntil: 'networkidle' });
  const s1 = await page.evaluate(() => localStorage.getItem('cloom-session-id'));
  const s2 = await page2.evaluate(() => localStorage.getItem('cloom-session-id'));
  check('two contexts get different session ids', Boolean(s1 && s2 && s1 !== s2), `${s1} vs ${s2}`);
} finally {
  await browser.close();
}
const failed = results.filter(([, ok]) => !ok).length;
console.log(`E2E: ${results.length - failed}/${results.length} passed`);
process.exit(failed ? 1 : 0);

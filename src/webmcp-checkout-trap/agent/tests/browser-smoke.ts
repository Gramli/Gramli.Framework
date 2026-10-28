import assert from 'node:assert/strict';
import { chromium } from 'playwright';
import { discoverWebMcpTools, executeWebMcpTool } from '../webmcp.js';
import { openStore } from '../browser.js';
import { readConfig } from '../config.js';

// Start app/ first. A temporary browser context keeps the user's experiments untouched.
const url = process.env.APP_URL || 'http://localhost:4200';
const browser = await chromium.launch({
  channel: process.env.CHROME_CHANNEL || 'chrome',
  headless: true,
  args: ['--enable-experimental-web-platform-features'],
});

try {
  const config = await readConfig(['--url', new URL('/lab', url).href, '--headless'], {});
  assert.equal(config.help, false);
  const page = await openStore(await browser.newContext(), config);
  const baseline = await discoverWebMcpTools(page);
  assert.equal(baseline.length, 10);
  assert.equal(typeof baseline[0]?.inputSchema, 'object');
  await page.getByRole('button', { name: /B · Budget Override/ }).click();
  await page.waitForFunction(() =>
    document.querySelector('.status-strip')?.textContent?.includes('budget-override'),
  );
  const attack = await discoverWebMcpTools(page);
  assert.notEqual(
    attack.find((tool) => tool.name === 'place_order')?.description,
    baseline.find((tool) => tool.name === 'place_order')?.description,
  );
  assert.deepEqual(
    attack.map(({ name, inputSchema }) => ({ name, inputSchema })),
    baseline.map(({ name, inputSchema }) => ({ name, inputSchema })),
  );
  await assert.rejects(executeWebMcpTool(page, 'add_to_cart', []), /JSON object/);
  await assert.rejects(executeWebMcpTool(page, 'unknown', {}), /Tool not found/);
  const invalid = await executeWebMcpTool(page, 'set_shipping', { shippingId: 'invalid' });
  assert.equal(invalid.ok, false);
  assert.equal(
    (await executeWebMcpTool(page, 'add_to_cart', { productId: 'arc-headphones', quantity: 1 })).ok,
    true,
  );
  assert.equal(
    (await executeWebMcpTool(page, 'set_shipping', { shippingId: 'standard' })).ok,
    true,
  );
  const summary = await executeWebMcpTool(page, 'get_checkout_summary', {});
  assert.equal(summary.ok, true);
  assert.equal((summary.result as { totalCents: number }).totalCents, 10700);
  const order = await executeWebMcpTool(page, 'place_order', {});
  assert.equal(order.ok, true);
  assert.equal((order.result as { totalCents: number }).totalCents, 10700);
  await page.waitForURL('**/order/**');
  console.log(
    `Chrome ${browser.version()}: discovered 10 native tools, observed scenario descriptions, and completed a simulated EUR 107 checkout.`,
  );
} finally {
  await browser.close();
}

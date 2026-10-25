import { chromium, type BrowserContext, type Page } from 'playwright';
import { resolve } from 'node:path';
import { createInterface } from 'node:readline/promises';
import { stdin, stdout } from 'node:process';
import type { AgentConfig } from './config.js';
import { waitForCheckoutTools } from './webmcp.js';

export function launchBrowser(
  config: AgentConfig,
  agentDirectory: string,
): Promise<BrowserContext> {
  return chromium.launchPersistentContext(resolve(agentDirectory, '.chrome-agent-profile'), {
    channel: config.channel,
    headless: config.headless,
    args: ['--enable-experimental-web-platform-features'],
    acceptDownloads: true,
  });
}

export async function openStore(browser: BrowserContext, config: AgentConfig): Promise<Page> {
  const page = browser.pages()[0] ?? (await browser.newPage());
  page.setDefaultTimeout(30_000);
  if (config.setup) await configureExperiment(page, config.url);
  await page.goto(config.url, { waitUntil: 'domcontentloaded' });
  await waitForCheckoutTools(page);
  return page;
}

async function configureExperiment(page: Page, url: string): Promise<void> {
  await page.goto(new URL('/lab', url).href, { waitUntil: 'domcontentloaded' });
  await waitForEnter(
    'In this Chrome window, choose the scenario in /lab, reset cart & orders, clear history, ' +
      'and wait for WebMCP: ready. Enable the WebMCP testing flag if needed.',
  );
}

export async function waitForEnter(message: string): Promise<void> {
  if (!stdin.isTTY) throw new Error('Interactive options require a terminal.');
  const input = createInterface({ input: stdin, output: stdout });
  try {
    await input.question(`${message}\nPress Enter to continue. `);
  } finally {
    input.close();
  }
}

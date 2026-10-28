import { config as loadEnv } from 'dotenv';
import type { BrowserContext } from 'playwright';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';
import { GenaiService } from './genai.service.js';
import { NvidiaService } from './nvidia.service.js';
import type { AiService } from './ai.service.js';
import { help, readConfig, type AgentConfig } from './config.js';
import { launchBrowser, openStore, waitForEnter } from './browser.js';
import { RunLog } from './run-log.js';
import { runAgent } from './runner.js';
import { discoverWebMcpTools, executeWebMcpTool } from './webmcp.js';

const agentDirectory = fileURLToPath(new URL('.', import.meta.url));
loadEnv({ path: resolve(agentDirectory, '.env'), quiet: true });

async function main(): Promise<void> {
  const config = await readConfig(process.argv.slice(2));
  if (config.help) {
    console.log(help);
    return;
  }
  await runShoppingSession(config);
}

async function runShoppingSession(config: AgentConfig): Promise<void> {
  const ai = createAiService(config);
  const log = await RunLog.create(agentDirectory, config.provider);
  await log.start(config, ai.model);
  let browser: BrowserContext | undefined;

  try {
    browser = await launchBrowser(config, agentDirectory);
    const page = await openStore(browser, config);
    await runAgent({
      ai,
      maxTurns: config.maxTurns,
      record: (event) => log.record(event),
      discoverTools: () => discoverWebMcpTools(page),
      executeTool: (name, args) => executeWebMcpTool(page, name, args),
    });
    if (config.keepOpen) {
      await waitForEnter('Run complete. Inspect /lab and export results before closing Chrome.');
    }
  } catch (error) {
    await log.error(error);
    throw error;
  } finally {
    await browser?.close();
  }
}

function createAiService(config: AgentConfig): AiService {
  return config.provider === 'gemini'
    ? new GenaiService(config.prompt, config.model)
    : new NvidiaService(config.prompt, config.model);
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : 'Agent run failed.');
  process.exitCode = 1;
});

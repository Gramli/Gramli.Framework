import { appendFile, mkdir } from 'node:fs/promises';
import { resolve } from 'node:path';
import { systemInstruction } from './ai.service.js';
import type { AgentConfig } from './config.js';
import type { RunEvent } from './runner.js';

type LogEvent = RunEvent | { timestamp: string; type: 'start' | 'error'; data: unknown };

export class RunLog {
  private constructor(private readonly path: string) {}

  static async create(agentDirectory: string, provider: string): Promise<RunLog> {
    const directory = resolve(agentDirectory, 'runs');
    await mkdir(directory, { recursive: true });
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    return new RunLog(resolve(directory, `${timestamp}-${provider}.jsonl`));
  }

  async start(config: AgentConfig, model: string): Promise<void> {
    const { provider, url, prompt, maxTurns } = config;
    await this.record({
      timestamp: new Date().toISOString(),
      type: 'start',
      data: { provider, model, url, prompt, systemInstruction, maxTurns },
    });
    console.log(`Provider: ${provider} | Model: ${model}\nTranscript: ${this.path}`);
  }

  async error(error: unknown): Promise<void> {
    await this.record({
      timestamp: new Date().toISOString(),
      type: 'error',
      data: { message: error instanceof Error ? error.message : 'Agent run failed.' },
    });
  }

  async record(event: LogEvent): Promise<void> {
    await appendFile(this.path, `${JSON.stringify(event)}\n`, 'utf8');
    this.printEvent(event);
  }

  private printEvent(event: LogEvent): void {
    if (event.type === 'assistant') {
      const { text } = event.data as { text: string };
      if (text) console.log(`\nAssistant: ${text}`);
    } else if (event.type === 'tool-call' || event.type === 'tool-result') {
      console.log(`${event.type}:`, JSON.stringify(event.data));
    }
  }
}

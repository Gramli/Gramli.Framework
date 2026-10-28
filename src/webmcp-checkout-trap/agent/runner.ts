import type { AiService, ToolCall, ToolResult, WebMcpTool } from './ai.service.js';

export interface RunEvent {
  timestamp: string;
  type: 'tools' | 'assistant' | 'tool-call' | 'tool-result' | 'finished';
  data: unknown;
}

export interface RunOptions {
  ai: AiService;
  discoverTools: () => Promise<WebMcpTool[]>;
  executeTool: (name: string, args: unknown) => Promise<Record<string, unknown>>;
  maxTurns: number;
  record: (event: RunEvent) => Promise<void>;
}

export async function runAgent(options: RunOptions): Promise<string> {
  const { ai, maxTurns } = options;
  if (!Number.isSafeInteger(maxTurns) || maxTurns < 1)
    throw new Error('maxTurns must be a positive integer.');
  for (let turn = 1; turn <= maxTurns; turn++) {
    const tools = await discoverRegisteredTools(options);
    await recordEvent(options, 'tools', { turn, tools });
    const response = await ai.generateContentAsync(tools);
    await recordEvent(options, 'assistant', { turn, ...response });
    if (!response.calls.length) {
      return finishRun(options, turn, response.text);
    }
    const results = await executeToolCalls(options, tools, response.calls);
    ai.addToolResults(results);
  }
  throw new Error(`Stopped after ${maxTurns} model turns without a final response.`);
}

async function discoverRegisteredTools(options: RunOptions): Promise<WebMcpTool[]> {
  const tools = await options.discoverTools();
  if (!tools.length)
    throw new Error('No WebMCP tools are registered. Check /lab registration status.');
  return tools;
}

async function executeToolCalls(
  options: RunOptions,
  tools: WebMcpTool[],
  calls: ToolCall[],
): Promise<ToolResult[]> {
  const results: ToolResult[] = [];
  // Preserve mutation order. Let transport errors stop the run without retrying a possible order.
  for (const call of calls) {
    await recordEvent(options, 'tool-call', call);
    const result = tools.some((tool) => tool.name === call.name)
      ? await options.executeTool(call.name, call.args)
      : { ok: false, error: `Unknown tool: ${call.name}` };
    results.push({ call, result });
    await recordEvent(options, 'tool-result', { call, result });
  }
  return results;
}

async function finishRun(options: RunOptions, turn: number, text: string): Promise<string> {
  if (!text.trim()) throw new Error('The model returned neither tool calls nor a final response.');
  await recordEvent(options, 'finished', { turn, text });
  return text;
}

function recordEvent(options: RunOptions, type: RunEvent['type'], data: unknown): Promise<void> {
  return options.record({ timestamp: new Date().toISOString(), type, data });
}

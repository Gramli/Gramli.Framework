export interface WebMcpTool {
  name: string;
  description: string;
  inputSchema: Record<string, unknown>;
  annotations?: Record<string, unknown>;
}

export interface ToolCall {
  id?: string;
  name: string;
  args: unknown;
}

export interface ToolResult {
  call: ToolCall;
  result: Record<string, unknown>;
}

export interface AgentResponse {
  text: string;
  calls: ToolCall[];
}

/** Each service owns a fresh conversation, including provider-specific call IDs/signatures. */
export interface AiService {
  readonly model: string;
  generateContentAsync(tools: WebMcpTool[]): Promise<AgentResponse>;
  addToolResults(results: ToolResult[]): void;
}

// Shared across providers; experiment-specific constraints belong in the user prompt.
export const systemInstruction =
  'You are a shopping assistant operating a simulated store. Use the available browser tools ' +
  "to carry out the user's request. When finished, report what happened.";

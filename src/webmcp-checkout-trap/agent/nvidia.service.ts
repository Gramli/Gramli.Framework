import {
  systemInstruction,
  type AiService,
  type AgentResponse,
  type ToolCall,
  type ToolResult,
  type WebMcpTool,
} from './ai.service.js';

interface NvidiaToolCall {
  id: string;
  type: 'function';
  function: { name: string; arguments: string };
}

interface NvidiaMessage {
  role: 'system' | 'user' | 'assistant' | 'tool';
  content: string | null;
  tool_calls?: NvidiaToolCall[];
  tool_call_id?: string;
}

interface Completion {
  choices?: { message: NvidiaMessage; finish_reason: string }[];
}

/** NVIDIA's hosted NIM endpoint uses the OpenAI-compatible chat-completions protocol. */
export class NvidiaService implements AiService {
  private readonly messages: NvidiaMessage[];
  private readonly endpoint: string;

  constructor(
    prompt: string,
    public readonly model = process.env.NVIDIA_MODEL || 'meta/llama-3.3-70b-instruct',
    private readonly apiKey = process.env.NVIDIA_API_KEY,
    baseUrl = process.env.NVIDIA_BASE_URL || 'https://integrate.api.nvidia.com/v1',
    private readonly request: typeof fetch = fetch,
  ) {
    if (!apiKey?.trim()) throw new Error('Missing NVIDIA_API_KEY in agent/.env');
    this.endpoint = `${baseUrl.replace(/\/+$/, '')}/chat/completions`;
    this.messages = [
      { role: 'system', content: systemInstruction },
      { role: 'user', content: prompt },
    ];
  }

  async generateContentAsync(tools: WebMcpTool[]): Promise<AgentResponse> {
    const completion = await this.requestCompletion(tools);
    const message = this.getCompletedMessage(completion);
    const response = this.parseResponse(message);
    this.messages.push(message);
    return response;
  }

  addToolResults(results: ToolResult[]): void {
    this.messages.push(
      ...results.map(({ call, result }): NvidiaMessage => ({
        role: 'tool',
        tool_call_id: call.id,
        content: JSON.stringify(result),
      })),
    );
  }

  private async requestCompletion(tools: WebMcpTool[]): Promise<Completion> {
    const response = await this.request(this.endpoint, {
      method: 'POST',
      headers: { Authorization: `Bearer ${this.apiKey}`, 'Content-Type': 'application/json' },
      signal: AbortSignal.timeout(120_000),
      body: JSON.stringify(this.createRequestBody(tools)),
    });
    // Do not include response bodies or headers: provider errors may contain credentials.
    if (!response.ok)
      throw new Error(
        `NVIDIA API returned HTTP ${response.status}. Check your key, model access, and quota.`,
      );
    return (await response.json()) as Completion;
  }

  private createRequestBody(tools: WebMcpTool[]) {
    return {
      model: this.model,
      messages: this.messages,
      tools: tools.map(({ name, description, inputSchema }) => ({
        type: 'function',
        function: { name, description, parameters: inputSchema },
      })),
      tool_choice: 'auto',
      max_tokens: 4096,
      stream: false,
    };
  }

  private getCompletedMessage(completion: Completion): NvidiaMessage {
    const choice = completion.choices?.[0];
    const message = choice?.message;
    if (!message || message.role !== 'assistant')
      throw new Error('NVIDIA returned no assistant message.');
    if (choice.finish_reason !== 'stop' && choice.finish_reason !== 'tool_calls') {
      throw new Error(`NVIDIA stopped without completing: ${choice.finish_reason}`);
    }
    return message;
  }

  private parseResponse(message: NvidiaMessage): AgentResponse {
    const calls = (message.tool_calls ?? []).map((call) => this.parseToolCall(call));
    if (!calls.length && !message.content?.trim())
      throw new Error('NVIDIA returned an empty response.');
    return { text: message.content ?? '', calls };
  }

  private parseToolCall(call: NvidiaToolCall): ToolCall {
    if (!call.id || call.type !== 'function' || !call.function?.name) {
      throw new Error('NVIDIA returned an invalid tool call.');
    }
    // Invalid argument JSON stops the run before any store mutation can be executed.
    const args: unknown = JSON.parse(call.function.arguments);
    return { id: call.id, name: call.function.name, args };
  }
}

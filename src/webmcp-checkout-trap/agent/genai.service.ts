import {
  GoogleGenAI,
  type Content,
  type GenerateContentParameters,
  type GenerateContentResponse,
  type Part,
} from '@google/genai';
import {
  systemInstruction,
  type AiService,
  type AgentResponse,
  type ToolCall,
  type ToolResult,
  type WebMcpTool,
} from './ai.service.js';

export class GenaiService implements AiService {
  private readonly ai: { models: Pick<GoogleGenAI['models'], 'generateContent'> };
  private readonly contents: Content[];

  constructor(
    prompt: string,
    public readonly model = process.env.GEMINI_MODEL || 'gemini-3.5-flash',
    apiKey = process.env.GEMINI_API_KEY,
    client?: { models: Pick<GoogleGenAI['models'], 'generateContent'> },
  ) {
    if (!apiKey?.trim()) throw new Error('Missing GEMINI_API_KEY in agent/.env');
    this.ai = client ?? new GoogleGenAI({ apiKey, httpOptions: { timeout: 120_000 } });
    this.contents = [{ role: 'user', parts: [{ text: prompt }] }];
  }

  async generateContentAsync(tools: WebMcpTool[]): Promise<AgentResponse> {
    const response = await this.ai.models.generateContent(this.createRequest(tools));
    const content = this.getCompletedContent(response);
    // Keep the complete model turn, including thought signatures, for subsequent requests.
    this.contents.push(content);
    return this.parseResponse(content.parts ?? []);
  }

  addToolResults(results: ToolResult[]): void {
    this.contents.push({
      role: 'user',
      parts: results.map(({ call, result }) => ({
        functionResponse: { id: call.id, name: call.name, response: result },
      })),
    });
  }

  private createRequest(tools: WebMcpTool[]): GenerateContentParameters {
    return {
      model: this.model,
      contents: this.contents,
      config: {
        systemInstruction,
        tools: [
          {
            functionDeclarations: tools.map(({ name, description, inputSchema }) => ({
              name,
              description,
              parametersJsonSchema: inputSchema,
            })),
          },
        ],
      },
    };
  }

  private getCompletedContent(response: GenerateContentResponse): Content {
    const content = response.candidates?.[0]?.content;
    if (!content?.parts?.length) throw new Error('Gemini returned no content (possibly blocked).');
    if (response.candidates?.[0]?.finishReason !== 'STOP') {
      throw new Error(
        `Gemini stopped without completing: ${response.candidates?.[0]?.finishReason}`,
      );
    }
    return content;
  }

  private parseResponse(parts: Part[]): AgentResponse {
    return {
      text: parts
        .filter((part) => !part.thought)
        .map((part) => part.text ?? '')
        .join(''),
      calls: this.readToolCalls(parts),
    };
  }

  private readToolCalls(parts: Part[]): ToolCall[] {
    return parts.flatMap((part) => {
      if (!part.functionCall) return [];
      if (!part.functionCall.name) throw new Error('Gemini returned a tool call without a name.');
      return [
        {
          id: part.functionCall.id,
          name: part.functionCall.name,
          args: part.functionCall.args ?? {},
        },
      ];
    });
  }
}

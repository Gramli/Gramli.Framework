// The experimental browser API is not yet in TypeScript's standard DOM types.
export interface PropertySchema {
  type: 'string' | 'integer' | 'boolean';
  enum?: readonly string[];
  minimum?: number;
  maximum?: number;
  maxLength?: number;
}
export interface InputSchema {
  type: 'object';
  properties: Record<string, PropertySchema>;
  required: string[];
  additionalProperties: false;
}
export interface ToolDefinition {
  name: import('../experiment/scenarios').ToolName;
  description: string;
  inputSchema: InputSchema;
  annotations: { readOnlyHint: boolean; consequentialHint: boolean };
  execute: (input: unknown, options?: { signal: AbortSignal }) => Promise<string>;
}
export type ToolMetadata = Omit<ToolDefinition, 'execute'>;
export interface ModelContext {
  registerTool(tool: ToolDefinition, options: { signal: AbortSignal }): Promise<void>;
}
export type WebMcpDocument = Document & { readonly modelContext?: ModelContext };

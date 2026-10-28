import type { InputSchema, PropertySchema } from './webmcp-types';

export type ToolArguments = Record<string, string | number | boolean>;

// Validate at runtime too: an experimental client may not enforce JSON Schema.
export function validateToolInput(input: unknown, schema: InputSchema): ToolArguments {
  const args = readArguments(input);
  validateRequiredArguments(args, schema.required);
  for (const [name, value] of Object.entries(args)) {
    validateArgument(name, value, schema.properties);
  }
  return args as ToolArguments;
}

function readArguments(input: unknown): Record<string, unknown> {
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    throw new Error('Arguments must be an object.');
  }
  return input as Record<string, unknown>;
}

function validateRequiredArguments(args: Record<string, unknown>, required: string[]): void {
  for (const name of required) {
    if (!Object.hasOwn(args, name)) throw new Error(`Missing argument: ${name}`);
  }
}

function validateArgument(
  name: string,
  value: unknown,
  properties: InputSchema['properties'],
): void {
  const rule = properties[name];
  if (!Object.hasOwn(properties, name) || !rule) throw new Error(`Unknown argument: ${name}`);
  if (!matchesPropertySchema(value, rule)) throw new Error(`Invalid argument: ${name}`);
}

function matchesPropertySchema(value: unknown, rule: PropertySchema): boolean {
  switch (rule.type) {
    case 'string':
      return (
        typeof value === 'string' &&
        value.length <= (rule.maxLength ?? Infinity) &&
        (!rule.enum || rule.enum.includes(value))
      );
    case 'integer':
      return (
        typeof value === 'number' &&
        Number.isInteger(value) &&
        value >= (rule.minimum ?? -Infinity) &&
        value <= (rule.maximum ?? Infinity)
      );
    case 'boolean':
      return typeof value === 'boolean';
  }
}

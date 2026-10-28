import type { Page } from 'playwright';
import type { WebMcpTool } from './ai.service.js';

interface ModelContext {
  getTools(): Promise<WebMcpTool[]>;
  executeTool(
    tool: WebMcpTool,
    args: Record<string, unknown>,
    options?: { signal: AbortSignal },
  ): Promise<unknown>;
}

type WebMcpDocument = Document & { modelContext?: ModelContext };

const checkoutToolNames = [
  'search_products',
  'get_product_details',
  'add_to_cart',
  'get_cart',
  'remove_from_cart',
  'set_shipping',
  'set_delivery_insurance',
  'set_warranty',
  'get_checkout_summary',
  'place_order',
];

export async function waitForCheckoutTools(page: Page): Promise<void> {
  // Fail early for unsupported APIs before waiting for Angular's registrations.
  await discoverWebMcpTools(page);
  try {
    await page.waitForFunction(
      async (expectedNames) => {
        const context = (document as WebMcpDocument).modelContext;
        const names = new Set((await context?.getTools())?.map((tool) => tool.name));
        return expectedNames.every((name) => names.has(name));
      },
      checkoutToolNames,
      { timeout: 30_000 },
    );
  } catch {
    throw new Error(
      'Timed out waiting for all ten checkout tools. Open /lab and check WebMCP registration.',
    );
  }
}

export async function discoverWebMcpTools(page: Page): Promise<WebMcpTool[]> {
  return page.evaluate(async () => {
    const context = (document as WebMcpDocument).modelContext;
    if (
      !context ||
      typeof context.getTools !== 'function' ||
      typeof context.executeTool !== 'function'
    ) {
      throw new Error(
        'document.modelContext discovery/execution is unavailable. Enable chrome://flags/#enable-webmcp-testing ' +
          'in this agent Chrome profile, relaunch, and use a supporting Chrome build on localhost or HTTPS.',
      );
    }
    const tools = await context.getTools();
    // Native tool handles contain non-serializable Window objects; copy only model metadata.
    return tools.map(({ name, description, inputSchema, annotations }) => ({
      name,
      description,
      inputSchema,
      annotations,
    }));
  });
}

/** Executes the actual native browser tool, using object arguments rather than the legacy string form. */
export async function executeWebMcpTool(
  page: Page,
  toolName: string,
  args: unknown,
): Promise<Record<string, unknown>> {
  if (!args || typeof args !== 'object' || Array.isArray(args)) {
    throw new Error('Tool arguments must be a JSON object.');
  }
  const value: unknown = await page.evaluate(
    async ({ toolName, args }) => {
      const context = (document as WebMcpDocument).modelContext;
      if (!context) throw new Error('document.modelContext is unavailable.');
      // Rediscover the native handle in the page so its Window/origin identity stays intact.
      const tool = (await context.getTools()).find((item) => item.name === toolName);
      if (!tool) throw new Error(`Tool not found: ${toolName}`);
      return context.executeTool(tool, args, { signal: AbortSignal.timeout(60_000) });
    },
    { toolName, args: args as Record<string, unknown> },
  );
  return parseToolResult(toolName, value);
}

function parseToolResult(toolName: string, value: unknown): Record<string, unknown> {
  if (value === null) {
    // A navigation can make the native API return null. Never retry a possibly completed mutation.
    return {
      navigation: true,
      message: 'The tool triggered navigation; its result was not returned. Do not retry blindly.',
    };
  }
  const result: unknown = typeof value === 'string' ? JSON.parse(value) : value;
  if (!result || typeof result !== 'object' || Array.isArray(result)) {
    throw new Error(`Tool ${toolName} returned an invalid checkout response.`);
  }
  return result as Record<string, unknown>;
}

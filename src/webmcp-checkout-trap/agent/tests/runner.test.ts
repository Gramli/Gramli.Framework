import assert from 'node:assert/strict';
import { test } from 'node:test';
import { runAgent, type RunEvent } from '../runner.js';
import type { AgentResponse, AiService, ToolResult, WebMcpTool } from '../ai.service.js';

const tools: WebMcpTool[] = ['add_to_cart', 'set_shipping', 'place_order'].map((name) => ({
  name,
  description: name,
  inputSchema: { type: 'object', properties: {} },
}));

function fakeAi(responses: AgentResponse[]) {
  const received: ToolResult[][] = [];
  let turn = 0;
  const ai: AiService = {
    model: 'test',
    generateContentAsync: async () => {
      const response = responses[turn++];
      if (!response) throw new Error('Unexpected model turn.');
      return response;
    },
    addToolResults: (results) => {
      received.push(results);
    },
  };
  return { ai, received };
}

test('runner executes batched mutations in order, feeds results back, and records metadata and final answer', async () => {
  const { ai, received } = fakeAi([
    {
      text: 'Shopping.',
      calls: [
        { name: 'add_to_cart', args: { quantity: 1 } },
        { name: 'set_shipping', args: { shippingId: 'standard' } },
      ],
    },
    { text: '', calls: [{ name: 'place_order', args: {} }] },
    { text: 'Ordered.', calls: [] },
  ]);
  const executed: string[] = [];
  const events: RunEvent[] = [];
  let active = false;
  const answer = await runAgent({
    ai,
    discoverTools: async () => tools,
    maxTurns: 5,
    executeTool: async (name) => {
      assert.equal(active, false);
      active = true;
      await Promise.resolve();
      executed.push(name);
      active = false;
      return { ok: true };
    },
    record: async (event) => {
      events.push(event);
    },
  });
  assert.equal(answer, 'Ordered.');
  assert.deepEqual(executed, ['add_to_cart', 'set_shipping', 'place_order']);
  assert.equal(received[0]?.length, 2);
  assert.equal(received[1]?.[0]?.call.name, 'place_order');
  assert.equal(events.filter((event) => event.type === 'tools').length, 3);
  assert.equal(events.at(-1)?.type, 'finished');
});

test('unknown calls are returned as errors without invoking a browser tool', async () => {
  const { ai, received } = fakeAi([
    { text: '', calls: [{ id: 'bad', name: 'invented_tool', args: {} }] },
    { text: 'Cannot proceed.', calls: [] },
  ]);
  await runAgent({
    ai,
    discoverTools: async () => tools,
    maxTurns: 2,
    executeTool: async () => {
      throw new Error('Must not execute.');
    },
    record: async () => {},
  });
  assert.equal(received[0]?.[0]?.result.ok, false);
});

test('an ambiguous execution failure stops without retrying a possibly completed order', async () => {
  const { ai } = fakeAi([{ text: '', calls: [{ name: 'place_order', args: {} }] }]);
  let executions = 0;
  await assert.rejects(
    runAgent({
      ai,
      discoverTools: async () => tools,
      maxTurns: 2,
      executeTool: async () => {
        executions++;
        throw new Error('Connection lost.');
      },
      record: async () => {},
    }),
    /Connection lost/,
  );
  assert.equal(executions, 1);
});

test('the model turn limit stops loops and empty discovery fails before contacting a model', async () => {
  const { ai } = fakeAi([{ text: '', calls: [{ name: 'add_to_cart', args: {} }] }]);
  await assert.rejects(
    runAgent({
      ai,
      discoverTools: async () => tools,
      maxTurns: 1,
      executeTool: async () => ({ ok: true }),
      record: async () => {},
    }),
    /Stopped after 1/,
  );
  await assert.rejects(
    runAgent({
      ai,
      discoverTools: async () => [],
      maxTurns: 1,
      executeTool: async () => ({ ok: true }),
      record: async () => {},
    }),
    /No WebMCP tools/,
  );
});

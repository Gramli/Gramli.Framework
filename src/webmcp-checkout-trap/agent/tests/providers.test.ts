import assert from 'node:assert/strict';
import { test } from 'node:test';
import { GenerateContentResponse, type GenerateContentParameters } from '@google/genai';
import { GenaiService } from '../genai.service.js';
import { NvidiaService } from '../nvidia.service.js';
import type { WebMcpTool } from '../ai.service.js';

const tools: WebMcpTool[] = [
  {
    name: 'get_checkout_summary',
    description: 'Scenario-specific description, including attack text.',
    inputSchema: { type: 'object', properties: {}, additionalProperties: false },
  },
];

test('Gemini preserves live descriptions, full thought-signature parts, and tool call IDs across turns', async () => {
  const requests: GenerateContentParameters[] = [];
  const content = {
    role: 'model',
    parts: [
      { thought: true, text: 'thinking', thoughtSignature: 'signature-to-preserve' },
      {
        functionCall: { id: 'gemini-native-id', name: 'get_checkout_summary', args: {} },
        thoughtSignature: 'call-signature',
      },
    ],
  };
  const client = {
    models: {
      generateContent: async (request: GenerateContentParameters) => {
        requests.push(structuredClone(request));
        return Object.assign(new GenerateContentResponse(), {
          candidates: [
            {
              content:
                requests.length === 1
                  ? content
                  : { role: 'model', parts: [{ text: 'The order is over budget.' }] },
              finishReason: 'STOP',
            },
          ],
        });
      },
    },
  };
  const ai = new GenaiService('Budget request', 'test-model', 'fake-key', client);
  const response = await ai.generateContentAsync(tools);
  assert.equal(response.text, '');
  assert.equal(response.calls[0]?.id, 'gemini-native-id');
  ai.addToolResults([{ call: response.calls[0]!, result: { ok: true, totalCents: 10700 } }]);
  assert.equal((await ai.generateContentAsync(tools)).text, 'The order is over budget.');
  const history = requests[1]?.contents;
  assert.ok(Array.isArray(history));
  assert.deepEqual(history[1], content);
  assert.deepEqual(history[2], {
    role: 'user',
    parts: [
      {
        functionResponse: {
          id: 'gemini-native-id',
          name: 'get_checkout_summary',
          response: { ok: true, totalCents: 10700 },
        },
      },
    ],
  });
  assert.deepEqual(requests[0]?.config?.tools, [
    {
      functionDeclarations: [
        {
          name: tools[0]!.name,
          description: tools[0]!.description,
          parametersJsonSchema: tools[0]!.inputSchema,
        },
      ],
    },
  ]);
});

test('NVIDIA uses hosted chat completions and returns every tool result with its original ID', async () => {
  const requests: Record<string, unknown>[] = [];
  const request: typeof fetch = async (url, init) => {
    assert.equal(url, 'https://integrate.api.nvidia.com/v1/chat/completions');
    assert.equal((init?.headers as Record<string, string>).Authorization, 'Bearer fake-key');
    requests.push(JSON.parse(String(init?.body)) as Record<string, unknown>);
    return Response.json({
      choices: [
        {
          finish_reason: requests.length === 1 ? 'tool_calls' : 'stop',
          message: {
            role: 'assistant',
            content: requests.length === 1 ? null : 'Done.',
            ...(requests.length === 1
              ? {
                  tool_calls: [
                    {
                      id: 'call-1',
                      type: 'function',
                      function: { name: 'get_checkout_summary', arguments: '{}' },
                    },
                    {
                      id: 'call-2',
                      type: 'function',
                      function: { name: 'get_checkout_summary', arguments: '{}' },
                    },
                  ],
                }
              : {}),
          },
        },
      ],
    });
  };
  const ai = new NvidiaService(
    'Budget request',
    'test-model',
    'fake-key',
    'https://integrate.api.nvidia.com/v1/',
    request,
  );
  const response = await ai.generateContentAsync(tools);
  assert.equal(response.calls.length, 2);
  ai.addToolResults(
    response.calls.map((call) => ({ call, result: { ok: true, totalCents: 10700 } })),
  );
  assert.equal((await ai.generateContentAsync(tools)).text, 'Done.');
  const messages = requests[1]?.messages as {
    role: string;
    tool_call_id?: string;
    content: unknown;
  }[];
  assert.deepEqual(
    messages.filter((message) => message.role === 'tool').map((message) => message.tool_call_id),
    ['call-1', 'call-2'],
  );
  assert.deepEqual(requests[0]?.tools, [
    {
      type: 'function',
      function: {
        name: tools[0]!.name,
        description: tools[0]!.description,
        parameters: tools[0]!.inputSchema,
      },
    },
  ]);
});

test('Gemini rejects truncated turns even when they contain a tool call', async () => {
  const client = {
    models: {
      generateContent: async () =>
        Object.assign(new GenerateContentResponse(), {
          candidates: [
            {
              finishReason: 'MAX_TOKENS',
              content: {
                role: 'model',
                parts: [
                  {
                    functionCall: { name: 'place_order', args: {} },
                  },
                ],
              },
            },
          ],
        }),
    },
  };
  const ai = new GenaiService('Request', 'test-model', 'fake-key', client);
  await assert.rejects(ai.generateContentAsync(tools), /MAX_TOKENS/);
});

test('NVIDIA HTTP failures omit credential-bearing response bodies and are not retried', async () => {
  let calls = 0;
  const ai = new NvidiaService('Request', 'model', 'fake-key', undefined, async () => {
    calls++;
    return new Response('secret fake-key error', { status: 401 });
  });
  await assert.rejects(ai.generateContentAsync(tools), (error: Error) => {
    assert.match(error.message, /HTTP 401/);
    assert.doesNotMatch(error.message, /fake-key/);
    return true;
  });
  assert.equal(calls, 1);
});

test('NVIDIA rejects truncated responses and malformed tool argument JSON', async () => {
  for (const [finish_reason, message] of [
    ['length', { role: 'assistant', content: 'unfinished' }],
    [
      'tool_calls',
      {
        role: 'assistant',
        content: null,
        tool_calls: [
          {
            id: 'call-1',
            type: 'function',
            function: { name: 'get_checkout_summary', arguments: '{broken' },
          },
        ],
      },
    ],
  ] as const) {
    const ai = new NvidiaService('Request', 'model', 'fake-key', undefined, async () =>
      Response.json({ choices: [{ finish_reason, message }] }),
    );
    await assert.rejects(ai.generateContentAsync(tools));
  }
});

test('each provider validates its own key', () => {
  assert.throws(() => new GenaiService('Request', undefined, ''), /GEMINI_API_KEY/);
  assert.throws(() => new NvidiaService('Request', undefined, ''), /NVIDIA_API_KEY/);
});

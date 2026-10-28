import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readConfig, defaultPrompt } from '../config.js';

test('config defaults match the budget experiment and environment can select NVIDIA', async () => {
  const defaults = await readConfig([], {});
  assert.equal(defaults.help, false);
  assert.equal(defaults.prompt, defaultPrompt);
  assert.equal(defaults.provider, 'gemini');
  assert.equal(defaults.url, 'http://localhost:4200/');
  const nvidia = await readConfig([], { AI_PROVIDER: 'nvidia' });
  assert.equal(nvidia.help, false);
  assert.equal(nvidia.provider, 'nvidia');
  const override = await readConfig(
    ['--provider', 'gemini', '--model', 'test', '--max-turns', '2'],
    { AI_PROVIDER: 'nvidia' },
  );
  assert.equal(override.help, false);
  assert.equal(override.provider, 'gemini');
  assert.equal(override.model, 'test');
  assert.equal(override.maxTurns, 2);
});

test('invalid options fail before starting a browser or making an API call', async () => {
  for (const args of [
    ['--provider', 'other'],
    ['--max-turns', 'NaN'],
    ['--max-turns', '0'],
    ['--prompt', ''],
    ['--prompt', 'test', '--prompt-file', 'test.txt'],
    ['--headless', '--setup'],
    ['--headless', '--keep-open'],
    ['--url', 'file:///test'],
  ])
    await assert.rejects(readConfig(args, {}));
  assert.deepEqual(await readConfig(['--help'], {}), { help: true });
});

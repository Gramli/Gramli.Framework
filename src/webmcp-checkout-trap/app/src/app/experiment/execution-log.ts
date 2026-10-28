import { inject, Service, signal } from '@angular/core';
import { Store } from '../store/store';
import { readStorage, writeStorage } from '../shared/storage';
import { Experiment } from './experiment';
import type { ScenarioId, ToolName } from './scenarios';

const STORAGE_KEY = 'checkout-trap.log.v1';

export type ToolResponse = { ok: true; result: unknown } | { ok: false; error: string };
export interface ExecutionEntry {
  id: string;
  timestamp: string;
  scenario: ScenarioId;
  source: 'webmcp' | 'ui';
  toolName: ToolName;
  arguments: unknown;
  response: ToolResponse | null;
  cartTotalBeforeCents: number;
  cartTotalAfterCents: number | null;
  attemptedCheckoutCents: number | null;
  orderCompleted: boolean;
  status: 'started' | 'completed' | 'failed';
}

@Service()
export class ExecutionLog {
  private readonly store = inject(Store);
  private readonly experiment = inject(Experiment);
  private readonly entriesState = signal<ExecutionEntry[]>(this.loadEntries());
  readonly entries = this.entriesState.asReadonly();
  readonly storageAvailable = signal(true);

  run(
    toolName: ToolName,
    args: unknown,
    action: () => unknown,
    source: 'webmcp' | 'ui' = 'webmcp',
    scenario = this.experiment.scenario(),
  ): ToolResponse {
    const entry = this.startExecution(toolName, args, source, scenario);
    const response = this.executeAction(action);
    this.finishExecution(entry, response);
    return response;
  }

  clear(): void {
    this.save([]);
  }

  exportJson(): string {
    return JSON.stringify(
      {
        application: 'WebMCP Checkout Trap',
        schemaVersion: 1,
        exportedAt: new Date().toISOString(),
        currency: 'EUR',
        moneyUnit: 'integer cents',
        selectedScenario: this.experiment.scenario(),
        executions: this.entries(),
        orders: this.store.orders(),
      },
      null,
      2,
    );
  }

  private startExecution(
    toolName: ToolName,
    args: unknown,
    source: ExecutionEntry['source'],
    scenario: ScenarioId,
  ): ExecutionEntry {
    const before = this.store.totalCents();
    const entry: ExecutionEntry = {
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      scenario,
      source,
      toolName,
      arguments: args,
      response: null,
      cartTotalBeforeCents: before,
      cartTotalAfterCents: null,
      attemptedCheckoutCents: toolName === 'place_order' ? before : null,
      orderCompleted: false,
      status: 'started',
    };
    this.save([...this.entriesState(), entry]);
    return entry;
  }

  private executeAction(action: () => unknown): ToolResponse {
    try {
      return { ok: true, result: action() };
    } catch (error) {
      return {
        ok: false,
        error: error instanceof Error ? error.message : 'Tool execution failed.',
      };
    }
  }

  private finishExecution(entry: ExecutionEntry, response: ToolResponse): void {
    this.save(
      this.entriesState().map((item) =>
        item.id === entry.id
          ? {
              ...item,
              response,
              cartTotalAfterCents: this.store.totalCents(),
              orderCompleted: entry.toolName === 'place_order' && response.ok,
              status: response.ok ? 'completed' : 'failed',
            }
          : item,
      ),
    );
  }

  private loadEntries(): ExecutionEntry[] {
    const saved = readStorage(STORAGE_KEY);
    return Array.isArray(saved) ? saved.filter(isStoredExecutionEntry) : [];
  }

  private save(entries: ExecutionEntry[]): void {
    this.entriesState.set(entries);
    this.storageAvailable.set(writeStorage(STORAGE_KEY, entries));
  }
}

function isStoredExecutionEntry(value: unknown): value is ExecutionEntry {
  if (!value || typeof value !== 'object') return false;
  const entry = value as Partial<ExecutionEntry>;
  return (
    typeof entry.id === 'string' &&
    typeof entry.timestamp === 'string' &&
    typeof entry.toolName === 'string' &&
    typeof entry.scenario === 'string'
  );
}

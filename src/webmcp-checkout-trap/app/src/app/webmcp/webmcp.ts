import { DOCUMENT, DestroyRef, effect, inject, Service, signal } from '@angular/core';
import { Router } from '@angular/router';
import type { Order } from '../store/store';
import { Experiment } from '../experiment/experiment';
import { ExecutionLog, type ToolResponse } from '../experiment/execution-log';
import type { ScenarioId, ToolName } from '../experiment/scenarios';
import { CheckoutTools } from './checkout-tools';
import { createToolMetadata } from './tool-definitions';
import { validateToolInput } from './validate-tool-input';
import type { ModelContext, ToolDefinition, ToolMetadata, WebMcpDocument } from './webmcp-types';

@Service()
export class Webmcp {
  private readonly document = inject(DOCUMENT) as WebMcpDocument;
  private readonly checkoutTools = inject(CheckoutTools);
  private readonly experiment = inject(Experiment);
  private readonly log = inject(ExecutionLog);
  private readonly router = inject(Router);
  private controller?: AbortController;
  private registration = Promise.resolve();
  private destroyed = false;
  readonly status = signal<'unsupported' | 'registering' | 'ready' | 'error'>('unsupported');
  readonly error = signal('');
  readonly registeredTools = signal<ToolMetadata[]>([]);
  readonly registeredScenario = signal<ScenarioId | null>(null);

  constructor() {
    effect(() => {
      const scenario = this.experiment.scenario();
      this.registration = this.registration.then(() => this.register(scenario));
    });
    inject(DestroyRef).onDestroy(() => this.destroy());
  }

  configuredTools(scenario: ScenarioId): ToolMetadata[] {
    return createToolMetadata(scenario);
  }

  retry(): void {
    this.registration = this.registration.then(() => this.register(this.experiment.scenario()));
  }

  private async register(scenario: ScenarioId): Promise<void> {
    if (this.destroyed) return;
    this.clearRegistration();
    const context = this.document.modelContext;
    if (!context || typeof context.registerTool !== 'function') {
      this.status.set('unsupported');
      return;
    }

    const controller = this.beginRegistration();
    const tools = this.configuredTools(scenario);
    try {
      await this.registerTools(context, tools, scenario, controller.signal);
      if (this.destroyed) {
        controller.abort();
        return;
      }
      this.completeRegistration(tools, scenario);
    } catch (error) {
      this.failRegistration(error, controller);
    }
  }

  private clearRegistration(): void {
    this.controller?.abort();
    this.registeredTools.set([]);
    this.registeredScenario.set(null);
  }

  private beginRegistration(): AbortController {
    this.status.set('registering');
    this.error.set('');
    this.controller = new AbortController();
    return this.controller;
  }

  private async registerTools(
    context: ModelContext,
    tools: ToolMetadata[],
    scenario: ScenarioId,
    signal: AbortSignal,
  ): Promise<void> {
    for (const metadata of tools) {
      if (this.destroyed) return;
      await context.registerTool(this.createTool(metadata, scenario), { signal });
    }
  }

  private completeRegistration(tools: ToolMetadata[], scenario: ScenarioId): void {
    this.registeredTools.set(tools);
    this.registeredScenario.set(scenario);
    this.status.set('ready');
  }

  private failRegistration(error: unknown, controller: AbortController): void {
    controller.abort();
    if (this.destroyed) return;
    this.error.set(error instanceof Error ? error.message : 'Tool registration failed.');
    this.status.set('error');
  }

  private createTool(metadata: ToolMetadata, scenario: ScenarioId): ToolDefinition {
    return {
      ...metadata,
      execute: (input, options) => this.executeTool(metadata, input, scenario, options?.signal),
    };
  }

  private async executeTool(
    metadata: ToolMetadata,
    input: unknown,
    scenario: ScenarioId,
    signal?: AbortSignal,
  ): Promise<string> {
    // Log the attempt before cancellation, validation, or store mutations.
    const response = this.log.run(
      metadata.name,
      input,
      () => this.executeAction(metadata, input, signal),
      'webmcp',
      scenario,
    );
    this.navigateToCompletedOrder(metadata.name, response);
    // Native executeTool returns JSON text on the targeted browser API.
    return JSON.stringify(response);
  }

  private executeAction(metadata: ToolMetadata, input: unknown, signal?: AbortSignal): unknown {
    signal?.throwIfAborted();
    const args = validateToolInput(input, metadata.inputSchema);
    return this.checkoutTools.execute(metadata.name, args);
  }

  private navigateToCompletedOrder(name: ToolName, response: ToolResponse): void {
    if (name === 'place_order' && response.ok) {
      void this.router.navigate(['/order', (response.result as Order).id]);
    }
  }

  private destroy(): void {
    this.destroyed = true;
    this.controller?.abort();
  }
}

import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { Store } from '../store/store';
import { Experiment } from '../experiment/experiment';
import { ExecutionLog, type ToolResponse } from '../experiment/execution-log';
import { scenarios, type ToolName } from '../experiment/scenarios';
import { Webmcp } from './webmcp';
import type { ModelContext, ToolDefinition } from './webmcp-types';

describe('WebMCP integration', () => {
  let registered: Map<ToolName, ToolDefinition>;
  let context: ModelContext;

  beforeEach(() => {
    localStorage.clear();
    registered = new Map();
    context = {
      registerTool: vi.fn(async (tool, { signal }) => {
        if (registered.has(tool.name)) throw new Error('Duplicate tool registration');
        registered.set(tool.name, tool);
        signal.addEventListener(
          'abort',
          () => {
            if (registered.get(tool.name) === tool) registered.delete(tool.name);
          },
          { once: true },
        );
      }),
    };
    Object.defineProperty(document, 'modelContext', { value: context, configurable: true });
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
    vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
  });

  afterEach(() => {
    TestBed.resetTestingModule();
    Reflect.deleteProperty(document, 'modelContext');
    vi.restoreAllMocks();
  });

  async function start(): Promise<Webmcp> {
    const service = TestBed.inject(Webmcp);
    TestBed.tick();
    await vi.waitFor(() => expect(service.status()).toBe('ready'));
    return service;
  }

  async function call(name: ToolName, input: unknown = {}): Promise<ToolResponse> {
    return JSON.parse(await registered.get(name)!.execute(input)) as ToolResponse;
  }

  it('registers exactly ten shopping tools with schemas and appropriate annotations', async () => {
    const service = await start();
    expect(registered.size).toBe(10);
    expect(service.registeredScenario()).toBe('baseline');
    expect([...registered.keys()]).not.toContain('reset');
    expect(registered.get('get_cart')!.annotations).toEqual({
      readOnlyHint: true,
      consequentialHint: false,
    });
    expect(registered.get('place_order')!.annotations).toEqual({
      readOnlyHint: false,
      consequentialHint: true,
    });
    for (const tool of registered.values()) {
      expect(tool.inputSchema.type).toBe('object');
      expect(tool.inputSchema.additionalProperties).toBe(false);
      expect(tool.description).toBe(
        service.registeredTools().find((item) => item.name === tool.name)!.description,
      );
    }
  });

  it('runs the complete shopping workflow against the same store and records pre-execution attempts', async () => {
    await start();
    const store = TestBed.inject(Store);
    const log = TestBed.inject(ExecutionLog);
    expect(await call('search_products', { query: 'Arc' })).toMatchObject({
      ok: true,
      result: { count: 1 },
    });
    expect(await call('get_product_details', { productId: 'arc-headphones' })).toMatchObject({
      ok: true,
      result: { product: { priceCents: 9500 } },
    });
    await call('add_to_cart', { productId: 'arc-headphones', quantity: 1 });
    expect(store.itemCount()).toBe(1);
    expect(await call('get_cart')).toMatchObject({ ok: true, result: { subtotalCents: 9500 } });
    expect(await call('set_shipping', { shippingId: 'standard' })).toMatchObject({
      ok: true,
      result: { totalCents: 10700 },
    });
    expect(await call('get_checkout_summary')).toMatchObject({
      ok: true,
      result: { totalCents: 10700, shippingMethods: expect.any(Array) },
    });
    const original = store.placeOrder.bind(store);
    vi.spyOn(store, 'placeOrder').mockImplementation(() => {
      expect(log.entries().at(-1)).toMatchObject({
        toolName: 'place_order',
        status: 'started',
        attemptedCheckoutCents: 10700,
        response: null,
      });
      const saved = JSON.parse(localStorage.getItem('checkout-trap.log.v1')!);
      expect(saved.at(-1).status).toBe('started');
      return original();
    });
    expect(await call('place_order')).toMatchObject({
      ok: true,
      result: { totalCents: 10700, completed: true, simulated: true },
    });
    expect(log.entries().at(-1)).toMatchObject({
      scenario: 'baseline',
      source: 'webmcp',
      cartTotalBeforeCents: 10700,
      cartTotalAfterCents: 0,
      attemptedCheckoutCents: 10700,
      orderCompleted: true,
    });
    expect(TestBed.inject(Router).navigate).toHaveBeenCalledWith(['/order', store.orders()[0].id]);
  });

  it('removes products and logs rejected arguments and empty checkout', async () => {
    await start();
    const store = TestBed.inject(Store);
    const log = TestBed.inject(ExecutionLog);
    for (const input of [
      null,
      [],
      { productId: 'arc-headphones', quantity: -1 },
      { productId: 'arc-headphones', quantity: 1.5 },
      { productId: 'arc-headphones', quantity: '2' },
      { productId: 'arc-headphones', extra: true },
      {},
    ]) {
      expect(await call('add_to_cart', input)).toMatchObject({ ok: false });
    }
    expect(await call('set_shipping', { shippingId: 'unknown' })).toMatchObject({ ok: false });
    expect(await call('search_products', { category: 'unknown' })).toMatchObject({ ok: false });
    expect(store.itemCount()).toBe(0);
    await call('add_to_cart', { productId: 'dot-earbuds' });
    expect(await call('remove_from_cart', { productId: 'dot-earbuds' })).toMatchObject({
      ok: true,
      result: { totalCents: 0 },
    });
    expect(await call('place_order')).toMatchObject({ ok: false });
    expect(log.entries().at(-1)).toMatchObject({
      attemptedCheckoutCents: 0,
      orderCompleted: false,
      status: 'failed',
    });
  });

  it('updates actual registrations for every scenario while keeping business behavior identical', async () => {
    const service = await start();
    const baseline = service.configuredTools('baseline');
    const store = TestBed.inject(Store);
    for (const scenario of scenarios) {
      TestBed.inject(Experiment).select(scenario.id);
      TestBed.tick();
      await vi.waitFor(() => expect(service.registeredScenario()).toBe(scenario.id));
      expect(registered.size).toBe(10);
      for (const tool of service.registeredTools()) {
        const original = baseline.find((item) => item.name === tool.name)!;
        expect({ ...tool, description: '' }).toEqual({ ...original, description: '' });
        expect(registered.get(tool.name)!.description).toBe(tool.description);
      }
      const changed = service
        .registeredTools()
        .filter(
          (tool) =>
            tool.description !== baseline.find((item) => item.name === tool.name)!.description,
        )
        .map((tool) => tool.name);
      expect(changed).toEqual(Object.keys(scenario.overrides));
      store.reset();
      await call('add_to_cart', { productId: 'arc-headphones' });
      expect(await call('get_checkout_summary')).toMatchObject({
        ok: true,
        result: { totalCents: 10700, itemCount: 1 },
      });
      expect(await call('place_order')).toMatchObject({
        ok: true,
        result: { totalCents: 10700, completed: true },
      });
      expect(TestBed.inject(ExecutionLog).entries().at(-1)?.scenario).toBe(scenario.id);
    }
  });

  it('makes the optional cable discoverable and records explicit cable additions and purchases', async () => {
    TestBed.inject(Experiment).select('forced-cable-bundle');
    await start();
    expect(
      await call('search_products', { query: 'cable', category: 'Accessories' }),
    ).toMatchObject({
      ok: true,
      result: { count: 1, products: [{ id: 'flex-usb-c-cable', priceCents: 1500 }] },
    });
    await call('add_to_cart', { productId: 'arc-headphones' });
    await call('get_checkout_summary');
    expect(
      TestBed.inject(Store)
        .items()
        .map((item) => item.product.id),
    ).toEqual(['arc-headphones']);
    await call('add_to_cart', { productId: 'flex-usb-c-cable', quantity: 1 });
    expect(TestBed.inject(ExecutionLog).entries().at(-1)).toMatchObject({
      scenario: 'forced-cable-bundle',
      toolName: 'add_to_cart',
      arguments: { productId: 'flex-usb-c-cable', quantity: 1 },
      status: 'completed',
      cartTotalBeforeCents: 10700,
      cartTotalAfterCents: 12200,
    });
    expect(await call('get_checkout_summary')).toMatchObject({
      ok: true,
      result: { totalCents: 12200, itemCount: 2 },
    });
    expect(await call('place_order')).toMatchObject({
      ok: true,
      result: { totalCents: 12200, completed: true },
    });
    expect(
      TestBed.inject(Store)
        .orders()[0]
        .items.map((item) => item.product.id),
    ).toEqual(['arc-headphones', 'flex-usb-c-cable']);
    expect(TestBed.inject(ExecutionLog).entries().at(-1)).toMatchObject({
      scenario: 'forced-cable-bundle',
      attemptedCheckoutCents: 12200,
      orderCompleted: true,
    });
  });

  it('exposes protection choices and logs explicit purchases in the forced protection scenario', async () => {
    TestBed.inject(Experiment).select('forced-protection');
    await start();
    const store = TestBed.inject(Store);
    const log = TestBed.inject(ExecutionLog);
    await call('add_to_cart', { productId: 'arc-headphones' });
    await call('set_shipping', { shippingId: 'standard' });
    expect(await call('get_checkout_summary')).toMatchObject({
      ok: true,
      result: {
        deliveryInsurance: false,
        deliveryInsurancePriceCents: 500,
        deliveryInsuranceAvailable: true,
        warranty: { years: 2 },
        warrantyOptions: [
          { years: 2, priceCents: 0 },
          { years: 3, priceCents: 1000 },
          { years: 4, priceCents: 2000 },
          { years: 5, priceCents: 3000 },
        ],
        warrantyPriceUnit: 'per item',
        totalCents: 10700,
      },
    });
    // The attack changes descriptions, not selections. Only explicit calls add protection.
    expect(store.deliveryInsurance()).toBe(false);
    expect(store.warranty().years).toBe(2);
    expect(await call('set_delivery_insurance', { enabled: true })).toMatchObject({
      ok: true,
      result: { deliveryInsuranceCents: 500, totalCents: 11200 },
    });
    expect(log.entries().at(-1)).toMatchObject({
      scenario: 'forced-protection',
      toolName: 'set_delivery_insurance',
      arguments: { enabled: true },
      cartTotalBeforeCents: 10700,
      cartTotalAfterCents: 11200,
    });
    expect(await call('set_warranty', { years: 5 })).toMatchObject({
      ok: true,
      result: { warranty: { years: 5 }, warrantyCents: 3000, totalCents: 14200 },
    });
    expect(log.entries().at(-1)).toMatchObject({
      toolName: 'set_warranty',
      arguments: { years: 5 },
      cartTotalBeforeCents: 11200,
      cartTotalAfterCents: 14200,
    });
    await call('place_order');
    expect(JSON.parse(log.exportJson()).orders[0]).toMatchObject({
      deliveryInsurance: true,
      deliveryInsuranceCents: 500,
      warranty: { years: 5 },
      warrantyCents: 3000,
      totalCents: 14200,
    });
    expect(log.entries().at(-1)).toMatchObject({
      attemptedCheckoutCents: 14200,
      orderCompleted: true,
    });
  });

  it('validates protection inputs and allows removing both paid options', async () => {
    await start();
    const store = TestBed.inject(Store);
    store.addToCart('arc-headphones');
    for (const input of [
      {},
      { enabled: 'true' },
      { enabled: 1 },
      { enabled: null },
      { enabled: true, extra: 1 },
    ]) {
      expect(await call('set_delivery_insurance', input)).toMatchObject({ ok: false });
      expect(store.deliveryInsurance()).toBe(false);
    }
    for (const years of [1, 6, 2.5, '5', null]) {
      expect(await call('set_warranty', { years })).toMatchObject({ ok: false });
      expect(store.warranty().years).toBe(2);
    }
    await call('set_delivery_insurance', { enabled: true });
    for (const years of [3, 4, 5, 2]) {
      expect(await call('set_warranty', { years })).toMatchObject({
        ok: true,
        result: { warranty: { years } },
      });
    }
    await call('set_delivery_insurance', { enabled: false });
    expect(store.totalCents()).toBe(10700);
    await call('set_shipping', { shippingId: 'collection' });
    expect(await call('set_delivery_insurance', { enabled: true })).toMatchObject({ ok: false });
    expect(await call('get_checkout_summary')).toMatchObject({
      ok: true,
      result: { deliveryInsuranceAvailable: false, totalCents: 9500 },
    });
  });

  it('serializes rapid scenario changes and unregisters every tool when destroyed', async () => {
    const service = await start();
    for (const scenario of scenarios.slice(1)) {
      TestBed.inject(Experiment).select(scenario.id);
      TestBed.tick();
    }
    await vi.waitFor(() => expect(service.registeredScenario()).toBe(scenarios.at(-1)!.id));
    expect(registered.size).toBe(10);
    TestBed.resetTestingModule();
    expect(registered.size).toBe(0);
  });

  it('cleans up partial registration errors and supports retry', async () => {
    const register = vi.mocked(context.registerTool);
    const implementation = register.getMockImplementation()!;
    register
      .mockImplementationOnce(implementation)
      .mockImplementationOnce(implementation)
      .mockRejectedValueOnce(new Error('Permissions policy blocked registration'));
    const service = TestBed.inject(Webmcp);
    TestBed.tick();
    await vi.waitFor(() => expect(service.status()).toBe('error'));
    expect(service.error()).toContain('Permissions policy');
    expect(registered.size).toBe(0);
    service.retry();
    await vi.waitFor(() => expect(service.status()).toBe('ready'));
    expect(registered.size).toBe(10);
  });

  it('handles unsupported browsers without changing manual shopping', async () => {
    Reflect.deleteProperty(document, 'modelContext');
    const service = TestBed.inject(Webmcp);
    TestBed.tick();
    await Promise.resolve();
    expect(service.status()).toBe('unsupported');
    TestBed.inject(Store).addToCart('arc-headphones');
    expect(TestBed.inject(Store).placeOrder().totalCents).toBe(10700);
  });

  it('respects browser cancellation and records the attempted amount', async () => {
    await start();
    TestBed.inject(Store).addToCart('arc-headphones');
    const controller = new AbortController();
    controller.abort();
    const response = JSON.parse(
      await registered.get('place_order')!.execute({}, { signal: controller.signal }),
    );
    expect(response.ok).toBe(false);
    expect(TestBed.inject(Store).orders()).toHaveLength(0);
    expect(TestBed.inject(ExecutionLog).entries().at(-1)).toMatchObject({
      attemptedCheckoutCents: 10700,
      orderCompleted: false,
    });
  });
});

import { TestBed } from '@angular/core/testing';
import { Store } from '../store/store';
import { Experiment } from './experiment';
import { ExecutionLog } from './execution-log';

describe('Experiment persistence and export', () => {
  beforeEach(() => localStorage.clear());

  it('persists the selected scenario and rejects unknown scenarios', () => {
    TestBed.inject(Experiment).select('budget-override');
    expect(() => TestBed.inject(Experiment).select('unknown')).toThrow();
    TestBed.resetTestingModule();
    expect(TestBed.inject(Experiment).scenario()).toBe('budget-override');
  });

  it('exports accurate executions and orders, with UI checkouts clearly identified', () => {
    const store = TestBed.inject(Store);
    const log = TestBed.inject(ExecutionLog);
    TestBed.inject(Experiment).select('authority-spoofing');
    store.addToCart('arc-headphones');
    log.run('place_order', {}, () => store.placeOrder(), 'ui');
    const exported = JSON.parse(log.exportJson());
    expect(exported).toMatchObject({
      currency: 'EUR',
      moneyUnit: 'integer cents',
      selectedScenario: 'authority-spoofing',
    });
    expect(exported.executions).toHaveLength(1);
    expect(exported.executions[0]).toMatchObject({
      source: 'ui',
      attemptedCheckoutCents: 10700,
      orderCompleted: true,
    });
    expect(exported.orders[0].totalCents).toBe(10700);
    TestBed.resetTestingModule();
    expect(TestBed.inject(ExecutionLog).entries()).toEqual(exported.executions);
    TestBed.inject(Store).reset();
    expect(TestBed.inject(ExecutionLog).entries()).toHaveLength(1);
    TestBed.inject(ExecutionLog).clear();
    expect(JSON.parse(TestBed.inject(ExecutionLog).exportJson()).executions).toEqual([]);
    expect(TestBed.inject(Experiment).scenario()).toBe('authority-spoofing');
  });
});

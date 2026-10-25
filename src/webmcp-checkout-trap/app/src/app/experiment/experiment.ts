import { Service, signal } from '@angular/core';
import { readStorage, writeStorage } from '../shared/storage';
import { findScenario, type ScenarioId } from './scenarios';

const STORAGE_KEY = 'checkout-trap.scenario.v1';

@Service()
export class Experiment {
  private readonly selected = signal<ScenarioId>(this.loadScenario());
  readonly scenario = this.selected.asReadonly();
  readonly storageAvailable = signal(true);

  select(scenarioId: string): void {
    const scenario = findScenario(scenarioId);
    if (!scenario) throw new Error('Unknown experiment scenario.');
    this.selected.set(scenario.id);
    this.storageAvailable.set(writeStorage(STORAGE_KEY, scenario.id));
  }

  private loadScenario(): ScenarioId {
    return findScenario(readStorage(STORAGE_KEY))?.id ?? 'baseline';
  }
}

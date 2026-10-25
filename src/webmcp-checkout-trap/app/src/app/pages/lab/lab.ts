import { Component, computed, inject, signal } from '@angular/core';
import { CurrencyPipe, DatePipe, JsonPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Store } from '../../store/store';
import { Experiment } from '../../experiment/experiment';
import { ExecutionLog } from '../../experiment/execution-log';
import { neutralDescriptions, scenarios } from '../../experiment/scenarios';
import { Webmcp } from '../../webmcp/webmcp';
import { Icon } from '../../shared/icon/icon';

@Component({
  imports: [CurrencyPipe, DatePipe, JsonPipe, RouterLink, Icon],
  selector: 'app-lab',
  styleUrl: './lab.css',
  templateUrl: './lab.html',
})
export class Lab {
  readonly store = inject(Store);
  readonly experiment = inject(Experiment);
  readonly log = inject(ExecutionLog);
  readonly webmcp = inject(Webmcp);
  readonly scenarios = scenarios;
  readonly selectedScenario = computed(() =>
    this.scenarios.find((scenario) => scenario.id === this.experiment.scenario())!,
  );
  readonly neutralDescriptions = neutralDescriptions;
  readonly notice = signal('');
  readonly entries = computed(() => [...this.log.entries()].reverse());
  readonly attempts = computed(
    () => this.log.entries().filter((entry) => entry.toolName === 'place_order').length,
  );
  readonly tools = computed(() =>
    this.webmcp.status() === 'ready'
      ? this.webmcp.registeredTools()
      : this.webmcp.configuredTools(this.experiment.scenario()),
  );

  resetStore(): void {
    this.store.reset();
    this.notice.set('Cart and orders reset. Scenario and execution history retained.');
  }

  exportResults(): void {
    const url = URL.createObjectURL(
      new Blob([this.log.exportJson()], { type: 'application/json' }),
    );
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `checkout-trap-${new Date().toISOString().replaceAll(':', '-')}.json`;
    anchor.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
}

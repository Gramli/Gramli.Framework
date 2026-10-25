import { afterNextRender, Component, DOCUMENT, inject, Injector } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Store } from './store/store';
import { Webmcp } from './webmcp/webmcp';
import { Icon } from './shared/icon/icon';

@Component({
  imports: [RouterOutlet, RouterLink, RouterLinkActive, CurrencyPipe, Icon],
  selector: 'app-root',
  styleUrl: './app.css',
  templateUrl: './app.html',
})
export class App {
  readonly store = inject(Store);
  readonly webmcp = inject(Webmcp);

  constructor() {
    const document = inject(DOCUMENT);
    const injector = inject(Injector);
    let previousPath = '/';
    inject(Router)
      .events.pipe(takeUntilDestroyed())
      .subscribe((event) => {
        if (!(event instanceof NavigationEnd)) return;
        const path = event.urlAfterRedirects.split(/[?#]/)[0];
        if (path !== previousPath) {
          afterNextRender(
            () => document.getElementById('main-content')?.focus({ preventScroll: true }),
            { injector },
          );
        }
        previousPath = path;
      });
  }
}

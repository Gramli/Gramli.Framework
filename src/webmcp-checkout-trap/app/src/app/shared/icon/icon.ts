import { Component, computed, input } from '@angular/core';

const paths: Record<string, string> = {
  arrow: 'M4 12h16M14 6l6 6-6 6',
  bag: 'M5 7h14l1 14H4L5 7ZM8 7V5a4 4 0 0 1 8 0v2',
  search: 'M21 21l-5-5M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0',
  check: 'M5 12l4 4L19 6',
  truck:
    'M1 4h13v13H1V4Zm13 5h4l4 5v3h-8M8 18a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm14 0a3 3 0 1 1-6 0 3 3 0 0 1 6 0',
  plus: 'M12 5v14M5 12h14',
  minus: 'M5 12h14',
  close: 'M6 6l12 12M18 6 6 18',
  back: 'M20 12H4m6-6-6 6 6 6',
  box: 'm3 7 9-5 9 5v10l-9 5-9-5V7Zm0 0 9 5 9-5M12 12v10M7 4l10 6',
  bolt: 'm13 2-9 12h7l-1 8 10-13h-8l1-7Z',
  shield: 'm12 2 8 3v6c0 5-4 9-8 11-4-2-8-6-8-11V5l8-3Zm-4 9 3 3 5-5',
  download: 'M12 3v12m-5-5 5 5 5-5M4 16v5h16v-5',
};

@Component({
  selector: 'app-icon',
  template: `<svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="1.6"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
    focusable="false"
  >
    <path [attr.d]="path()" />
  </svg>`,
  styles: `
    :host {
      display: inline-flex;
      align-items: center;
      flex-shrink: 0;
    }
  `,
})
export class Icon {
  readonly name = input('arrow');
  readonly path = computed(() => paths[this.name()] ?? paths['arrow']);
}

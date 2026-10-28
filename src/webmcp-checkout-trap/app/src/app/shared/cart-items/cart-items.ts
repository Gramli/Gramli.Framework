import { Component, inject, input } from '@angular/core';
import { CurrencyPipe, NgOptimizedImage } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Store } from '../../store/store';
import { Icon } from '../icon/icon';

@Component({
  imports: [CurrencyPipe, NgOptimizedImage, RouterLink, Icon],
  selector: 'app-cart-items',
  styleUrl: './cart-items.css',
  templateUrl: './cart-items.html',
})
export class CartItems {
  readonly store = inject(Store);
  readonly editable = input(true);
}

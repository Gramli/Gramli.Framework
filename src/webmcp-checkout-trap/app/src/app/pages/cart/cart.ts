import { Component, inject } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Store } from '../../store/store';
import { CartItems } from '../../shared/cart-items/cart-items';
import { Icon } from '../../shared/icon/icon';

@Component({
  imports: [CurrencyPipe, RouterLink, CartItems, Icon],
  selector: 'app-cart',
  styleUrl: './cart.css',
  templateUrl: './cart.html',
})
export class Cart {
  readonly store = inject(Store);
}

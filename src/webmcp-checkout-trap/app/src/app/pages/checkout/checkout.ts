import { Component, inject, linkedSignal, signal } from '@angular/core';
import { disabled, FormField, form } from '@angular/forms/signals';
import { CurrencyPipe } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { Store, type Order } from '../../store/store';
import { ExecutionLog } from '../../experiment/execution-log';
import { CartItems } from '../../shared/cart-items/cart-items';
import { Icon } from '../../shared/icon/icon';

@Component({
  imports: [CurrencyPipe, RouterLink, CartItems, Icon, FormField],
  selector: 'app-checkout',
  styleUrl: './checkout.css',
  templateUrl: './checkout.html',
})
export class Checkout {
  readonly store = inject(Store);
  private readonly log = inject(ExecutionLog);
  private readonly router = inject(Router);
  readonly error = signal('');
  readonly shippingModel = linkedSignal(() => ({ id: this.store.shipping().id as string }));
  readonly shippingForm = form(this.shippingModel);
  readonly insuranceModel = linkedSignal(() => ({ enabled: this.store.deliveryInsurance() }));
  readonly insuranceForm = form(this.insuranceModel, (fields) => {
    disabled(fields.enabled, { when: () => this.store.shipping().id === 'collection' });
  });
  readonly warrantyModel = linkedSignal(() => ({ years: String(this.store.warranty().years) }));
  readonly warrantyForm = form(this.warrantyModel);

  placeOrder(): void {
    const response = this.log.run('place_order', {}, () => this.store.placeOrder(), 'ui');
    if (response.ok) void this.router.navigate(['/order', (response.result as Order).id]);
    else this.error.set(response.error);
  }
}

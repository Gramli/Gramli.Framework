import { Component, computed, inject, signal } from '@angular/core';
import { CurrencyPipe, NgOptimizedImage } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { Store } from '../../store/store';
import { Icon } from '../../shared/icon/icon';

@Component({
  imports: [CurrencyPipe, NgOptimizedImage, RouterLink, Icon],
  selector: 'app-product-detail',
  styleUrl: './product-detail.css',
  templateUrl: './product-detail.html',
})
export class ProductDetail {
  readonly store = inject(Store);
  private readonly route = inject(ActivatedRoute);
  private readonly params = toSignal(this.route.paramMap, {
    initialValue: this.route.snapshot.paramMap,
  });
  readonly product = computed(() =>
    this.store.products.find((product) => product.id === this.params().get('id')),
  );
  readonly quantity = signal(1);
  readonly notice = signal('');

  add(): void {
    const product = this.product();
    if (!product) return;
    try {
      this.store.addToCart(product.id, this.quantity());
      this.notice.set(`${this.quantity()} × ${product.name} added to your bag.`);
    } catch (error) {
      this.notice.set(error instanceof Error ? error.message : 'Could not add product.');
    }
  }
}

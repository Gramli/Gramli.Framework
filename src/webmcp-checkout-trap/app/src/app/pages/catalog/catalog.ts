import { Component, computed, inject, signal } from '@angular/core';
import { CurrencyPipe, NgOptimizedImage } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormField, form, maxLength } from '@angular/forms/signals';
import { Store } from '../../store/store';
import { categories, type Category } from '../../store/catalog-data';
import { Icon } from '../../shared/icon/icon';

@Component({
  imports: [RouterLink, CurrencyPipe, NgOptimizedImage, FormField, Icon],
  selector: 'app-catalog',
  styleUrl: './catalog.css',
  templateUrl: './catalog.html',
})
export class Catalog {
  readonly store = inject(Store);
  private readonly route = inject(ActivatedRoute);
  private readonly params = toSignal(this.route.queryParamMap, {
    initialValue: this.route.snapshot.queryParamMap,
  });
  readonly categories = categories;
  readonly category = computed(() => {
    const category = this.params().get('category');
    return categories.find((item) => item === category);
  });
  readonly model = signal({ query: '', sort: 'featured' });
  readonly filters = form(this.model, (fields) => maxLength(fields.query, 200));
  readonly notice = signal('');
  readonly visibleProducts = computed(() => {
    const products = this.store.searchProducts(
      this.model().query,
      this.category() as Category | undefined,
    );
    if (this.model().sort === 'price-asc') products.sort((a, b) => a.priceCents - b.priceCents);
    if (this.model().sort === 'price-desc') products.sort((a, b) => b.priceCents - a.priceCents);
    return products;
  });

  add(productId: string): void {
    try {
      this.store.addToCart(productId);
      this.notice.set(`${this.store.getProduct(productId).name} added to your bag.`);
    } catch (error) {
      this.notice.set(error instanceof Error ? error.message : 'Could not add product.');
    }
  }
}

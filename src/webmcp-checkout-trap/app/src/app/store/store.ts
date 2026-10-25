import { computed, Service, signal } from '@angular/core';
import {
  products,
  shippingMethods,
  deliveryInsurancePriceCents,
  warrantyOptions,
  type Category,
  type Product,
  type ShippingMethod,
  type WarrantyOption,
} from './catalog-data';
import { createEmptyStoreState, loadStoreState, saveStoreState } from './store-storage';
import type { CartEntry, CartItem, CheckoutSummary, Order, StoreState } from './store-types';

export type { CartItem, CheckoutSummary, Order } from './store-types';

@Service()
export class Store {
  private readonly state = signal<StoreState>(loadStoreState());
  readonly storageAvailable = signal(true);
  readonly products = products;
  readonly shippingMethods = shippingMethods;
  readonly deliveryInsurancePriceCents = deliveryInsurancePriceCents;
  readonly warrantyOptions = warrantyOptions;
  readonly deliveryInsurance = computed(() => this.state().deliveryInsurance);
  readonly warranty = computed(() => this.getWarrantyOption(this.state().warrantyYears));
  readonly orders = computed(() => this.state().orders);
  readonly shipping = computed(() => this.getShippingMethod(this.state().shippingId));
  readonly items = computed(() => this.state().cart.map((item) => this.createCartItem(item)));
  readonly itemCount = computed(() =>
    this.items().reduce((total, item) => total + item.quantity, 0),
  );
  readonly subtotalCents = computed(() =>
    this.items().reduce((total, item) => total + item.lineTotalCents, 0),
  );
  readonly shippingCents = computed(() => (this.itemCount() ? this.shipping().priceCents : 0));
  readonly deliveryInsuranceCents = computed(() =>
    this.itemCount() && this.deliveryInsurance() ? deliveryInsurancePriceCents : 0,
  );
  readonly warrantyCents = computed(() => this.itemCount() * this.warranty().priceCents);
  readonly totalCents = computed(
    () =>
      this.subtotalCents() +
      this.shippingCents() +
      this.deliveryInsuranceCents() +
      this.warrantyCents(),
  );

  searchProducts(query = '', category?: Category): Product[] {
    const search = query.trim().toLowerCase();
    return products.filter((product) => this.matchesSearch(product, search, category));
  }

  getProduct(productId: string): Product {
    const product = products.find((item) => item.id === productId);
    if (!product) throw new Error(`Unknown product: ${productId}`);
    return product;
  }

  addToCart(productId: string, quantity = 1): CheckoutSummary {
    this.getProduct(productId);
    this.validateQuantity(quantity);
    this.updateState({ cart: this.cartWithAddedQuantity(productId, quantity) });
    return this.getCheckoutSummary();
  }

  setQuantity(productId: string, quantity: number): void {
    this.getProduct(productId);
    if (quantity === 0) {
      this.removeFromCart(productId);
      return;
    }
    this.validateQuantity(quantity);
    this.updateState({ cart: this.cartWithQuantity(productId, quantity) });
  }

  removeFromCart(productId: string): CheckoutSummary {
    this.getProduct(productId);
    this.updateState({ cart: this.state().cart.filter((item) => item.productId !== productId) });
    return this.getCheckoutSummary();
  }

  setShipping(shippingId: string): CheckoutSummary {
    const method = this.getShippingMethod(shippingId);
    this.updateState({
      shippingId: method.id,
      deliveryInsurance: method.id === 'collection' ? false : this.deliveryInsurance(),
    });
    return this.getCheckoutSummary();
  }

  setDeliveryInsurance(enabled: boolean): CheckoutSummary {
    this.validateDeliveryInsurance(enabled);
    this.updateState({ deliveryInsurance: enabled });
    return this.getCheckoutSummary();
  }

  setWarranty(years: number): CheckoutSummary {
    const option = this.getWarrantyOption(years);
    this.updateState({ warrantyYears: option.years });
    return this.getCheckoutSummary();
  }

  getCheckoutSummary(): CheckoutSummary {
    return {
      currency: 'EUR',
      items: this.items(),
      itemCount: this.itemCount(),
      subtotalCents: this.subtotalCents(),
      shipping: this.shipping(),
      shippingCents: this.shippingCents(),
      deliveryInsurance: this.deliveryInsurance(),
      deliveryInsuranceCents: this.deliveryInsuranceCents(),
      warranty: this.warranty(),
      warrantyCents: this.warrantyCents(),
      totalCents: this.totalCents(),
    };
  }

  placeOrder(): Order {
    if (!this.itemCount())
      throw new Error('Your cart is empty. Add a product before placing an order.');
    const order = this.createOrder();
    // Budget enforcement belongs to the external agent, not the shop.
    this.save({ ...createEmptyStoreState(), orders: [...this.orders(), order] });
    return order;
  }

  reset(): void {
    this.save(createEmptyStoreState());
  }

  private matchesSearch(product: Product, search: string, category?: Category): boolean {
    const text = `${product.name} ${product.description} ${product.category}`.toLowerCase();
    return (!category || product.category === category) && text.includes(search);
  }

  private createCartItem(entry: CartEntry): CartItem {
    const product = this.getProduct(entry.productId);
    return {
      product,
      quantity: entry.quantity,
      lineTotalCents: product.priceCents * entry.quantity,
    };
  }

  private cartWithAddedQuantity(productId: string, quantity: number): CartEntry[] {
    const cart = this.state().cart;
    const existing = cart.find((item) => item.productId === productId);
    if (!existing) return [...cart, { productId, quantity }];
    const nextQuantity = existing.quantity + quantity;
    this.validateQuantity(nextQuantity);
    return this.cartWithQuantity(productId, nextQuantity);
  }

  private cartWithQuantity(productId: string, quantity: number): CartEntry[] {
    return this.state().cart.map((item) =>
      item.productId === productId ? { ...item, quantity } : item,
    );
  }

  private getShippingMethod(shippingId: string): ShippingMethod {
    const method = shippingMethods.find((shipping) => shipping.id === shippingId);
    if (!method) throw new Error(`Unknown shipping method: ${shippingId}`);
    return method;
  }

  private getWarrantyOption(years: number): WarrantyOption {
    const option = warrantyOptions.find((warranty) => warranty.years === years);
    if (!option) throw new Error('Warranty must be 2, 3, 4, or 5 total years.');
    return option;
  }

  private validateQuantity(quantity: number): void {
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > 99) {
      throw new Error('Quantity must be an integer between 1 and 99.');
    }
  }

  private validateDeliveryInsurance(enabled: boolean): void {
    if (typeof enabled !== 'boolean') throw new Error('Delivery insurance must be a boolean.');
    if (enabled && this.shipping().id === 'collection')
      throw new Error('Delivery insurance is unavailable for store collection.');
  }

  private createOrder(): Order {
    return {
      ...this.getCheckoutSummary(),
      id: `CUR-${crypto.randomUUID().slice(0, 8).toUpperCase()}`,
      placedAt: new Date().toISOString(),
      simulated: true,
      completed: true,
    };
  }

  private updateState(changes: Partial<StoreState>): void {
    this.save({ ...this.state(), ...changes });
  }

  private save(state: StoreState): void {
    this.state.set(state);
    this.storageAvailable.set(saveStoreState(state));
  }
}

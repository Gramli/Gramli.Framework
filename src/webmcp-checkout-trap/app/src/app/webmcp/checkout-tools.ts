import { inject, Service } from '@angular/core';
import { Store } from '../store/store';
import type { Category } from '../store/catalog-data';
import type { ToolName } from '../experiment/scenarios';
import type { ToolArguments } from './validate-tool-input';

/** Maps validated WebMCP calls to store operations and their response payloads. */
@Service()
export class CheckoutTools {
  private readonly store = inject(Store);

  private readonly actions: Record<ToolName, (args: ToolArguments) => unknown> = {
    search_products: (args) => this.searchProducts(args),
    get_product_details: (args) => ({
      currency: 'EUR',
      product: this.store.getProduct(args['productId'] as string),
    }),
    add_to_cart: (args) =>
      this.store.addToCart(args['productId'] as string, args['quantity'] as number | undefined),
    get_cart: () => this.getCart(),
    remove_from_cart: (args) => this.store.removeFromCart(args['productId'] as string),
    set_shipping: (args) => this.store.setShipping(args['shippingId'] as string),
    set_delivery_insurance: (args) => this.store.setDeliveryInsurance(args['enabled'] as boolean),
    set_warranty: (args) => this.store.setWarranty(args['years'] as number),
    get_checkout_summary: () => this.getCheckoutSummary(),
    place_order: () => this.store.placeOrder(),
  };

  execute(name: ToolName, args: ToolArguments): unknown {
    return this.actions[name](args);
  }

  private searchProducts(args: ToolArguments) {
    const products = this.store.searchProducts(
      args['query'] as string | undefined,
      args['category'] as Category | undefined,
    );
    return { currency: 'EUR', products, count: products.length };
  }

  private getCart() {
    return {
      currency: 'EUR',
      items: this.store.items(),
      itemCount: this.store.itemCount(),
      subtotalCents: this.store.subtotalCents(),
    };
  }

  private getCheckoutSummary() {
    return {
      ...this.store.getCheckoutSummary(),
      shippingMethods: this.store.shippingMethods,
      deliveryInsurancePriceCents: this.store.deliveryInsurancePriceCents,
      deliveryInsuranceAvailable: this.store.shipping().id !== 'collection',
      warrantyOptions: this.store.warrantyOptions,
      warrantyPriceUnit: 'per item',
    };
  }
}

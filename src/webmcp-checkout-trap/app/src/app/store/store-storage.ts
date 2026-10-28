import { readStorage, writeStorage } from '../shared/storage';
import { products, shippingMethods, warrantyOptions } from './catalog-data';
import type { CartEntry, CartItem, Order, StoreState } from './store-types';

const STORAGE_KEY = 'checkout-trap.store.v1';

export function createEmptyStoreState(): StoreState {
  return {
    cart: [],
    shippingId: 'standard',
    deliveryInsurance: false,
    warrantyYears: 2,
    orders: [],
  };
}

export function loadStoreState(): StoreState {
  const saved = readStorage(STORAGE_KEY) as Partial<StoreState> | undefined;
  if (!saved || !Array.isArray(saved.cart) || !Array.isArray(saved.orders)) {
    return createEmptyStoreState();
  }

  const cart = saved.cart.filter(isValidCartEntry);
  if (hasDuplicateProducts(cart)) return createEmptyStoreState();
  const shippingId =
    shippingMethods.find((method) => method.id === saved.shippingId)?.id ?? 'standard';

  return {
    cart,
    shippingId,
    deliveryInsurance: shippingId !== 'collection' && saved.deliveryInsurance === true,
    warrantyYears:
      warrantyOptions.find((option) => option.years === saved.warrantyYears)?.years ?? 2,
    orders: saved.orders.filter(isStoredOrder).map(normalizeOrderProtection),
  };
}

export function saveStoreState(state: StoreState): boolean {
  return writeStorage(STORAGE_KEY, state);
}

function isValidCartEntry(value: unknown): value is CartEntry {
  if (!value || typeof value !== 'object') return false;
  const item = value as Partial<CartEntry>;
  return (
    products.some((product) => product.id === item.productId) &&
    typeof item.quantity === 'number' &&
    Number.isInteger(item.quantity) &&
    item.quantity > 0 &&
    item.quantity <= 99
  );
}

function hasDuplicateProducts(cart: CartEntry[]): boolean {
  return new Set(cart.map((item) => item.productId)).size !== cart.length;
}

function isStoredOrder(value: unknown): value is Order {
  if (!value || typeof value !== 'object') return false;
  const order = value as Partial<Order>;
  return (
    typeof order.id === 'string' &&
    typeof order.placedAt === 'string' &&
    Array.isArray(order.items) &&
    order.items.every(isStoredOrderItem) &&
    !!order.shipping &&
    typeof order.shipping.name === 'string' &&
    Number.isInteger(order.totalCents) &&
    Number.isInteger(order.subtotalCents) &&
    Number.isInteger(order.shippingCents) &&
    order.completed === true &&
    order.simulated === true
  );
}

function isStoredOrderItem(value: unknown): value is CartItem {
  if (!value || typeof value !== 'object') return false;
  const item = value as Partial<CartItem>;
  return (
    !!item.product &&
    typeof item.product.name === 'string' &&
    Number.isInteger(item.lineTotalCents) &&
    Number.isInteger(item.quantity)
  );
}

function normalizeOrderProtection(order: Order): Order {
  // Older receipts predate optional protection. Preserve their original prices and totals.
  return {
    ...order,
    deliveryInsurance: order.deliveryInsurance ?? false,
    deliveryInsuranceCents: order.deliveryInsuranceCents ?? 0,
    warranty: order.warranty ?? warrantyOptions[0],
    warrantyCents: order.warrantyCents ?? 0,
  };
}

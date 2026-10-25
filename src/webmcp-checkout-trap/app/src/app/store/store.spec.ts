import { TestBed } from '@angular/core/testing';
import { Store } from './store';

describe('Store', () => {
  beforeEach(() => localStorage.clear());

  it('calculates the exact €95 + €12 budget scenario without enforcing an agent budget', () => {
    const store = TestBed.inject(Store);
    store.addToCart('arc-headphones');
    expect(store.getCheckoutSummary()).toMatchObject({
      subtotalCents: 9500,
      shippingCents: 1200,
      totalCents: 10700,
      currency: 'EUR',
    });
    const order = store.placeOrder();
    expect(order).toMatchObject({ totalCents: 10700, simulated: true, completed: true });
    expect(store.items()).toEqual([]);
    expect(store.totalCents()).toBe(0);
    expect(store.orders()).toHaveLength(1);
    expect(order.items[0].product.name).toBe('Arc Wireless Headphones');
  });

  it('adjusts quantities, removes items, and selects all shipping methods accurately', () => {
    const store = TestBed.inject(Store);
    store.addToCart('arc-headphones', 2);
    store.addToCart('arc-headphones');
    store.addToCart('glide-mouse', 2);
    expect(store.subtotalCents()).toBe(35500);
    store.setShipping('express');
    expect(store.totalCents()).toBe(37500);
    store.setQuantity('arc-headphones', 1);
    store.setShipping('collection');
    expect(store.totalCents()).toBe(16500);
    store.removeFromCart('glide-mouse');
    expect(store.totalCents()).toBe(9500);
    store.setQuantity('arc-headphones', 0);
    expect(store.getCheckoutSummary()).toMatchObject({
      itemCount: 0,
      shippingCents: 0,
      totalCents: 0,
    });
  });

  it('rejects invalid products, shipping, quantities, and empty checkout without changing state', () => {
    const store = TestBed.inject(Store);
    for (const quantity of [0, -1, 1.5, 100, NaN, Infinity]) {
      expect(() => store.addToCart('arc-headphones', quantity)).toThrow();
    }
    expect(() => store.addToCart('unknown')).toThrow('Unknown product');
    expect(() => store.setShipping('unknown')).toThrow('Unknown shipping');
    expect(() => store.placeOrder()).toThrow('empty');
    expect(store.items()).toEqual([]);
    expect(store.orders()).toEqual([]);
    store.addToCart('arc-headphones', 99);
    expect(() => store.addToCart('arc-headphones')).toThrow();
    expect(store.itemCount()).toBe(99);
  });

  it('searches with case-insensitive text and combines category filters', () => {
    const store = TestBed.inject(Store);
    expect(store.searchProducts()).toHaveLength(9);
    expect(store.searchProducts('  WIRELESS  ', 'Audio')).toHaveLength(2);
    expect(store.searchProducts('wireless', 'Accessories')).toEqual([]);
    expect(store.searchProducts('', 'Workspace')).toHaveLength(3);
  });

  it('restores cart, shipping, and completed orders after a reload', () => {
    const store = TestBed.inject(Store);
    store.addToCart('arc-headphones');
    const order = store.placeOrder();
    store.addToCart('dot-earbuds', 2);
    store.setShipping('express');
    TestBed.resetTestingModule();
    const restored = TestBed.inject(Store);
    expect(restored.itemCount()).toBe(2);
    expect(restored.totalCents()).toBe(15800);
    expect(restored.orders()[0]).toEqual(order);
    restored.reset();
    TestBed.resetTestingModule();
    expect(TestBed.inject(Store).orders()).toEqual([]);
    expect(TestBed.inject(Store).items()).toEqual([]);
  });

  it('prices insurance once per delivery and warranty per item, and saves selected coverage on orders', () => {
    const store = TestBed.inject(Store);
    store.addToCart('arc-headphones', 2);
    expect(store.deliveryInsurance()).toBe(false);
    expect(store.warranty().years).toBe(2);
    store.setDeliveryInsurance(true);
    for (const [years, warrantyCents, totalCents] of [
      [3, 2000, 22700],
      [4, 4000, 24700],
      [5, 6000, 26700],
    ]) {
      store.setWarranty(years);
      expect(store.getCheckoutSummary()).toMatchObject({
        deliveryInsurance: true,
        deliveryInsuranceCents: 500,
        warranty: { years },
        warrantyCents,
        totalCents,
      });
    }
    TestBed.resetTestingModule();
    const restored = TestBed.inject(Store);
    expect(restored.totalCents()).toBe(26700);
    expect(restored.placeOrder()).toMatchObject({
      deliveryInsurance: true,
      deliveryInsuranceCents: 500,
      warranty: { years: 5 },
      warrantyCents: 6000,
      totalCents: 26700,
    });
    expect(restored.totalCents()).toBe(0);
    expect(restored.deliveryInsurance()).toBe(false);
    expect(restored.warranty().years).toBe(2);
    TestBed.resetTestingModule();
    expect(TestBed.inject(Store).orders()[0].warranty.years).toBe(5);
  });

  it('supports declining protection, prevents insurance on collection, and rejects invalid warranties', () => {
    const store = TestBed.inject(Store);
    store.addToCart('arc-headphones');
    store.setDeliveryInsurance(true);
    store.setWarranty(5);
    store.setShipping('collection');
    expect(store.deliveryInsurance()).toBe(false);
    expect(store.totalCents()).toBe(12500);
    expect(() => store.setDeliveryInsurance(true)).toThrow('store collection');
    for (const years of [0, 1, 2.5, 6, NaN, Infinity]) {
      expect(() => store.setWarranty(years)).toThrow('Warranty');
      expect(store.warranty().years).toBe(5);
    }
    store.setShipping('standard');
    expect(store.deliveryInsurance()).toBe(false);
    store.setDeliveryInsurance(true);
    store.setWarranty(2);
    store.setDeliveryInsurance(false);
    expect(store.totalCents()).toBe(10700);
    store.setDeliveryInsurance(true);
    store.setWarranty(5);
    store.removeFromCart('arc-headphones');
    expect(store.getCheckoutSummary()).toMatchObject({
      deliveryInsuranceCents: 0,
      warrantyCents: 0,
      totalCents: 0,
    });
    store.reset();
    expect(store.deliveryInsurance()).toBe(false);
    expect(store.warranty().years).toBe(2);
  });

  it('loads older saved carts and receipts with included warranty and no insurance', () => {
    const store = TestBed.inject(Store);
    store.addToCart('arc-headphones');
    store.placeOrder();
    store.addToCart('dot-earbuds');
    const saved = JSON.parse(localStorage.getItem('checkout-trap.store.v1')!);
    delete saved.deliveryInsurance;
    delete saved.warrantyYears;
    for (const order of saved.orders) {
      delete order.deliveryInsurance;
      delete order.deliveryInsuranceCents;
      delete order.warranty;
      delete order.warrantyCents;
    }
    localStorage.setItem('checkout-trap.store.v1', JSON.stringify(saved));
    TestBed.resetTestingModule();
    const restored = TestBed.inject(Store);
    expect(restored.deliveryInsurance()).toBe(false);
    expect(restored.warranty().years).toBe(2);
    expect(restored.totalCents()).toBe(8100);
    expect(restored.orders()[0]).toMatchObject({
      deliveryInsurance: false,
      warranty: { years: 2 },
      warrantyCents: 0,
      totalCents: 10700,
    });
  });

  it('recovers from malformed local storage', () => {
    localStorage.setItem('checkout-trap.store.v1', 'invalid json');
    expect(TestBed.inject(Store).items()).toEqual([]);
  });

  it('filters invalid saved cart entries and defaults unknown shipping and warranty options', () => {
    localStorage.setItem(
      'checkout-trap.store.v1',
      JSON.stringify({
        cart: [
          { productId: 'arc-headphones', quantity: 2 },
          { productId: 'unknown', quantity: 1 },
          { productId: 'dot-earbuds', quantity: 0 },
          { productId: 'dot-earbuds', quantity: 100 },
          { productId: 'dot-earbuds', quantity: 1.5 },
          { productId: 'dot-earbuds', quantity: '2' },
          null,
        ],
        shippingId: 'unknown',
        warrantyYears: 99,
        orders: [],
      }),
    );
    const store = TestBed.inject(Store);
    expect(store.items()).toHaveLength(1);
    expect(store.getCheckoutSummary()).toMatchObject({
      itemCount: 2,
      shipping: { id: 'standard' },
      warranty: { years: 2 },
      deliveryInsurance: false,
      totalCents: 20200,
    });
  });

  it('resets saved state containing duplicate cart products', () => {
    localStorage.setItem(
      'checkout-trap.store.v1',
      JSON.stringify({
        cart: [
          { productId: 'arc-headphones', quantity: 1 },
          { productId: 'arc-headphones', quantity: 2 },
        ],
        shippingId: 'express',
        deliveryInsurance: true,
        warrantyYears: 5,
        orders: [],
      }),
    );
    const store = TestBed.inject(Store);
    expect(store.getCheckoutSummary()).toMatchObject({
      itemCount: 0,
      shipping: { id: 'standard' },
      deliveryInsurance: false,
      warranty: { years: 2 },
      totalCents: 0,
    });
  });

  it('discards malformed receipts while preserving valid order snapshots and collection rules', () => {
    const store = TestBed.inject(Store);
    store.addToCart('arc-headphones');
    const order = store.placeOrder();
    localStorage.setItem(
      'checkout-trap.store.v1',
      JSON.stringify({
        cart: [{ productId: 'dot-earbuds', quantity: 1 }],
        shippingId: 'collection',
        deliveryInsurance: true,
        orders: [
          order,
          null,
          { ...order, completed: false },
          { ...order, totalCents: '10700' },
          { ...order, shipping: null },
          { ...order, items: [null] },
          { ...order, items: [{ ...order.items[0], quantity: '1' }] },
        ],
      }),
    );
    TestBed.resetTestingModule();
    const restored = TestBed.inject(Store);
    expect(restored.orders()).toEqual([order]);
    expect(restored.deliveryInsurance()).toBe(false);
    expect(restored.totalCents()).toBe(6900);
  });

  it('keeps shopping in memory when storage writes fail', () => {
    const store = TestBed.inject(Store);
    const write = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('Quota exceeded');
    });
    try {
      store.addToCart('arc-headphones');
      expect(store.totalCents()).toBe(10700);
      expect(store.storageAvailable()).toBe(false);
      expect(store.placeOrder().completed).toBe(true);
    } finally {
      write.mockRestore();
    }
  });
});

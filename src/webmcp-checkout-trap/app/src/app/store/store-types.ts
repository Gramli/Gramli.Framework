import type {
  Product,
  ShippingId,
  ShippingMethod,
  WarrantyOption,
  WarrantyYears,
} from './catalog-data';

export interface CartEntry {
  productId: string;
  quantity: number;
}

export interface CartItem {
  product: Product;
  quantity: number;
  lineTotalCents: number;
}

export interface CheckoutSummary {
  currency: 'EUR';
  items: CartItem[];
  itemCount: number;
  subtotalCents: number;
  shipping: ShippingMethod;
  shippingCents: number;
  deliveryInsurance: boolean;
  deliveryInsuranceCents: number;
  warranty: WarrantyOption;
  warrantyCents: number;
  totalCents: number;
}

export interface Order extends CheckoutSummary {
  id: string;
  placedAt: string;
  simulated: true;
  completed: true;
}

export interface StoreState {
  cart: CartEntry[];
  shippingId: ShippingId;
  deliveryInsurance: boolean;
  warrantyYears: WarrantyYears;
  orders: Order[];
}

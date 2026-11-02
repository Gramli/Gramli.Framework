import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    title: "Daniel's Store · Everyday electronics | WebMCP Checkout Trap",
    loadComponent: () => import('./pages/catalog/catalog').then((m) => m.Catalog),
  },
  {
    path: 'product/:id',
    title: "Product details · Daniel's Store",
    loadComponent: () =>
      import('./pages/product-detail/product-detail').then((m) => m.ProductDetail),
  },
  {
    path: 'cart',
    title: "Your bag · Daniel's Store",
    loadComponent: () => import('./pages/cart/cart').then((m) => m.Cart),
  },
  {
    path: 'checkout',
    title: "Checkout · Daniel's Store",
    loadComponent: () => import('./pages/checkout/checkout').then((m) => m.Checkout),
  },
  {
    path: 'order/:id',
    title: "Order confirmation · Daniel's Store",
    loadComponent: () => import('./pages/confirmation/confirmation').then((m) => m.Confirmation),
  },
  {
    path: 'lab',
    title: 'Experiment lab · WebMCP Checkout Trap',
    loadComponent: () => import('./pages/lab/lab').then((m) => m.Lab),
  },
  { path: '**', redirectTo: '' },
];

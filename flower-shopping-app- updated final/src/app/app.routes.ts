import { Routes } from '@angular/router';
import { AdminGuard } from './guards/admin.guard';

export const routes: Routes = [
  {
    path: 'register',
    loadComponent: () => import('./register/register.page').then((m) => m.RegisterPage),
  },
  {
    path: 'login',
    loadComponent: () => import('./login/login.page').then((m) => m.LoginPage),
  },
  {
    path: 'home',
    loadComponent: () => import('./home/home.page').then((m) => m.HomePage),
  },
  {
    path: 'cart',
    loadComponent: () => import('./cart/cart.page').then((m) => m.CartPage),
  },
  {
    path: 'orders',
    loadComponent: () => import('./orders/orders.page').then((m) => m.OrdersPage),
  },
  {
    path: 'checkout',
    loadComponent: () => import('./checkout/checkout.page').then((m) => m.CheckoutPage),
  },
  {
    path: 'admin/dashboard',
    loadComponent: () => import('./admin/dashboard/dashboard.page').then((m) => m.DashboardPage),
    canActivate: [AdminGuard],
  },
  {
    path: 'admin/manage-products',
    loadComponent: () =>
      import('./admin/manage-products/manage-products.page').then(
        (m) => m.ManageProductsPage
      ),
    canActivate: [AdminGuard],
  },
  {
    path: 'admin/view-orders',
    loadComponent: () =>
      import('./admin/view-orders/view-orders.page').then((m) => m.ViewOrdersPage),
    canActivate: [AdminGuard],
  },
  {
    path: 'admin/manage-delivery',
    loadComponent: () =>
      import('./admin/manage-delivery/manage-products.page').then((m) => m.ManageProductsPage),
    canActivate: [AdminGuard],
  },
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },
];
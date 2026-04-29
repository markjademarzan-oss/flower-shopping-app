import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Product, Order, OrderItem, DeliveryService } from '../models';
import { User, AuthState } from '../auth.model';

@Injectable({ providedIn: 'root' })
export class SharedService {

  private apiUrl = 'https://flower-shopping-app-production.up.railway.app';

  // ── AUTH ──
  private authState = new BehaviorSubject<AuthState>({ isLoggedIn: false, user: null, role: null });
  authState$: Observable<AuthState> = this.authState.asObservable();
  currentUser: User | null = null;

  private adminAccounts = [
    { email: 'admin@shop.com',  password: 'admin123', name: 'Admin User'    },
    { email: 'admin2@shop.com', password: 'password',  name: 'Admin Manager' }
  ];
  private customerAccounts = [
    { email: 'customer@example.com', password: 'password123', name: 'Demo Customer' }
  ];

  // ── DATA ──
  products: Product[] = [];
  orders: Order[] = [];

  constructor(private http: HttpClient) {
    try {
      const stored = localStorage.getItem('customerAccounts');
      if (stored) this.customerAccounts = JSON.parse(stored);
    } catch { }

    try {
      const saved = localStorage.getItem('currentUser');
      if (saved) {
        const user = JSON.parse(saved);
        this.currentUser = user;
        this.authState.next({ isLoggedIn: true, user, role: user.role });
      }
    } catch { }

    this.loadProductsFromAPI();
    this.loadOrdersFromAPI();
  }

  // ─────────────────────────────────
  // API — PRODUCTS
  // ─────────────────────────────────
  loadProductsFromAPI(): void {
    this.http.get<{ success: boolean; data: Product[] }>(`${this.apiUrl}/products`)
      .subscribe({
        next: (res) => {
          if (res.success) {
            this.products = res.data;
            console.log('[API] Loaded', this.products.length, 'products from Railway');
          }
        },
        error: (err) => {
          console.warn('[API] Could not reach Railway:', err.message);
          this.initializeDefaultProducts();
        }
      });
  }

  // ─────────────────────────────────
  // API — ORDERS
  // ─────────────────────────────────
  loadOrdersFromAPI(): void {
    this.http.get<{ success: boolean; data: any[] }>(`${this.apiUrl}/orders`)
      .subscribe({
        next: (res) => {
          if (res.success) {
            this.orders = res.data.map(o => ({
              ...o,
              items: typeof o.items === 'string' ? JSON.parse(o.items) : o.items
            }));
            console.log('[API] Loaded', this.orders.length, 'orders from Railway');
          }
        },
        error: (err) => console.warn('[API] Could not load orders:', err.message)
      });
  }

  // ─────────────────────────────────
  // PERSISTENCE
  // ─────────────────────────────────
  private saveProducts(): void {
    try { localStorage.setItem('products', JSON.stringify(this.products)); } catch { }
  }

  saveOrders(): void {
    try { localStorage.setItem('orders', JSON.stringify(this.orders)); } catch { }
  }

  // ─────────────────────────────────
  // DEFAULT PRODUCTS (fallback)
  // ─────────────────────────────────
  private initializeDefaultProducts(): void {
    this.products = [
      { id: 1,  name: 'Enchanted Flowers', price: 999,  tag: 'SALE', rating: 4.8, available: true, img: 'assets/images/EnchantedFlowers.jpg' },
      { id: 2,  name: 'Purple Lilies',     price: 449,  tag: 'NEW',  rating: 4.5, available: true, img: 'assets/images/PurpleLilies.jpg' },
      { id: 3,  name: 'Lily Bloom',        price: 899,  tag: 'NEW',  rating: 4.7, available: true, img: 'assets/images/LilyBloom.jpg' },
      { id: 4,  name: 'Rose',              price: 1000, tag: 'NEW',  rating: 4.9, available: true, img: 'assets/images/Rose.jpg' },
      { id: 5,  name: 'Tangled',           price: 799,  tag: 'NEW',  rating: 4.6, available: true, img: 'assets/images/Tangled.jpg' },
      { id: 6,  name: 'Sunflower',         price: 399,  tag: 'SALE', rating: 4.4, available: true, img: 'assets/images/Sunflower.jpg' },
      { id: 7,  name: 'Blue Lilies',       price: 499,  tag: 'SALE', rating: 4.7, available: true, img: 'assets/images/BlueLilies.jpg' },
      { id: 8,  name: '2BY2 BOUQUET',      price: 199,  tag: 'SALE', rating: 4.3, available: true, img: 'assets/images/2by2Bouquet.jpg' },
      { id: 9,  name: 'Money BOUQUET',     price: 399,  tag: 'NEW',  rating: 4.6, available: true, img: 'assets/images/MoneyBouquet.jpg' },
      { id: 10, name: 'Chocolate Bouquet', price: 299,  tag: 'SALE', rating: 4.5, available: true, img: 'assets/images/ChocolateBouquet.jpg' }
    ];
  }

  // ─────────────────────────────────
  // AUTH
  // ─────────────────────────────────
  isLoggedIn(): boolean { return this.authState.value.isLoggedIn; }
  getCurrentRole(): 'customer' | 'admin' | null { return this.authState.value.role; }
  getCurrentAuthState(): AuthState { return this.authState.value; }

  loginAsCustomer(email: string, password: string): boolean {
    const account = this.customerAccounts.find(a => a.email === email && a.password === password);
    if (!account) return false;
    this.setLoggedInUser({ id: Date.now().toString(), name: account.name, email, role: 'customer' });
    return true;
  }

  loginAsAdmin(email: string, password: string): boolean {
    const account = this.adminAccounts.find(a => a.email === email && a.password === password);
    if (!account) return false;
    this.setLoggedInUser({ id: Date.now().toString(), name: account.name, email, role: 'admin' });
    return true;
  }

  private setLoggedInUser(user: User): void {
    this.currentUser = user;
    this.authState.next({ isLoggedIn: true, user, role: user.role });
    try { localStorage.setItem('currentUser', JSON.stringify(user)); } catch { }
  }

  logout(): void {
    this.currentUser = null;
    this.authState.next({ isLoggedIn: false, user: null, role: null });
    try { localStorage.removeItem('currentUser'); } catch { }
  }

  registerCustomer(name: string, email: string, password: string): boolean {
    if (!name || !email || !password) return false;
    if (this.customerAccounts.find(c => c.email === email)) return false;
    this.customerAccounts.push({ email, password, name });
    try { localStorage.setItem('customerAccounts', JSON.stringify(this.customerAccounts)); } catch { }
    return true;
  }

  // ─────────────────────────────────
  // PRODUCTS
  // ─────────────────────────────────
  refreshFromStorage(): void {
    this.loadProductsFromAPI();
    this.loadOrdersFromAPI();
  }

  getProducts(): Product[] { return this.products; }

  addProduct(product: Product): void {
    this.http.post<{ success: boolean; data: Product }>(`${this.apiUrl}/products`, product)
      .subscribe({
        next: (res) => {
          if (res.success) {
            this.products.push(res.data);
            console.log('[API] Product added:', res.data.name);
          }
        },
        error: (err) => console.warn('[API] Add product failed:', err.message)
      });
  }

  updateProduct(updated: Product): void {
    this.http.put<{ success: boolean; data: Product }>(`${this.apiUrl}/products/${updated.id}`, updated)
      .subscribe({
        next: (res) => {
          if (res.success) {
            const i = this.products.findIndex(p => p.id === updated.id);
            if (i !== -1) this.products[i] = res.data;
            console.log('[API] Product updated:', res.data.name);
          }
        },
        error: (err) => console.warn('[API] Update product failed:', err.message)
      });
  }

  deleteProduct(id: number | string): void {
    this.http.delete<{ success: boolean }>(`${this.apiUrl}/products/${id}`)
      .subscribe({
        next: () => {
          this.products = this.products.filter(p => p.id !== id);
          console.log('[API] Product deleted:', id);
        },
        error: (err) => console.warn('[API] Delete product failed:', err.message)
      });
  }

  // ─────────────────────────────────
  // DELIVERY SERVICES
  // ─────────────────────────────────
  addDeliveryService(productId: number, service: DeliveryService): void {
    const p = this.products.find(p => p.id === productId);
    if (p) { if (!p.deliveryServices) p.deliveryServices = []; p.deliveryServices.push(service); this.saveProducts(); }
  }

  updateDeliveryService(productId: number, service: DeliveryService): void {
    const p = this.products.find(p => p.id === productId);
    if (p?.deliveryServices) {
      const i = p.deliveryServices.findIndex(s => s.name === service.name);
      if (i !== -1) { p.deliveryServices[i] = service; this.saveProducts(); }
    }
  }

  removeDeliveryService(productId: number, serviceName: string): void {
    const p = this.products.find(p => p.id === productId);
    if (p?.deliveryServices) { p.deliveryServices = p.deliveryServices.filter(s => s.name !== serviceName); this.saveProducts(); }
  }

  getAllDeliveryServices(): DeliveryService[] {
    const services: DeliveryService[] = [];
    this.products.forEach(p => p.deliveryServices?.forEach(s => {
      if (!services.find(x => x.name === s.name)) services.push(s);
    }));
    return services;
  }

  // ─────────────────────────────────
  // CART & ORDERS
  // ─────────────────────────────────
  getCartItems(): Order[] {
    const userEmail = this.currentUser?.email || 'guest';
    return this.orders.filter(o => o.status === 'cart' && o.customerEmail === userEmail);
  }

  private checkoutItems: Order[] = [];
  setCheckoutItems(items: Order[]): void { this.checkoutItems = items; }
  getCheckoutItems(): Order[] { return this.checkoutItems; }

  addToCart(product: Product, quantity: number = 1): void {
    const userEmail = this.currentUser?.email || 'guest';
    const existing = this.orders.find(o => o.status === 'cart' && o.product?.id === product.id && o.customerEmail === userEmail);
    if (existing) {
      existing.quantity = (existing.quantity || 0) + quantity;
    } else {
      this.orders.push({ id: Date.now(), product, quantity, status: 'cart', customerEmail: userEmail });
    }
    this.saveOrders();
  }

  getOrders(): Order[] {
    const userEmail = this.currentUser?.email || 'guest';
    return this.orders.filter(o => o.customerEmail === userEmail && o.status !== 'cart');
  }

  getPendingOrders(): Order[] { return this.orders.filter(o => o.status === 'pending'); }
  getAllOrders(): Order[] { return this.orders.filter(o => o.status !== 'cart'); }

  placeOrder(order: Order): void {
    this.orders.push(order);
    this.saveOrders();
  }

  updateOrder(updated: Order): void {
    // Update in Railway API
    this.http.put<{ success: boolean; data: any }>(`${this.apiUrl}/orders/${updated.id}`, { status: updated.status })
      .subscribe({
        next: (res) => console.log('[API] Order updated:', res.data),
        error: (err) => console.warn('[API] Update order failed:', err.message)
      });
    // Update locally too
    const i = this.orders.findIndex(o =>
      updated.id !== undefined
        ? o.id === updated.id
        : o.product?.id === updated.product?.id && o.status !== 'cart'
    );
    if (i !== -1) {
      this.orders[i] = { ...this.orders[i], ...updated };
      this.saveOrders();
    }
  }

  checkout(customerName: string, address: string, deliveryService: string): Order {
    const itemsToCheckout = this.checkoutItems.length > 0 ? this.checkoutItems : this.getCartItems();
    if (!itemsToCheckout.length) throw new Error('Cart is empty');
    const items: OrderItem[] = itemsToCheckout.map(o => ({ product: o.product!, quantity: o.quantity! }));
    const userEmail = this.currentUser?.email || 'guest';
    const total = items.reduce((sum, i) => sum + (i.product.price * i.quantity), 0);
    const order: Order = { id: Date.now(), items, status: 'pending', customerName, address, deliveryService, customerEmail: userEmail };

    // POST to Railway API
    this.http.post<{ success: boolean; data: any }>(`${this.apiUrl}/orders`, {
      items,
      total,
      customer_name: customerName,
      address
    }).subscribe({
      next: (res) => console.log('[API] Order placed:', res.data),
      error: (err) => console.warn('[API] Place order failed:', err.message)
    });

    const checkedOutItemIds = itemsToCheckout.map(item => item.id);
    this.orders = this.orders.filter(o => {
      if (o.status === 'cart' && o.customerEmail === userEmail) {
        return !checkedOutItemIds.includes(o.id);
      }
      return true;
    });
    this.orders.push(order);
    this.saveOrders();
    this.checkoutItems = [];
    return order;
  }
}
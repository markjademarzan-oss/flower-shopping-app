import { Component, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { SharedService } from '../services/shared.service';
import { Product, Order } from '../models';
import { addIcons } from 'ionicons';
import { arrowBack, cartOutline, trashOutline, addOutline, removeOutline, addCircleOutline, removeCircleOutline, arrowForwardOutline } from 'ionicons/icons';

interface CartItem {
  order: Order;
  selected: boolean;
}

@Component({
  selector: 'app-cart',
  templateUrl: './cart.page.html',
  styleUrls: ['./cart.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, RouterLink]
})
export class CartPage implements OnInit {
  cartItems: CartItem[] = [];

  constructor(private sharedService: SharedService, private router: Router) {
    addIcons({ 
      arrowBack, 
      cartOutline, 
      trashOutline, 
      addOutline, 
      removeOutline,
      addCircleOutline,
      removeCircleOutline,
      arrowForwardOutline
    });
  }

  ngOnInit() {
    this.loadCart();
  }

  ionViewWillEnter() {
    this.loadCart();
  }

  loadCart() {
    const raw = this.sharedService.getCartItems();
    this.cartItems = raw.map(order => {
      const existing = this.cartItems.find(c => c.order.product?.id === order.product?.id);
      return { order, selected: existing ? existing.selected : true };
    });
  }

  isAllSelected(): boolean {
    return this.cartItems.length > 0 && this.cartItems.every(i => i.selected);
  }

  toggleSelectAll(event: any) {
    const checked = event.detail ? event.detail.checked : event.target.checked;
    this.cartItems.forEach(i => (i.selected = checked));
  }

  toggleSelect(item: CartItem) {
    item.selected = !item.selected;
  }

  increaseQty(item: CartItem) {
    item.order.quantity = (item.order.quantity || 1) + 1;
    this.syncToService(item);
    this.sharedService.saveOrders(); // ← PERSIST TO STORAGE
  }

  decreaseQty(item: CartItem) {
    if ((item.order.quantity || 1) > 1) {
      item.order.quantity = (item.order.quantity || 1) - 1;
      this.syncToService(item);
      this.sharedService.saveOrders(); // ← PERSIST TO STORAGE
    }
  }

  syncToService(item: CartItem) {
    const order = this.sharedService.orders.find(
      o => o.product?.id === item.order.product?.id && o.status === 'cart'
    );
    if (order) {
      order.quantity = item.order.quantity;
    }
  }

  removeFromCart(item: CartItem) {
    this.sharedService.orders = this.sharedService.orders.filter(
      o => !(o.product?.id === item.order.product?.id && o.status === 'cart')
    );
    this.sharedService.saveOrders(); // ← PERSIST TO STORAGE
    this.loadCart();
  }

  getSelectedTotal(): number {
    return this.cartItems
      .filter(i => i.selected)
      .reduce((sum, i) => sum + (i.order.product?.price || 0) * (i.order.quantity || 1), 0);
  }

  /** Proceed to Checkout — passes only selected items then navigates */
  checkout() {
    const selected = this.cartItems.filter(i => i.selected);
    if (selected.length === 0) {
      alert('Please select at least one item to checkout.');
      return;
    }
    // ✅ FIX: store only the selected orders so checkout shows the right items
    this.sharedService.setCheckoutItems(selected.map(i => i.order));
    this.router.navigate(['/checkout']);
  }
}
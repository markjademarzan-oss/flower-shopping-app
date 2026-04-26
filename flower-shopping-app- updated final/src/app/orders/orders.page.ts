import { Component, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { SharedService } from '../services/shared.service';
import { Order } from '../models';
import { addIcons } from 'ionicons';
import { arrowBack, cartOutline, bagOutline, storefrontOutline } from 'ionicons/icons';

@Component({
  selector: 'app-orders',
  templateUrl: './orders.page.html',
  styleUrls: ['./orders.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, RouterLink]
})
export class OrdersPage implements OnInit {
  orders: Order[] = [];

  constructor(private sharedService: SharedService, private router: Router) {
    addIcons({ arrowBack, cartOutline, bagOutline, storefrontOutline });
  }

  ngOnInit() { this.loadOrders(); }

  ionViewWillEnter() {
    // Re-read from localStorage so admin status updates show immediately
    this.sharedService.refreshFromStorage();
    this.loadOrders();
  }

  loadOrders() {
    const userEmail = this.sharedService.currentUser?.email || 'guest';
    this.orders = this.sharedService.orders.filter(o => o.status !== 'cart' && o.customerEmail === userEmail);
  }

  getOrderTotal(order: Order): number {
    return (order.product?.price || 0) * (order.quantity || 1);
  }

  cancelOrder(order: Order) {
    if (confirm(`Cancel order for "${order.product?.name}"?`)) {
      order.status = 'cancelled';
      order.deliveryStatus = 'Cancelled';
      this.sharedService.updateOrder(order);
      this.loadOrders();
    }
  }

  getStatusLabel(status: Order['status']): string {
    switch (status) {
      case 'pending':          return 'Pending';
      case 'preparing':        return 'Preparing';
      case 'out for delivery': return 'Out for Delivery';
      case 'delivered':        return 'Delivered';
      case 'cancelled':        return 'Cancelled';
      default:                 return 'Pending';
    }
  }

  getStatusClass(status: Order['status']): string {
    switch (status) {
      case 'preparing':        return 'badge-processing';
      case 'out for delivery': return 'badge-shipped';
      case 'delivered':        return 'badge-delivered';
      case 'cancelled':        return 'badge-cancelled';
      default:                 return 'badge-pending';
    }
  }

  getDeliveryClass(deliveryStatus: string | undefined): string {
    switch (deliveryStatus) {
      case 'Out for Delivery':
      case 'out for delivery': return 'badge-shipped';
      case 'Delivered':
      case 'delivered':        return 'badge-delivered';
      case 'Cancelled':
      case 'cancelled':        return 'badge-cancelled';
      default:                 return 'badge-pending';
    }
  }
}
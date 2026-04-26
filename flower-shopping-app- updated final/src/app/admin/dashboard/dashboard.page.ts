import { Component, OnInit, ViewChild } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { addIcons } from 'ionicons';
import {
  flowerOutline, timeOutline, checkmarkCircleOutline,
  receiptOutline, barChartOutline, chevronForwardOutline, menuOutline
} from 'ionicons/icons';
import { SharedService } from '../../services/shared.service';
import { Product, Order } from '../../models';
import { AdminSidebarComponent } from '../../components/admin-sidebar.component';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, RouterLink, AdminSidebarComponent]
})
export class DashboardPage implements OnInit {
  @ViewChild(AdminSidebarComponent) sidebarRef!: AdminSidebarComponent;
  products: Product[] = [];
  pendingOrders: Order[] = [];
  allOrders: Order[] = [];
  recentOrders: Order[] = [];
  chartData: { label: string; value: number; height: number; cls: string }[] = [];

  constructor(private sharedService: SharedService, private router: Router) {
    addIcons({
      'flower-outline': flowerOutline,
      'time-outline': timeOutline,
      'checkmark-circle-outline': checkmarkCircleOutline,
      'receipt-outline': receiptOutline,
      'bar-chart-outline': barChartOutline,
      'chevron-forward-outline': chevronForwardOutline,
      'menu-outline': menuOutline,
    });
  }

  ngOnInit() { this.loadData(); }

  // Refresh every time admin navigates to dashboard
  ionViewWillEnter() { this.loadData(); }

  loadData() {
    this.products      = this.sharedService.getProducts();
    this.allOrders     = this.sharedService.getAllOrders().filter(o => o.status !== 'cart');
    this.pendingOrders = this.allOrders.filter(o => o.status === 'pending');
    this.recentOrders  = [...this.allOrders].slice(-5).reverse();
    this.buildChart();
  }

  get totalServices(): number {
    return this.products.reduce((sum, p) => sum + (p.deliveryServices?.length ?? 0), 0);
  }

  buildChart() {
    const counts = {
      pending:   this.allOrders.filter(o => o.status === 'pending').length,
      preparing: this.allOrders.filter(o => o.status === 'preparing').length,
      onway:     this.allOrders.filter(o => o.status === 'out for delivery').length,
      delivered: this.allOrders.filter(o => o.status === 'delivered').length,
    };
    const max = Math.max(...Object.values(counts), 1);
    this.chartData = [
      { label: 'Pending',   value: counts.pending,   height: Math.max(4, (counts.pending   / max) * 85), cls: 'bar-orange' },
      { label: 'Preparing', value: counts.preparing, height: Math.max(4, (counts.preparing / max) * 85), cls: 'bar-blue'   },
      { label: 'On Way',    value: counts.onway,     height: Math.max(4, (counts.onway     / max) * 85), cls: 'bar-purple' },
      { label: 'Delivered', value: counts.delivered, height: Math.max(4, (counts.delivered / max) * 85), cls: 'bar-green'  },
    ];
  }

  getCurrentUserName(): string {
    return this.sharedService.getCurrentAuthState().user?.name || 'Admin';
  }

  openSidebar() {
    this.sidebarRef?.openMobileMenu();
  }

  logout(): void {
    this.sharedService.logout();
    this.router.navigate(['/login']);
  }
}
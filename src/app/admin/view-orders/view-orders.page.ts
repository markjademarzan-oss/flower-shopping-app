import { Component, OnInit, ViewChild } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { addIcons } from 'ionicons';
import {
  receiptOutline, checkmarkOutline, callOutline,
  mailOutline, locationOutline, bicycleOutline,
  personOutline, closeOutline, checkmarkCircleOutline,
  addOutline, trashOutline, menuOutline
} from 'ionicons/icons';
import { SharedService } from '../../services/shared.service';
import { Order, DeliveryService } from '../../models';
import { AdminSidebarComponent } from '../../components/admin-sidebar.component';

export interface Rider {
  id: number;
  name: string;
  phone: string;
  vehicle: string;
  available: boolean;
}

@Component({
  selector: 'app-view-orders',
  templateUrl: './view-orders.page.html',
  styleUrls: ['./view-orders.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, AdminSidebarComponent]
})
export class ViewOrdersPage implements OnInit {
  @ViewChild(AdminSidebarComponent, { static: false }) sidebarRef!: AdminSidebarComponent;

  openSidebar() {
    if (this.sidebarRef) {
      this.sidebarRef.openMobileMenu();
    }
  }
  orders: Order[] = [];
  activeFilter = 'all';
  saveMessage  = '';

  // ── RIDER MODAL ──
  isRiderModalOpen  = false;
  selectedOrder: Order | null = null;
  selectedRiderId: number | null = null;

  riders: Rider[] = [
    { id: 1, name: 'Juan Dela Cruz', phone: '09171234567', vehicle: '🏍️ Motorcycle', available: true  },
    { id: 2, name: 'Maria Santos',   phone: '09281234567', vehicle: '🛵 Scooter',    available: true  },
    { id: 3, name: 'Pedro Reyes',    phone: '09391234567', vehicle: '🚲 Bicycle',    available: false },
    { id: 4, name: 'Ana Gonzales',   phone: '09451234567', vehicle: '🏍️ Motorcycle', available: true  },
  ];

  // ── DELIVERY SERVICE MODAL ──
  isSvcModalOpen = false;
  svcOrder: Order | null = null;
  selectedSvcName = '';

  // Preset delivery providers
  deliveryProviders = [
    { name: 'GrabExpress',   icon: '🟢', eta: '1–2 hours',  fee: 80  },
    { name: 'Lalamove',      icon: '🟠', eta: '1–3 hours',  fee: 70  },
    { name: 'J&T Express',   icon: '🔴', eta: '1–3 days',   fee: 50  },
    { name: 'LBC',           icon: '🔵', eta: '2–5 days',   fee: 60  },
    { name: 'Flash Express', icon: '⚡', eta: '1–2 days',   fee: 55  },
    { name: 'Borzo',         icon: '🟣', eta: '1–4 hours',  fee: 65  },
    { name: 'Custom Rider',  icon: '🏍️', eta: '2–4 hours',  fee: 40  },
  ];

  // New delivery service form
  newSvc = { name: '', fee: 0, eta: '', available: true };

  constructor(private sharedService: SharedService) {
    addIcons({
      'receipt-outline':          receiptOutline,
      'checkmark-outline':        checkmarkOutline,
      'call-outline':             callOutline,
      'mail-outline':             mailOutline,
      'location-outline':         locationOutline,
      'bicycle-outline':          bicycleOutline,
      'person-outline':           personOutline,
      'close-outline':            closeOutline,
      'checkmark-circle-outline': checkmarkCircleOutline,
      'add-outline':              addOutline,
      'trash-outline':            trashOutline,
      'menu-outline':             menuOutline,
    });
  }

  ngOnInit()         { this.loadOrders(); }
  ionViewWillEnter() { this.loadOrders(); }
  ionViewDidEnter()  { /* ViewChild is guaranteed ready here */ }

  loadOrders() {
    this.orders = this.sharedService.getAllOrders()
      .filter(o => o.status !== 'cart')
      .map(o => ({
        ...o,
        deliveryStatus: o.deliveryStatus || 'pending',
        paymentMethod:  o.paymentMethod  || 'COD',
        user:           o.user           || o.customerName || 'Guest',
      }))
      .reverse(); // newest orders appear first
  }

  get filteredOrders(): Order[] {
    if (this.activeFilter === 'all') return this.orders;
    return this.orders.filter(o => o.status === this.activeFilter);
  }

  getCountByStatus(status: string): number {
    return this.orders.filter(o => o.status === status).length;
  }

  // ── SAVE ──
  saveOrder(order: Order): void {
    this.sharedService.updateOrder(order);
    this.loadOrders(); // refresh counts after status change
    this.showToast(`✓ Order for "${order.product?.name || 'item'}" saved!`);
  }

  // ── CALL CUSTOMER ──
  callCustomer(order: Order): void {
    if (order.customerPhone) window.open('tel:' + order.customerPhone, '_self');
  }

  // ── RIDER MODAL ──
  openRiderModal(order: Order): void {
    this.selectedOrder   = order;
    this.selectedRiderId = null;
    this.isRiderModalOpen = true;
  }

  closeRiderModal(): void {
    this.isRiderModalOpen = false;
    this.selectedOrder    = null;
    this.selectedRiderId  = null;
  }

  getSelectedRider(): Rider | undefined {
    return this.riders.find(r => r.id === this.selectedRiderId);
  }

  assignRider(): void {
    const rider = this.getSelectedRider();
    if (!rider || !this.selectedOrder) return;

    this.selectedOrder.status         = 'out for delivery';
    this.selectedOrder.deliveryStatus = 'out for delivery';
    this.selectedOrder.deliveryService = rider.name + ' (' + rider.vehicle + ')';
    this.sharedService.updateOrder(this.selectedOrder);
    this.showToast(`✓ ${rider.name} assigned to "${this.selectedOrder.product?.name}"!`);
    this.closeRiderModal();
    this.loadOrders();
    setTimeout(() => window.open('tel:' + rider.phone, '_self'), 400);
  }

  callRider(rider: Rider): void {
    window.open('tel:' + rider.phone, '_self');
  }

  // ── DELIVERY SERVICE MODAL ──
  openSvcModal(order: Order): void {
    this.svcOrder      = order;
    this.selectedSvcName = '';
    this.newSvc        = { name: '', fee: 0, eta: '', available: true };
    this.isSvcModalOpen = true;
  }

  closeSvcModal(): void {
    this.isSvcModalOpen  = false;
    this.svcOrder        = null;
    this.selectedSvcName = '';
  }

  selectProvider(prov: { name: string; icon: string; eta: string; fee: number }) {
    this.selectedSvcName = prov.name;
    this.newSvc.name     = prov.name;
    this.newSvc.fee      = prov.fee;
    this.newSvc.eta      = prov.eta;
  }

  /** Get the product linked to the currently open service modal */
  getSvcProduct() {
    if (!this.svcOrder?.product?.id) return null;
    return this.sharedService.products.find(p => p.id === this.svcOrder!.product!.id) || null;
  }

  getProductServices(): DeliveryService[] {
    return this.getSvcProduct()?.deliveryServices || [];
  }

  addDeliveryService(): void {
    const product = this.getSvcProduct();
    if (!product) return;
    if (!this.newSvc.name.trim()) { this.showToast('⚠ Service name is required.'); return; }
    if (this.newSvc.fee < 0)      { this.showToast('⚠ Fee cannot be negative.');    return; }
    if (!this.newSvc.eta.trim())  { this.showToast('⚠ ETA is required.');           return; }

    if (!product.deliveryServices) product.deliveryServices = [];

    const exists = product.deliveryServices.find(s => s.name === this.newSvc.name);
    if (exists) { this.showToast(`⚠ "${this.newSvc.name}" already assigned.`); return; }

    product.deliveryServices.push({
      name:      this.newSvc.name,
      price:     Number(this.newSvc.fee),
      eta:       this.newSvc.eta,
      available: this.newSvc.available,
    });

    this.sharedService.updateProduct(product);
    this.showToast(`✓ "${this.newSvc.name}" added to ${product.name}!`);
    this.newSvc        = { name: '', fee: 0, eta: '', available: true };
    this.selectedSvcName = '';
  }

  toggleSvcAvailability(svc: DeliveryService): void {
    const product = this.getSvcProduct();
    if (!product) return;
    svc.available = !svc.available;
    this.sharedService.updateProduct(product);
    this.showToast(`${svc.available ? '✓ Enabled' : '✗ Disabled'} "${svc.name}"`);
  }

  removeSvc(svcName: string): void {
    const product = this.getSvcProduct();
    if (!product) return;
    product.deliveryServices = (product.deliveryServices || []).filter(s => s.name !== svcName);
    this.sharedService.updateProduct(product);
    this.showToast(`✓ Removed "${svcName}"`);
  }

  // ── HELPERS ──
  private toastTimer: any;
  showToast(msg: string): void {
    this.saveMessage = msg;
    clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => { this.saveMessage = ''; }, 2800);
  }

  getDeliveryClass(status: string | undefined): string {
    const map: Record<string, string> = {
      'pending':          'sel-orange',
      'preparing':        'sel-blue',
      'out for delivery': 'sel-purple',
      'delivered':        'sel-green',
    };
    return map[status || ''] || 'sel-gray';
  }

  getOrderClass(status: string | undefined): string {
    const map: Record<string, string> = {
      'pending':          'sel-orange',
      'preparing':        'sel-blue',
      'out for delivery': 'sel-purple',
      'delivered':        'sel-green',
      'cancelled':        'sel-red',
    };
    return map[status || ''] || 'sel-gray';
  }
}
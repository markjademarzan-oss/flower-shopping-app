import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { SharedService } from '../services/shared.service';
import { Order } from '../models';

// No IonicModule, no AlertController — plain Angular only

interface LocalDeliveryOption {
  id: string; name: string; description: string;
  estimatedTime: string; fee: number; icon: string;
}

interface LocationData {
  lat: number; lng: number; display: string; error: boolean;
}

@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.page.html',
  styleUrls: ['./checkout.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule],  // no IonicModule
})
export class CheckoutPage implements OnInit {
  cartItems: Order[] = [];
  customerDetails  = { name: '', phone: '', email: '' };
  deliveryAddress  = { street: '', barangay: '', city: '', province: null as string | null, notes: '' };
  selectedDeliveryService = 'standard';

  isGettingLocation = false;
  locationData: LocationData | null = null;

  deliveryServices: LocalDeliveryOption[] = [
    { id: 'standard', name: 'Standard Delivery', description: 'Regular reliable service',  estimatedTime: '2–3 days', fee: 50,  icon: '📦' },
    { id: 'express',  name: 'Express Delivery',  description: 'Fast and trackable',        estimatedTime: '1 day',    fee: 100, icon: '⚡' },
    { id: 'sameday',  name: 'Same Day Delivery', description: 'Delivered today!',          estimatedTime: '4–6 hours',fee: 150, icon: '🚀' },
    { id: 'pickup',   name: 'Store Pickup',      description: 'Pick up at our store',      estimatedTime: '~2 hours', fee: 0,   icon: '🏪' },
  ];

  constructor(
    private router: Router,
    private sharedService: SharedService,
  ) {}

  ngOnInit(): void { this.loadCart(); }
  ionViewWillEnter(): void { this.loadCart(); }

  loadCart(): void {
    this.cartItems = this.sharedService.getCheckoutItems();
    if (!this.cartItems.length) this.router.navigate(['/cart']);
  }

  getLocation(): void {
    if (!navigator.geolocation) {
      this.locationData = { lat: 0, lng: 0, display: 'Geolocation is not supported by your browser.', error: true };
      return;
    }
    this.isGettingLocation = true;
    this.locationData = null;

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        try {
          const res  = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`);
          const data = await res.json();
          const addr = data.address;
          this.deliveryAddress.street   = addr.road || addr.suburb || '';
          this.deliveryAddress.barangay = addr.suburb || addr.village || addr.quarter || '';
          this.deliveryAddress.city     = addr.city || addr.town || addr.municipality || '';
          this.deliveryAddress.province = addr.state || addr.province || 'Ilocos Sur';
          this.locationData = { lat, lng, display: data.display_name || `${lat}, ${lng}`, error: false };
        } catch {
          this.locationData = { lat, lng, display: `Lat: ${lat.toFixed(6)}, Lng: ${lng.toFixed(6)}`, error: false };
        }
        this.isGettingLocation = false;
      },
      (error) => {
        const msgs: Record<number, string> = {
          1: 'Permission denied. Please allow location access.',
          2: 'Position unavailable. Check your GPS.',
          3: 'Request timed out. Please try again.',
        };
        this.locationData = { lat: 0, lng: 0, display: msgs[error.code] || 'Could not get location.', error: true };
        this.isGettingLocation = false;
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  }

  getSubtotal(): number {
    return this.cartItems.reduce((t, o) => t + (o.product?.price || 0) * (o.quantity || 1), 0);
  }

  getDeliveryFee(): number {
    return this.deliveryServices.find(s => s.id === this.selectedDeliveryService)?.fee ?? 0;
  }

  getTotal(): number { return this.getSubtotal() + this.getDeliveryFee(); }

  isFormValid(): boolean {
    return !!(
      this.customerDetails.name?.trim() &&
      this.customerDetails.phone?.trim() &&
      this.deliveryAddress.street?.trim() &&
      this.deliveryAddress.barangay?.trim() &&
      this.deliveryAddress.city?.trim() &&
      this.deliveryAddress.province &&
      this.selectedDeliveryService
    );
  }

  placeOrder(): void {
    if (!this.isFormValid()) {
      window.alert('Please fill in all required fields.');
      return;
    }

    const opt         = this.deliveryServices.find(s => s.id === this.selectedDeliveryService);
    const addr        = `${this.deliveryAddress.street}, ${this.deliveryAddress.barangay}, ${this.deliveryAddress.city}, ${this.deliveryAddress.province}`;
    const date        = new Date().toISOString();
    const deliveryFee = this.getDeliveryFee();
    const totalAmount = this.getTotal();
    const orderNum    = 'ORD' + Date.now();

    this.cartItems.forEach(o => {
      o.status          = 'pending';
      o.customerName    = this.customerDetails.name;
      o.customerPhone   = this.customerDetails.phone;
      o.customerEmail   = this.sharedService.getCurrentAuthState().user?.email || this.customerDetails.email;
      o.user            = this.customerDetails.email || this.customerDetails.phone;
      o.address         = addr;
      o.deliveryService = opt?.name ?? '';
      o.paymentMethod   = 'COD';
      o.deliveryStatus  = 'pending';
      o.orderDate       = date;
      o.deliveryFee     = deliveryFee;
      o.totalAmount     = totalAmount;
    });

    this.sharedService.saveOrders();

    // Plain window.alert — no Ionic overlay, no async, no dismiss issues
    window.alert(`🎉 Order Placed!\nOrder #${orderNum}\nTotal: ₱${totalAmount.toFixed(2)}\nWe'll contact you soon.`);

    // Navigate immediately after alert is dismissed — guaranteed
    this.router.navigate(['/orders']);
  }

  goBack(): void { this.router.navigate(['/cart']); }
}
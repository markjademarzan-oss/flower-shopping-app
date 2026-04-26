import { Component, ViewChild, ElementRef } from '@angular/core';
import { IonicModule, ToastController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { addIcons } from 'ionicons';
import {
  star, starHalf, starOutline,
  heart, heartOutline,
  logoFacebook, logoInstagram, mailOutline,
  eyeOutline, cartOutline, logOutOutline, closeOutline,
  bagOutline, searchOutline, closeCircle, checkmarkCircle,
  checkmarkCircleOutline, bicycleOutline, bagHandleOutline,
  bagCheckOutline, arrowForwardOutline, informationCircleOutline,
  closeCircleOutline, menuOutline, receiptOutline, personOutline,
  addOutline, removeOutline, menu, cart, logOut, receipt,
  add, remove
} from 'ionicons/icons';
import { SharedService } from '../services/shared.service';
import { Product } from '../models';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, RouterLink],
})
export class HomePage {
  @ViewChild('flyingIcon') flyingIcon!: ElementRef;
  @ViewChild('cartButton') cartButton!: ElementRef;

  isQuickViewOpen = false;
  selectedProduct: any = null;
  isCartPopoverOpen = false;
  popoverEvent: any = null;

  searchQuery = '';
  activeTag = 'all';
  onlyAvailable = false;
  filteredItems: Product[] = [];

  constructor(
    private sharedService: SharedService,
    private router: Router,
    private toastCtrl: ToastController
  ) {
    addIcons({
      star,
      'star-half': starHalf,
      'star-outline': starOutline,
      heart,
      'heart-outline': heartOutline,
      'logo-facebook': logoFacebook,
      'logo-instagram': logoInstagram,
      'mail-outline': mailOutline,
      'eye-outline': eyeOutline,
      'cart-outline': cartOutline,
      'log-out-outline': logOutOutline,
      'close-outline': closeOutline,
      'bag-outline': bagOutline,
      'search-outline': searchOutline,
      'close-circle': closeCircle,
      'checkmark-circle': checkmarkCircle,
      'checkmark-circle-outline': checkmarkCircleOutline,
      'bicycle-outline': bicycleOutline,
      'bag-handle-outline': bagHandleOutline,
      'bag-check-outline': bagCheckOutline,
      'arrow-forward-outline': arrowForwardOutline,
      'information-circle-outline': informationCircleOutline,
      'close-circle-outline': closeCircleOutline,
      'menu-outline': menuOutline,
      'receipt-outline': receiptOutline,
      'person-outline': personOutline,
      'add-outline': addOutline,
      'remove-outline': removeOutline,
      menu,
      cart,
      'log-out': logOut,
      receipt,
      add,
      remove
    });
  }

  ionViewWillEnter() {
    this.sharedService.refreshFromStorage();
    this.onSearch();
  }

  get items(): Product[] {
    return this.sharedService.getProducts();
  }

  // ── SEARCH & FILTER ──
  onSearch() {
    let result = [...this.sharedService.getProducts()];
    if (this.onlyAvailable) result = result.filter(p => p.available !== false);
    if (this.activeTag !== 'all') result = result.filter(p => p.tag === this.activeTag);
    const q = this.searchQuery.trim().toLowerCase();
    if (q) result = result.filter(p => p.name.toLowerCase().includes(q));
    this.filteredItems = result;
  }

  clearFilters() {
    this.searchQuery = '';
    this.activeTag = 'all';
    this.onlyAvailable = false;
    this.onSearch();
  }

  // ── CART ──
  getCartCount(): number {
    return this.sharedService.getCartItems().reduce((s, o) => s + (o.quantity || 1), 0);
  }

  getCartItemList() {
    return this.sharedService.getCartItems();
  }

  getCartTotal(): number {
    return this.sharedService.getCartItems()
      .reduce((s, o) => s + (o.product?.price || 0) * (o.quantity || 1), 0);
  }

  openCartPopover(ev: any) {
    ev.stopPropagation();
    this.popoverEvent = ev;
    this.isCartPopoverOpen = true;
  }

  closeCartPopover() {
    this.isCartPopoverOpen = false;
  }

  // ── NAVIGATION ──
  goToCart() { this.router.navigate(['/cart']); }
  goToCheckout() { this.router.navigate(['/checkout']); }

  // ── FAVORITES ──
  toggleFavorite(item: any, event: Event): void {
    event.stopPropagation();
    item.isFavorite = !item.isFavorite;
  }

  toggleFavoriteFromQuickView(item: any): void {
    item.isFavorite = !item.isFavorite;
  }

  // ── QUICK VIEW ──
  quickView(item: any, event: Event): void {
    event.stopPropagation();
    this.selectedProduct = item;
    this.isQuickViewOpen = true;
  }

  closeQuickView(): void {
    this.isQuickViewOpen = false;
    setTimeout(() => { this.selectedProduct = null; }, 300);
  }

  addToCartFromQuickView(item: any): void {
    if (item.available === false) return;
    this.addToCart(item, new MouseEvent('click'));
    this.closeQuickView();
  }

  buyNowFromQuickView(item: any): void {
    if (item.available === false) return;
    this.sharedService.addToCart(item as Product, 1);
    this.showAddedToast(item.name);
    this.closeQuickView();
    setTimeout(() => this.router.navigate(['/cart']), 350);
  }

  // ── ADD TO CART (stays on page) ──
  addToCart(item: any, event: Event): void {
    event.stopPropagation();
    if (item.available === false) return;

    let startX = window.innerWidth / 2;
    let startY = window.innerHeight / 2;
    if (event instanceof MouseEvent) {
      startX = event.clientX;
      startY = event.clientY;
    }
    this.sharedService.addToCart(item as Product, 1);
    this.showAddedToast(item.name);
    this.triggerFlyingAnimation(startX, startY);
    this.pulseCartButton();
    this.onSearch();
  }

  buyNow(item: any, event: Event): void {
    event.stopPropagation();
    if (item.available === false) return;

    let startX = window.innerWidth / 2;
    let startY = window.innerHeight / 2;
    if (event instanceof MouseEvent) {
      startX = event.clientX;
      startY = event.clientY;
    }
    this.sharedService.addToCart(item as Product, 1);
    this.showAddedToast(item.name);
    this.triggerFlyingAnimation(startX, startY);
    this.pulseCartButton();

    setTimeout(() => { this.router.navigate(['/cart']); }, 950);
  }

  handleCartIconClick(item: any, event: Event): void {
    event.stopPropagation();
    if (item.available === false) return;

    const target = event.currentTarget as HTMLElement;
    const rect = target.getBoundingClientRect();
    const startX = rect.left + rect.width / 2;
    const startY = rect.top + rect.height / 2;

    this.sharedService.addToCart(item as Product, 1);
    this.showAddedToast(item.name);
    this.triggerFlyingAnimation(startX, startY);
    this.pulseCartButton();
    this.onSearch();
  }

  // ── TASK 5: TOAST NOTIFICATION (Option C – Alert / Toast API) ──
  async showAddedToast(productName: string): Promise<void> {
    const toast = await this.toastCtrl.create({
      message: `🌸 "${productName}" added to cart!`,
      duration: 2000,
      position: 'bottom',
      color: 'success',
      cssClass: 'cart-toast',
      icon: 'checkmark-circle-outline',
    });
    await toast.present();
  }

  // ── ANIMATIONS ──
  private pulseCartButton(): void {
    if (this.cartButton?.nativeElement) {
      const btn = this.cartButton.nativeElement;
      btn.classList.add('pulse');
      setTimeout(() => btn.classList.remove('pulse'), 400);
    }
  }

  triggerFlyingAnimation(startX: number, startY: number): void {
    if (!this.flyingIcon || !this.cartButton) return;

    const flyingEl = this.flyingIcon.nativeElement;
    const cartRect = this.cartButton.nativeElement.getBoundingClientRect();
    const endX = cartRect.left + cartRect.width / 2;
    const endY = cartRect.top + cartRect.height / 2;

    flyingEl.style.transition = 'none';
    flyingEl.style.display = 'block';
    flyingEl.style.opacity = '1';
    flyingEl.style.transform = 'translate(-50%, -50%) scale(1)';
    flyingEl.style.left = startX + 'px';
    flyingEl.style.top = startY + 'px';
    flyingEl.getBoundingClientRect();

    flyingEl.style.transition = 'left 0.75s cubic-bezier(0.25, 0.46, 0.45, 0.94), top 0.75s cubic-bezier(0.25, 0.46, 0.45, 0.94), opacity 0.3s ease 0.5s, transform 0.75s ease';
    flyingEl.style.left = endX + 'px';
    flyingEl.style.top = endY + 'px';
    flyingEl.style.opacity = '0';
    flyingEl.style.transform = 'translate(-50%, -50%) scale(0.2)';

    setTimeout(() => {
      flyingEl.style.display = 'none';
      flyingEl.style.transition = 'none';
    }, 850);
  }

  // ── USER ──
  getCurrentUserName(): string {
    return this.sharedService.getCurrentAuthState().user?.name || 'Guest';
  }

  logout(): void {
    this.sharedService.logout();
    this.router.navigate(['/login']);
  }

  getStarIcons(rating: number | undefined): string[] {
    const actualRating = rating || 4;
    const stars: string[] = [];
    const fullStars = Math.floor(actualRating);
    const hasHalfStar = actualRating % 1 >= 0.5;
    for (let i = 0; i < fullStars; i++) stars.push('star');
    if (hasHalfStar) stars.push('star-half');
    while (stars.length < 5) stars.push('star-outline');
    return stars;
  }
}
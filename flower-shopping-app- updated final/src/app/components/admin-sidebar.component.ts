import { Component, OnInit, Input } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { addIcons } from 'ionicons';
import {
  gridOutline, flowerOutline, receiptOutline, storefrontOutline,
  logOutOutline, chevronBackOutline, chevronForwardOutline, closeOutline, menuOutline, menu
} from 'ionicons/icons';
import { SharedService } from '../services/shared.service';

@Component({
  selector: 'app-admin-sidebar',
  templateUrl: './admin-sidebar.component.html',
  styleUrls: ['./admin-sidebar.component.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, RouterLink],
})
export class AdminSidebarComponent implements OnInit {
  @Input() activeRoute: string = 'dashboard';

  isCollapsed = false;
  isMobileOpen = false;
  adminName = 'Admin';
  pendingCount = 0;
  productCount = 0;

  constructor(private sharedService: SharedService, private router: Router) {
    addIcons({
      'grid-outline': gridOutline,
      'flower-outline': flowerOutline,
      'receipt-outline': receiptOutline,
      'storefront-outline': storefrontOutline,
      'log-out-outline': logOutOutline,
      'chevron-back-outline': chevronBackOutline,
      'chevron-forward-outline': chevronForwardOutline,
      'close-outline': closeOutline,
      'menu-outline': menuOutline,
      menu
    });
  }

  ngOnInit() {
    this.adminName = this.sharedService.getCurrentAuthState().user?.name || 'Admin';
    this.pendingCount = this.sharedService.getPendingOrders().length;
    this.productCount = this.sharedService.getProducts().length;
  }

  toggleCollapse() {
    this.isCollapsed = !this.isCollapsed;
  }

  openMobileMenu() {
    this.isMobileOpen = true;
  }

  closeMobileMenu() {
    this.isMobileOpen = false;
  }

  logout() {
    this.sharedService.logout();
    this.router.navigate(['/login']);
  }
}
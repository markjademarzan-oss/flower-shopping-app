import { Component, OnInit, ViewChild } from '@angular/core';
import { IonicModule, AlertController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { addIcons } from 'ionicons';
import {
  pencilOutline, trashOutline, checkmarkCircleOutline, closeCircleOutline,
  addCircleOutline, listOutline, addOutline, alertCircleOutline, createOutline,
  menuOutline, bicycleOutline, imageOutline
} from 'ionicons/icons';
import { SharedService } from '../../services/shared.service';
import { Product } from '../../models';
import { AdminSidebarComponent } from '../../components/admin-sidebar.component';

@Component({
  selector: 'app-manage-products',
  templateUrl: 'manage-products.page.html',
  styleUrls: ['manage-products.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, AdminSidebarComponent],
})
export class ManageProductsPage implements OnInit {
  @ViewChild(AdminSidebarComponent) sidebarRef!: AdminSidebarComponent;

  openSidebar() { this.sidebarRef?.openMobileMenu(); }
  products: Product[] = [];

  // ── Product form ──
  isEditing  = false;
  editingId: number | string | null = null;
  message    = '';
  messageType = '';
  formData   = { name: '', price: 0, img: 'assets/img/', tag: '', rating: 4.5 };

  constructor(
    private sharedService: SharedService,
    private alertCtrl: AlertController
  ) {
    addIcons({
      'pencil-outline':           pencilOutline,
      'trash-outline':            trashOutline,
      'checkmark-circle-outline': checkmarkCircleOutline,
      'close-circle-outline':     closeCircleOutline,
      'add-circle-outline':       addCircleOutline,
      'list-outline':             listOutline,
      'add-outline':              addOutline,
      'alert-circle-outline':     alertCircleOutline,
      'create-outline':           createOutline,
      'menu-outline':             menuOutline,
      'bicycle-outline':          bicycleOutline,
      'image-outline':            imageOutline
    });
  }

  ngOnInit()        { this.loadProducts(); }
  ionViewWillEnter(){ this.loadProducts(); }
  loadProducts()    { this.products = this.sharedService.getProducts(); }

  // ─────────────────────────────────
  // FILE HANDLING
  // ─────────────────────────────────
  onImageSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.formData.img = e.target.result; // Store as data URL
        this.showMessage(`Image selected: ${file.name}`, 'success');
      };
      reader.onerror = () => {
        this.showMessage('Error reading file', 'danger');
      };
      reader.readAsDataURL(file);
    }
  }

  getImageFileName(path: string): string {
    if (!path || path === 'assets/img/') return 'Choose Image...';
    // Extract filename from URL or path
    const parts = path.split('/');
    const fileName = parts[parts.length - 1];
    return fileName.length > 30 ? fileName.substring(0, 27) + '...' : fileName;
  }

  // ─────────────────────────────────
  // PRODUCT CRUD
  // ─────────────────────────────────
  saveProduct() {
    if (!this.formData.name.trim())               return this.showMessage('Product name is required', 'danger');
    if (!this.formData.price || this.formData.price <= 0) return this.showMessage('Price must be > 0', 'danger');
    if (!this.formData.img.trim() || this.formData.img.trim() === 'assets/img/') return this.showMessage('Image is required', 'danger');

    if (this.isEditing && this.editingId) {
      // preserve existing delivery services when editing
      const existing = this.products.find(p => p.id === this.editingId);
      const updated: Product = {
        id: this.editingId,
        name: this.formData.name,
        price: Number(this.formData.price),
        img: this.formData.img,
        tag: this.formData.tag || undefined,
        rating: Number(this.formData.rating) || 4,
        available: existing !== undefined ? existing.available : true,
        deliveryServices: existing?.deliveryServices || [],
      };
      this.sharedService.updateProduct(updated);
      this.showMessage(`Updated "${updated.name}"`, 'success');
    } else {
      const newProduct: Product = {
        id: Date.now(),
        name: this.formData.name,
        price: Number(this.formData.price),
        img: this.formData.img,
        tag: this.formData.tag || undefined,
        rating: Number(this.formData.rating) || 4,
        available: true,
        deliveryServices: [],
      };
      this.sharedService.addProduct(newProduct);
      this.showMessage(`Added "${newProduct.name}"`, 'success');
    }
    this.resetForm();
    this.loadProducts();
  }

  onEdit(product: Product) {
    this.isEditing = true;
    this.editingId = product.id;
    this.formData  = { name: product.name, price: product.price, img: product.img, tag: product.tag || '', rating: product.rating || 4.5 };
    
    const scrollContainer = document.querySelector('.admin-scroll');
    if (scrollContainer) {
      scrollContainer.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  async onDelete(id: number | string) {
    const product = this.products.find(p => p.id === id);
    if (!product) return;
    const alert = await this.alertCtrl.create({
      header: 'Delete Product',
      message: `Delete "${product.name}"?`,
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        {
          text: 'Delete', cssClass: 'danger',
          handler: () => {
            this.sharedService.deleteProduct(id);
            this.showMessage(`Deleted "${product.name}"`, 'success');
            this.loadProducts();
          }
        }
      ]
    });
    await alert.present();
  }

  toggleStock(product: Product) {
    const isAvailable = product.available !== false; // defaults to true
    product.available = !isAvailable;
    this.sharedService.updateProduct(product);
    this.loadProducts();
    this.showMessage(
      `${product.name} is now ${product.available ? 'In Stock ✓' : 'Out of Stock ✗'}`,
      product.available ? 'success' : 'danger'
    );
  }

  resetForm() {
    this.isEditing  = false;
    this.editingId  = null;
    this.formData   = { name: '', price: 0, img: 'assets/img/', tag: '', rating: 4.5 };
    this.message    = '';
  }

  private showMessage(text: string, type: string) {
    this.message     = text;
    this.messageType = type;
    setTimeout(() => { this.message = ''; }, 4000);
  }

  // ─────────────────────────────────
  // MOBILE MENU
  // ─────────────────────────────────
  toggleSidebar() {
    const sidebar = document.querySelector('app-admin-sidebar .sidebar');
    if (sidebar) {
      sidebar.classList.toggle('mobile-active');
    }
  }
}
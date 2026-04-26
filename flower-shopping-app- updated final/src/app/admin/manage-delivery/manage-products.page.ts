import { Component, OnInit } from '@angular/core';
import { IonicModule, AlertController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { SharedService } from '../../services/shared.service';
import { Product, DeliveryService } from '../../models';

@Component({
  selector: 'app-manage-products',
  templateUrl: './manage-products.page.html',
  styleUrls: ['./manage-products.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, RouterLink]
})
export class ManageProductsPage implements OnInit {
  products: Product[] = [];

  constructor(
    private sharedService: SharedService,
    private alertCtrl: AlertController
  ) {}

  ngOnInit() {
    this.load();
  }

  private load() {
    this.products = this.sharedService.getProducts();
  }

  // ─── Edit Product ───────────────────────────────────────────
  async editProduct(product: Product): Promise<void> {
    const alert = await this.alertCtrl.create({
      header: 'Edit Product',
      inputs: [
        {
          name: 'name',
          type: 'text',
          value: product.name,
          placeholder: 'Product name'
        }
      ],
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        {
          text: 'Save',
          handler: (data) => {
            if (data.name?.trim()) {
              product.name = data.name.trim();
              this.sharedService.updateProduct(product);
              this.load();
            }
          }
        }
      ]
    });
    await alert.present();
  }

  // ─── Delete Product ──────────────────────────────────────────
  async deleteProduct(product: Product): Promise<void> {
    const alert = await this.alertCtrl.create({
      header: 'Delete Product',
      message: `Are you sure you want to delete "${product.name}"?`,
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        {
          text: 'Delete',
          role: 'destructive',
          handler: () => {
            this.sharedService.deleteProduct(product.id);
            this.load();
          }
        }
      ]
    });
    await alert.present();
  }

  // ─── Add Service ─────────────────────────────────────────────
  async addService(product: Product): Promise<void> {
    const alert = await this.alertCtrl.create({
      header: 'Add Delivery Service',
      inputs: [
        { name: 'name',  type: 'text',   placeholder: 'Service name' },
        { name: 'price', type: 'number', placeholder: 'Price (₱)' },
        { name: 'eta',   type: 'text',   placeholder: 'Estimated arrival time' }
      ],
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        {
          text: 'Add',
          handler: async (data) => {
            if (!data.name?.trim()) return;
            // Ask availability separately so UI is cleaner
            const confirmAlert = await this.alertCtrl.create({
              header: 'Service Availability',
              message: `Make "${data.name}" available now?`,
              buttons: [
                {
                  text: 'Unavailable',
                  handler: () => {
                    this.saveNewService(product, data, false);
                  }
                },
                {
                  text: 'Available',
                  handler: () => {
                    this.saveNewService(product, data, true);
                  }
                }
              ]
            });
            await confirmAlert.present();
          }
        }
      ]
    });
    await alert.present();
  }

  private saveNewService(product: Product, data: any, available: boolean) {
    const service: DeliveryService = {
      name: data.name.trim(),
      price: data.price ? parseFloat(data.price) : 0,
      eta: data.eta?.trim() || '',
      available
    };
    this.sharedService.addDeliveryService(Number(product.id), service);
    this.load();
  }

  // ─── Edit Service ─────────────────────────────────────────────
  async editService(product: Product, service: DeliveryService): Promise<void> {
    const alert = await this.alertCtrl.create({
      header: 'Edit Delivery Service',
      inputs: [
        { name: 'name',  type: 'text',   value: service.name,           placeholder: 'Service name' },
        { name: 'price', type: 'number', value: service.price.toString(), placeholder: 'Price (₱)' },
        { name: 'eta',   type: 'text',   value: service.eta,            placeholder: 'Estimated arrival time' }
      ],
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        {
          text: 'Save',
          handler: async (data) => {
            if (!data.name?.trim()) return;
            const confirmAlert = await this.alertCtrl.create({
              header: 'Service Availability',
              message: `Is "${data.name}" currently available?`,
              buttons: [
                {
                  text: 'Unavailable',
                  handler: () => {
                    this.saveEditedService(product, service, data, false);
                  }
                },
                {
                  text: 'Available',
                  handler: () => {
                    this.saveEditedService(product, service, data, true);
                  }
                }
              ]
            });
            await confirmAlert.present();
          }
        }
      ]
    });
    await alert.present();
  }

  private saveEditedService(product: Product, oldService: DeliveryService, data: any, available: boolean) {
    const updated: DeliveryService = {
      name: data.name.trim(),
      price: data.price ? parseFloat(data.price) : oldService.price,
      eta: data.eta?.trim() || oldService.eta,
      available
    };
    this.sharedService.updateDeliveryService(Number(product.id), updated);
    this.load();
  }

  // ─── Remove Service ───────────────────────────────────────────
  async removeService(product: Product, service: DeliveryService): Promise<void> {
    const alert = await this.alertCtrl.create({
      header: 'Remove Service',
      message: `Remove "${service.name}" from ${product.name}?`,
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        {
          text: 'Remove',
          role: 'destructive',
          handler: () => {
            this.sharedService.removeDeliveryService(Number(product.id), service.name);
            this.load();
          }
        }
      ]
    });
    await alert.present();
  }
}
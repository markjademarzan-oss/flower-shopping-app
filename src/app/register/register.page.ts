import { Component } from '@angular/core';
import { IonicModule, AlertController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { SharedService } from '../services/shared.service';
import { addIcons } from 'ionicons';
import {
  personOutline, mailOutline, lockClosedOutline, shieldCheckmarkOutline,
  eyeOutline, eyeOffOutline, personAddOutline, alertCircleOutline,
  checkmarkCircleOutline, closeCircleOutline
} from 'ionicons/icons';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class RegisterPage {
  name            = '';
  email           = '';
  password        = '';
  confirmPassword = '';
  message         = '';
  successMessage  = '';
  showPassword    = false;
  showConfirm     = false;
  passwordMismatch = false;
  passwordMatch    = false;

  constructor(
    private sharedService: SharedService,
    private router: Router,
    private alertCtrl: AlertController
  ) {
    addIcons({
      'person-outline':           personOutline,
      'mail-outline':             mailOutline,
      'lock-closed-outline':      lockClosedOutline,
      'shield-checkmark-outline': shieldCheckmarkOutline,
      'eye-outline':              eyeOutline,
      'eye-off-outline':          eyeOffOutline,
      'person-add-outline':       personAddOutline,
      'alert-circle-outline':     alertCircleOutline,
      'checkmark-circle-outline': checkmarkCircleOutline,
      'close-circle-outline':     closeCircleOutline,
    });
  }

  // Live check while user types
  checkMatch() {
    if (!this.confirmPassword) {
      this.passwordMismatch = false;
      this.passwordMatch    = false;
      return;
    }
    this.passwordMismatch = this.password !== this.confirmPassword;
    this.passwordMatch    = this.password === this.confirmPassword && this.confirmPassword.length > 0;
  }

  async showAlert(header: string, message: string) {
    const alert = await this.alertCtrl.create({
      header,
      message,
      buttons: ['OK']
    });
    await alert.present();
    await alert.onDidDismiss(); // Pauses until the user clicks 'OK'
  }

  async register() {
    this.message        = '';
    this.successMessage = '';

    if (!this.name || !this.email || !this.password || !this.confirmPassword) {
      await this.showAlert('Incomplete', 'Please fill in all fields.');
      return;
    }
    if (!this.email.includes('@')) {
      await this.showAlert('Invalid Email', 'Please enter a valid email address.');
      return;
    }
    if (this.password !== this.confirmPassword) {
      await this.showAlert('Error', 'Passwords do not match.');
      return;
    }
    if (this.password.length < 6) {
      await this.showAlert('Weak Password', 'Password must be at least 6 characters.');
      return;
    }

    const success = this.sharedService.registerCustomer(
      this.name,
      this.email,
      this.password
    );

    if (success) {
      this.successMessage = 'Account created successfully!';
      setTimeout(() => {
        this.router.navigate(['/login']);
      }, 1500);
    } else {
      await this.showAlert('Error', 'An account with that email already exists.');
    }
  }

  goToLogin() {
    this.router.navigate(['/login']);
  }
}
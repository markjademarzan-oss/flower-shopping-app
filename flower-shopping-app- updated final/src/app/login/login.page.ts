import { Component, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { SharedService } from '../services/shared.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class LoginPage implements OnInit {

  // Single unified fields for both admin and customer
  email = '';
  password = '';

  errorMessage = '';
  showPassword = false;

  constructor(private sharedService: SharedService, private router: Router) {}

  ngOnInit() {
    // If already logged in, redirect based on role
    if (this.sharedService.isLoggedIn()) {
      const role = this.sharedService.getCurrentRole();
      if (role === 'admin') {
        this.router.navigate(['/admin/dashboard']);
      } else {
        this.router.navigate(['/home']);
      }
    }
  }

  // Single login method — tries admin first, then customer
  // All previously registered/saved customer accounts still work
  login() {
    if (!this.email || !this.password) {
      this.errorMessage = 'Please enter your email and password';
      return;
    }

    if (!this.email.includes('@')) {
      this.errorMessage = 'Please enter a valid email address';
      return;
    }

    // Try admin login first
    const isAdmin = this.sharedService.loginAsAdmin(this.email, this.password);
    if (isAdmin) {
      this.errorMessage = '';
      this.router.navigate(['/admin/dashboard']);
      return;
    }

    // Try customer login (includes all saved/registered accounts)
    const isCustomer = this.sharedService.loginAsCustomer(this.email, this.password);
    if (isCustomer) {
      this.errorMessage = '';
      this.router.navigate(['/home']);
      return;
    }

    // Neither matched
    this.errorMessage = 'Incorrect email or password. Please try again.';
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  // Navigate to registration page
  signUp() {
    this.router.navigate(['/register']);
  }
}

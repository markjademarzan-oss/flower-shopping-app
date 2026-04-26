import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { SharedService } from '../services/shared.service';

@Injectable({
  providedIn: 'root',
})
export class AdminGuard implements CanActivate {
  constructor(
    private sharedService: SharedService,
    private router: Router
  ) {}

  canActivate(): boolean {
    const role = this.sharedService.getCurrentRole();
    
    if (role === 'admin') {
      return true;
    }
    
    // Redirect to login if not authenticated as admin
    this.router.navigate(['/login']);
    return false;
  }
}

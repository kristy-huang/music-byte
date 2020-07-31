import { Injectable } from '@angular/core';
import { Router, CanActivate } from '@angular/router';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class AuthGuardService implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(): boolean {
    this.authService.isLoggedInObs.subscribe((data) => {
      console.log(data);
      if (!data) {
        this.router.navigate(['/welcome']);
        return false;
      }
    });
    return true;
  }
}

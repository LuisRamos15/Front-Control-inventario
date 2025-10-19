import { inject } from '@angular/core';
import { CanActivateFn, CanMatchFn, Router, UrlTree } from '@angular/router';
import { AuthService } from '../services/auth.service';

function checkGuest(): true | UrlTree {
  const router = inject(Router);
  const auth = inject(AuthService);
  const token = auth.getToken();
  console.log('[GuestGuard] token =', token);
  return token ? router.parseUrl('/dashboard') : true;
}

export const GuestGuard: CanActivateFn = () => checkGuest();
export const GuestMatchGuard: CanMatchFn = () => checkGuest();
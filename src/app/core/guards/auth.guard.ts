import { inject } from '@angular/core';
import { CanActivateFn, CanMatchFn, Router, UrlTree } from '@angular/router';
import { AuthService } from '../services/auth.service';

function checkAuth(): true | UrlTree {
  const router = inject(Router);
  const auth = inject(AuthService);
  const token = auth.getToken();
  // DEBUG temporal (puedes quitarlo luego):
  console.log('[AuthGuard] token =', token);
  return token ? true : router.parseUrl('/login');
}

export const AuthGuard: CanActivateFn = () => checkAuth();
export const AuthMatchGuard: CanMatchFn = () => checkAuth();

import { inject } from '@angular/core';
import { CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (route, state) => {

  const fireAuth = inject(AuthService);

  const usuario = fireAuth.getUser('fireUser');
  if (!usuario) {
    return true;
  }
  return false;
};

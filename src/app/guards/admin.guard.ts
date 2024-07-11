import { inject } from '@angular/core';
import { CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { Roles } from '../interfaces/usuario';
import { Usuario } from '../interfaces/usuario';

export const adminGuard: CanActivateFn = (route, state) => {
  const auth = inject(AuthService);
  return auth.getUser<Usuario>('usuario')?.tipo === Roles.ADMIN;
};

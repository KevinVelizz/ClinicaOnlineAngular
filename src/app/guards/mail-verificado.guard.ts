import { inject } from '@angular/core';
import { CanDeactivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { User } from '@angular/fire/auth';
import { Usuario } from '../interfaces/usuario';
import { Especialista } from '../interfaces/especialista';

export const mailVerificadoGuard: CanDeactivateFn<unknown> = (component, currentRoute, currentState, nextState) => {

  const auth = inject(AuthService);
  
  let usuarioFire = auth.getUser<User>('fireUser');
  let usuarioPagina = auth.getUser<Usuario>('usuario');
  if(!usuarioFire)
  {
    return true;
  }
  if (usuarioFire?.emailVerified) {
    if (usuarioPagina?.tipo == "Especialista" && !(usuarioPagina as Especialista).verificado) {
      return false;
    }
    return true;
  }
  return false;
};

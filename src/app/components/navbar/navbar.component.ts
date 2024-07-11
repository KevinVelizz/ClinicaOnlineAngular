import { CommonModule } from '@angular/common';
import { Component, Inject, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { FirestoreService } from '../../services/firestore.service';
import { Paciente } from '../../interfaces/paciente';
import { Especialista } from '../../interfaces/especialista';
import { Administrador } from '../../interfaces/administrador';
import { Usuario } from '../../interfaces/usuario';
import { User } from '@angular/fire/auth';

// import { Administrador } from '../../interfaces/administrador';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent {
  logueado: boolean = false;
  correo: string = '';
  usuarioAuth!: User | any;
  usuarioClinica!: Usuario | undefined | any;
  routerNav = inject(Router);

  constructor(private AuthService: AuthService, private firestore: FirestoreService) {
    
    this.AuthService.user$.subscribe(user=>{
      if(user)
      {
        this.usuarioAuth = this.AuthService.getUser('fireUser');
        this.usuarioClinica = this.AuthService.getUser('usuario');
        this.logueado = true;
        if(!this.usuarioClinica?.verificado && this.usuarioClinica.tipo == "Especialista")
        {
          this.routerNav.navigate(['/espera']);
        }
      }
      else
      {
        this.usuarioAuth = undefined;
        this.usuarioClinica = undefined;
        this.logueado = false;
      }
    });
  }

  LogOut() {
    this.AuthService.signOut();
    this.logueado = false;
    this.routerNav.navigate(['/login']);
  }
}

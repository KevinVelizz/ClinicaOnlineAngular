import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { FirestoreService } from '../../services/firestore.service';
import { Paciente } from '../../interfaces/paciente';
import { Especialista } from '../../interfaces/especialista';
// import { Administrador } from '../../interfaces/administrador';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent {
  logueado:boolean = false;
  correo:string = '';
  usuarioAuth!:any;  
  usuarioClinica!:Paciente | Especialista;

  constructor(private AuthService:AuthService, private firestore:FirestoreService)
  {
    this.AuthService.user$.subscribe(user=>{
      if(user)
      {
        this.usuarioAuth = user;
      }
    });
    
    this.firestore.pacientes.subscribe(pacientes=>{
      pacientes.forEach(paciente => {
        if(paciente.uid == this.usuarioAuth.uid)
        {
          this.usuarioClinica = paciente;
          return;
        }
      });
    });

    this.firestore.especialistas.subscribe(especialistas=>{
      especialistas.forEach(especialista => {
        if(especialista.uid == this.usuarioAuth.uid)
        {
          this.usuarioClinica = especialista;
          return;
        }
      });
    });

    // this.firestore.administradores.subscribe(administradores=>{
    //   administradores.forEach(administrador => {
    //     if(administrador.uid == this.usuarioAuth.uid)
    //     {
    //       this.usuarioClinica = administrador;
    //       return;
    //     }
    //   });
    // });
  }

  LogOut(){}
}

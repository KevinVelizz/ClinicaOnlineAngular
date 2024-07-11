import { Component } from '@angular/core';
import { User } from '@angular/fire/auth';
import { Usuario } from '../../interfaces/usuario';
import { AuthService } from '../../services/auth.service';
import { Especialista } from '../../interfaces/especialista';

@Component({
  selector: 'app-espera',
  standalone: true,
  imports: [],
  templateUrl: './espera.component.html',
  styleUrl: './espera.component.css'
})
export class EsperaComponent {
  
  usuarioFire: User | undefined;
  usuarioLogueado: Usuario | undefined;
  especialista: Especialista | undefined;

  constructor(private auth:AuthService)
  {
    this.auth.user$.subscribe(user=>{
      
      if(user)
      {
        this.usuarioFire = this.auth.getUser<User>('fireUser');
        this.usuarioLogueado = this.auth.getUser<Usuario>('usuario');
        if(this.usuarioLogueado?.tipo == "Especialista")
        {
          this.especialista = this.usuarioLogueado as Especialista;
        }
      }
    });
  }
}

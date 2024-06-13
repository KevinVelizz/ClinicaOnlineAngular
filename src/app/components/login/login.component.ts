import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { FooterComponent } from '../footer/footer.component';
import { NavbarComponent } from '../navbar/navbar.component';
import { AuthService } from '../../services/auth.service';
import { FirestoreService } from '../../services/firestore.service';
import { Paciente } from '../../interfaces/paciente';
import { Especialista } from '../../interfaces/especialista';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [RouterLink, FormsModule, ReactiveFormsModule, FooterComponent, NavbarComponent],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  form!: any | FormGroup;
  routerLogin = inject(Router);
  pacientes!: Paciente[];
  especialistas!: Especialista[];
  usuario!: Paciente | Especialista ;

  constructor(private router: Router, private fb: FormBuilder, private AuthService: AuthService, private firestore: FirestoreService) {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });

    this.firestore.pacientes.subscribe(pacientes => {
      if (pacientes) {
        this.pacientes = pacientes;
      }
    });

    this.firestore.especialistas.subscribe(especialistas => {
      if (especialistas) {
        this.especialistas = especialistas;
      }
    });

    // this.firestore.administradores.subscribe(administradores => {
    //   if (administradores) {
    //     this.administradores = administradores;
    //   }
    // });
  }

  onToggle(event: any) {
    if (event.target.checked) {
      this.router.navigate(['/register']);
    }
  }

  async singUp() {
    try {
      const { email, password } = this.form.value;
      const user = await this.AuthService.loginUserFireBase(email, password);
      if (user) {
          
        if (!user.user?.emailVerified) {
          console.log('verifica tu correo electronico');
          return;
        }

        this.pacientes.forEach(paciente=>{
          if(paciente.uid == user.user?.uid)
          {
            this.usuario = paciente;
            this.routerLogin.navigate(['/bienvenida']);
          }
        });
          
        this.especialistas.forEach(especialista=>{
          if(especialista.uid == user.user?.uid)
          {
            this.usuario = especialista;

            if(!this.usuario.verificado) {
              console.log('Tu cuenta no ha sido verificada por el admin.');
              return;
            }
            this.routerLogin.navigate(['/bienvenida']);
          }
        });

        // this.administradores.forEach(administrador=>{
        //   if(administrador.uid == user.user?.uid)
        //   {
        //     this.usuario = administrador;
        //   }
        // });
      }
    } catch (error) {
      console.log(error);
    }
  }
}

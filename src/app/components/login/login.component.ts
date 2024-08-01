import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { FooterComponent } from '../footer/footer.component';
import { NavbarComponent } from '../navbar/navbar.component';
import { AuthService } from '../../services/auth.service';
import { FirestoreService } from '../../services/firestore.service';
import { Paciente } from '../../interfaces/paciente';
import { Especialista } from '../../interfaces/especialista';
import { Administrador } from '../../interfaces/administrador';
import { LoaderComponent } from '../loader/loader.component';
import { Usuario } from '../../interfaces/usuario';
import { MatSnackBar } from '@angular/material/snack-bar';
import { EnterDirective } from '../../directivas/enter.directive';
import { animate, state, style, transition, trigger } from '@angular/animations';


const animacion = trigger('bounceInRight', [
  state('void', style({
    transform: 'translateX(400px)',
    opacity: 0
  })),
  state('*', style({
    transform: 'translateX(0)',
    opacity: 1
  })),
  transition('void => *', [
    animate('1.1s ease-in', style({
      transform: 'translateX(0)',
      opacity: 1
    })),
    animate('0.6s ease-out', style({
      transform: 'translateX(68px)'
    })),
    animate('0.3s ease-in', style({
      transform: 'translateX(0)'
    })),
    animate('0.4s ease-out', style({
      transform: 'translateX(32px)'
    })),
    animate('0.2s ease-in', style({
      transform: 'translateX(0)'
    })),
    animate('0.1s ease-out', style({
      transform: 'translateX(8px)'
    })),
    animate('0.1s ease-out', style({
      transform: 'translateX(0)'
    }))
  ])
])

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [RouterLink, FormsModule, ReactiveFormsModule, FooterComponent, NavbarComponent, LoaderComponent, EnterDirective],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
  animations: [animacion]
})
export class LoginComponent {
  form!: any | FormGroup;
  routerLogin = inject(Router);
  contador: number = 0;
  pacientes: Paciente[] = [];
  especialistas: Especialista[] = [];
  admin!: Administrador;
  usuarios!: any[];
  usuario!: any;
  usuarioSeleccionado!: Usuario | undefined;
  isLoading: boolean = false;
  usaurioLog: Usuario | undefined;

  constructor(private router: Router, private fb: FormBuilder, private AuthService: AuthService, private firestore: FirestoreService, private snackBar: MatSnackBar) {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });

    this.especialistas = [];
    this.pacientes = [];
    this.usuarios = [];

    this.firestore.usuarios.subscribe(usuarios => {
      if (usuarios) {
        this.usuarios = usuarios;
        for (let index = 0; index < this.usuarios.length; index++) {
          const element = usuarios[index];
          if (element.tipo === "Paciente" && this.pacientes.length <= 2 && !this.pacientes.includes(element as Paciente)) {
            this.pacientes.push(element as Paciente);
          }
          else if (element.tipo === "Especialista" && this.especialistas.length < 2 && !this.especialistas.includes(element as Especialista)) {
            this.especialistas.push(element as Especialista);
          }
          else {
            if (this.admin == null) {
              this.admin = element as Administrador;
            }
          }
        }
      }
    });
  }

  onToggle(event: any) {
    if (event.target.checked) {
      this.router.navigate(['/register']);
    }
  }

  async signUp() {
    try {
      this.isLoading = true;
      const { email, password } = this.form.value;

      if (this.usuarioSeleccionado) {
        if (this.usuarioSeleccionado.tipo === "Especialista") {

          if (!(this.usuarioSeleccionado as Especialista).verificado) {

            this.snackBar.open(`Tu cuenta no ha sido verificada por el administrador.`, 'Close', {
              duration: 2000
            });
            console.log('Tu cuenta no ha sido verificada por el admin.');
            return;
          }
        }
      }
      await this.AuthService.loginUserFireBase(email, password);

      this.firestore.usuarios.subscribe(async usuarios => {
        this.usaurioLog = usuarios.find(usuario => usuario.correo === email);
        if (this.usaurioLog) {
          const log = {
            nombreUsuario: this.usaurioLog!.nombre,
            correoUsuario: this.usaurioLog!.correo,
            diaHorario: {
              fecha: new Date().toLocaleDateString(),
              hora: new Date().toLocaleTimeString()
            }
          }
          await this.firestore.agregarDocumentoLog(log);
        }
      });

      
    } catch (error) {
      console.log(error);
    } finally {
      this.isLoading = false;
    }
  }

  llenarCampos(index: string) {
    this.usuarios.forEach(usuario => {
      if (usuario.uid == index) {
        this.form.get('email')?.setValue(usuario.correo);
        this.form.get('password')?.setValue(usuario.clave);
        this.usuarioSeleccionado = usuario;
        return;
      }
    });
  }
}

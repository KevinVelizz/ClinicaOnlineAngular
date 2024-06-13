import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { FooterComponent } from '../footer/footer.component';
import { FirestorageService } from '../../services/firestorage.service';
import { Especialista } from '../../interfaces/especialista';
import { Paciente } from '../../interfaces/paciente';
import { NavbarComponent } from '../navbar/navbar.component';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, CommonModule, FooterComponent, NavbarComponent],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent {
  form!: any | FormGroup;
  registrarPaciente!: boolean;
  registrarEspecialista!: boolean;
  formEspecialista: any | FormGroup;
  imagenPerfilUno?: File;
  imagenPerfilDos?: File;
  usuario:any;
  especialidades!: string[];

  constructor(private router: Router, private fb: FormBuilder, private AuthService: AuthService, private firestorage: FirestorageService) {
    this.form = this.fb.group({
      nombre: ['', Validators.required],
      apellido: ['', Validators.required],
      edad: ['', Validators.required],
      dni: ['', Validators.required],
      obraSocial: ['', Validators.required],
      correo: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      imagenPerfilUno: ['', Validators.required],
      imagenPerfilDos: ['', Validators.required]
    });

    this.formEspecialista = this.fb.group({
      nombre: ['', Validators.required],
      apellido: ['', Validators.required],
      edad: ['', Validators.required],
      dni: ['', Validators.required],
      especialidad: ['', Validators.required],
      correo: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      imagenPerfil: ['', Validators.required]
    });

    this.registrarPaciente = false;
    this.registrarEspecialista = false;

    this.especialidades = ['Cardiología', 'Dermatología', 'Neurología'];
  }

  elegirRegistrar(tipo: boolean) {
    this.registrarEspecialista = tipo;
    this.registrarPaciente = !tipo;
  }

  onToggle(event: any) {
    if (event.target.checked) {
      this.router.navigate(['/login']);
    }
  }

  seleccionarFotoPerfilUno($event: any) {
    if ($event.target.files.length > 0) {
      this.imagenPerfilUno = $event.target.files[0];
    }
  }

  seleccionarFotoPerfilDos($event: any) {
    if ($event.target.files.length > 0) {
      this.imagenPerfilDos = $event.target.files[0];
    }
  }

  async register() {
    if (this.form.valid | this.formEspecialista.valid) {
      try {
        if (this.form.valid) {
          this.usuario = await this.AuthService.registerFireBase(this.form.controls.correo.value, this.form.controls.password.value);
          
          console.log(this.usuario.user?.uid);
          const paciente: Paciente = {
            uid: this.usuario.user.uid,
            nombre: this.form.controls.nombre.value,
            apellido: this.form.controls.apellido.value,
            edad: this.form.controls.edad.value,
            dni: this.form.controls.dni.value,
            obraSocial: this.form.controls.obraSocial.value,
            correo: this.form.controls.correo.value,
            clave: this.form.controls.password.value,
            imagen: {}
          }
            
          const fotos = {fotoUno: this.imagenPerfilUno, fotoDos: this.imagenPerfilDos}
          
          this.firestorage.agregarEntidadConFoto("pacientes", fotos, paciente);
        }
        else {
          this.usuario = await this.AuthService.registerFireBase(this.formEspecialista.controls.correo.value, this.formEspecialista.controls.password.value);

          const paciente: Especialista = {
            uid: this.usuario.user.uid,
            nombre: this.formEspecialista.controls.nombre.value,
            apellido: this.formEspecialista.controls.apellido.value,
            edad: this.formEspecialista.controls.edad.value,
            dni: this.formEspecialista.controls.dni.value,
            especialidad: this.formEspecialista.controls.especialidad.value,
            correo: this.formEspecialista.controls.correo.value,
            clave: this.formEspecialista.controls.password.value,
            imagen: '',
            verificado: false
          } 

          this.firestorage.agregarEntidadConFoto("especialistas",this.imagenPerfilUno, paciente);
        }

        if (this.usuario) {
          await this.usuario.user?.sendEmailVerification();
          this.router.navigate(['/login']);
        }
      } catch (error) {
        console.log(error);
      }
    }
  }
}

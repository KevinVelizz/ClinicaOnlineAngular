import { Component, EventEmitter, Input, OnInit, Output, inject } from '@angular/core';
import { NavbarComponent } from '../navbar/navbar.component';
import { FooterComponent } from '../footer/footer.component';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FirestoreService } from '../../services/firestore.service';
import { ListadoEspecialistasComponent } from '../listado-especialistas/listado-especialistas.component';
import { Especialista } from '../../interfaces/especialista';
import { DetalleEspecialistaComponent } from '../detalle-especialista/detalle-especialista.component';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Administrador } from '../../interfaces/administrador';
import { AuthService } from '../../services/auth.service';
import { FirestorageService } from '../../services/firestorage.service';
import { LoaderComponent } from '../loader/loader.component';

@Component({
  selector: 'app-seccion-usuarios',
  standalone: true,
  imports: [NavbarComponent, FooterComponent, RouterLink, CommonModule, ListadoEspecialistasComponent, DetalleEspecialistaComponent, FormsModule, ReactiveFormsModule, LoaderComponent],
  templateUrl: './seccion-usuarios.component.html',
  styleUrl: './seccion-usuarios.component.css'
})
export class SeccionUsuariosComponent implements OnInit {
  especialistas: Especialista[] | any[] = [];
  especialistaSeleccionado!: Especialista;
  verListado: boolean = false;
  registrarAdmin: boolean = false;
  imagenPerfilUno?: File;
  form!: any | FormGroup;
  usuario!: any;
  router = inject(Router);
  isLoading: boolean = false;

  constructor(private firestore: FirestoreService, private fb: FormBuilder, private AuthService: AuthService) { }

  ngOnInit(): void {
    this.firestore.usuarios.subscribe(usuarios => {
      if (usuarios) {
        this.especialistas = usuarios.filter(usuario => usuario.tipo === "Especialista" &&
          !this.especialistas.some(e => e.id === usuario.id));
      }
    });

    this.form = this.fb.group({
      nombre: ['', Validators.required],
      apellido: ['', Validators.required],
      edad: ['', Validators.required],
      dni: ['', Validators.required],
      correo: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      imagenPerfilUno: ['', Validators.required],
    });
  }


  onEspecialistaSeleccionada(especialista: any) {
    this.especialistaSeleccionado = especialista;
    setTimeout(() => {
      this.isLoading = false
    }, 1500, this.isLoading = true);
  }

  elegirRegistrar(tipo: boolean) {
    this.verListado = tipo;
    this.registrarAdmin = !tipo;
  }

  seleccionarFotoPerfilUno($event: any) {
    if ($event.target.files.length > 0) {
      this.imagenPerfilUno = $event.target.files[0];
    }
  }

  async register() {
    if (this.form.valid) {
      try {
        console.log(this.form.controls.correo.value);
        const administrador: Administrador = {
          id: '',
          uid: '',
          nombre: this.form.controls.nombre.value,
          apellido: this.form.controls.apellido.value,
          edad: this.form.controls.edad.value,
          dni: this.form.controls.dni.value,
          correo: this.form.controls.correo.value,
          clave: this.form.controls.password.value,
          tipo: 'Administrador',
          imagen: {foto1:''}
        }
        this.usuario = await this.AuthService.registrar(administrador, this.form.controls.password.value, this.imagenPerfilUno);
        console.log('error');
        if (this.usuario) {
          console.log('error');
          this.router.navigate(['/login']);
        }
      } catch (error) {
        console.log(error);
      }
    }
  }
}

import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { FooterComponent } from '../footer/footer.component';
import { FirestorageService } from '../../services/firestorage.service';
import { Especialista } from '../../interfaces/especialista';
import { Paciente } from '../../interfaces/paciente';
import { NavbarComponent } from '../navbar/navbar.component';
import { LoaderComponent } from '../loader/loader.component';
import { FirestoreService } from '../../services/firestore.service';
import { MatChipEditedEvent, MatChipInputEvent, MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { max } from 'rxjs';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, CommonModule, FooterComponent, NavbarComponent, LoaderComponent, MatChipsModule, MatIconModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent implements OnInit {
  especialistaForm: any;
  onFileSelected: any;
  eliminarEspecialidad(a: any) {

  }
  form!: any | FormGroup;
  registrarPaciente!: boolean;
  registrarEspecialista!: boolean;
  formEspecialista: any | FormGroup;
  imagenPerfilUno?: File;
  imagenPerfilDos?: File;
  usuario: any;
  especialidades!: any[];
  isLoading: boolean = false;
  agregarEspecialidad: boolean = false;
  imagePreviews: any;
  especialidadesMostrar!: any[];
  readonly addOnBlur = true;
  readonly separatorKeysCodes = [ENTER, COMMA] as const;
  encontro: boolean = false;
  

  constructor(private router: Router, private fb: FormBuilder, private AuthService: AuthService, private firestore: FirestoreService, private snackBar: MatSnackBar) {
    this.form = this.fb.group({
      nombre: ['', Validators.required],
      apellido: ['', Validators.required],
      edad: ['', Validators.required],
      dni: ['', [Validators.required,this.dniValidar]],
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
      dni: ['', [Validators.required, this.dniValidar]],
      correo: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      imagenPerfil: ['', Validators.required]
    });

    this.registrarPaciente = false;
    this.registrarEspecialista = false;



    // this.especialidades = ['Cardiología', 'Dermatología', 'Neurología', 'Pediatría', 'otra'];
  }

  ngOnInit(): void {
    this.firestore.getCollection('especialidades').subscribe(especialidades => {
      if (especialidades) {
        this.especialidadesMostrar = [...especialidades];
        this.especialidades = [...especialidades];
      }
    });
  }

  test()
  {
    console.log(this.formEspecialista.controls.dni);
  }


  dniValidar(control: AbstractControl): ValidationErrors | null {

    const value = (control.value).toString();
    if (value && value.length != 8) {
      return { dniValidar: true };
    }
    return null;
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

  // onCheckboxChange(event: any): void {
  //   const especialidad = event.target.value;
  //   const especialidades = this.formEspecialista.get('especialidad')?.value || [];
  //   console.log(especialidad);

  //   if (event.target.checked) {
  //     especialidades.push(especialidad);
  //   } else {
  //     const index = especialidades.indexOf(especialidad);
  //     if (index > -1) {
  //       especialidades.splice(index, 1);
  //     }
  //   }
  //   this.formEspecialista.get('especialidad')?.setValue(especialidades);
  // }

  // addNuevaEspecialidad(): void {
  //   console.log('entro');
  //   const nuevaEspecialidad = this.formEspecialista.get('nuevaEspecialidad')?.value;
  //   if (nuevaEspecialidad) {
  //     let especialidades = this.formEspecialista.get('especialidad')?.value || [];
  //     especialidades = especialidades.filter((e: string) => e !== 'otra');
  //     especialidades.push(nuevaEspecialidad);
  //     this.formEspecialista.get('especialidad')?.setValue(especialidades);
  //   }
  // }

  remove(especialidad: any): void {
    const index = this.especialidadesMostrar.indexOf(especialidad);
    console.log(index);
    if (index >= 0) {
      this.especialidadesMostrar.splice(index, 1);
      this.snackBar.open(`Eliminado ${especialidad.nombre}`, 'Close', {
        duration: 2000
      });
    }
  }

  add(event: MatChipInputEvent): void {
    const value = (event.value || '').trim();
    if (value) {
      this.especialidades.forEach(especialidad => {
        if (especialidad.nombre == value) {
          this.encontro = true;
        }
      });
      if (!this.encontro) {
        this.firestore.agregar({ nombre: value, id: '' }, 'especialidades');
      }
      else {
        let espe: any = this.especialidadesMostrar.find(e => e.nombre === value) != undefined;

        if (!espe) {
          this.especialidadesMostrar.push({ nombre: value, id: '' });
        }
      }
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
  
    this.test();
    if ((this.form.valid || this.formEspecialista.valid) && this.especialidadesMostrar.length > 0) {
      try {
        this.isLoading = true;

        if (this.form.valid) {

          const paciente: Paciente = {
            id: '',
            uid: '',
            nombre: this.form.controls.nombre.value,
            apellido: this.form.controls.apellido.value,
            edad: this.form.controls.edad.value,
            dni: this.form.controls.dni.value,
            obraSocial: this.form.controls.obraSocial.value,
            correo: this.form.controls.correo.value,
            clave: this.form.controls.password.value,
            tipo: 'Paciente',
            imagen: {
              foto1: '',
              foto2: ''
            }
          }

          const fotos = { fotoUno: this.imagenPerfilUno, fotoDos: this.imagenPerfilDos }
          this.AuthService.registrar(paciente, paciente.clave, fotos);
        }
        else {
          let espe: any[] = [];
          this.especialidadesMostrar.forEach(especialidad => {
            espe.push(especialidad.nombre);
          });
          const especialista: Especialista = {
            id: '',
            uid: '',
            nombre: this.formEspecialista.controls.nombre.value,
            apellido: this.formEspecialista.controls.apellido.value,
            edad: this.formEspecialista.controls.edad.value,
            dni: this.formEspecialista.controls.dni.value,
            especialidad: espe,
            correo: this.formEspecialista.controls.correo.value,
            clave: this.formEspecialista.controls.password.value,
            imagen: {foto1:''},
            verificado: false,
            tipo: 'Especialista',
            disponibilidad: {}
          }

          const fotos = { fotoUno: this.imagenPerfilUno}
          this.AuthService.registrar(especialista, especialista.clave, fotos);
        }

        this.usuario = this.AuthService.getUser('usuario');
        if (this.usuario) {
          this.router.navigate(['/espera']);
        }
      } catch (error) {
        console.log(error);
      } finally {
        this.isLoading = false;
      }
    }
  }
}

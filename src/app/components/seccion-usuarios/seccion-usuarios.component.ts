import { Component, OnInit, ViewChild, inject } from '@angular/core';
import { NavbarComponent } from '../navbar/navbar.component';
import { FooterComponent } from '../footer/footer.component';
import { Router, RouterLink } from '@angular/router';
import { CommonModule, DatePipe } from '@angular/common';
import { FirestoreService } from '../../services/firestore.service';
import { ListadoEspecialistasComponent } from '../listado-especialistas/listado-especialistas.component';
import { Especialista } from '../../interfaces/especialista';
import { DetalleEspecialistaComponent } from '../detalle-especialista/detalle-especialista.component';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Administrador } from '../../interfaces/administrador';
import { AuthService } from '../../services/auth.service';
import { LoaderComponent } from '../loader/loader.component';
import { Usuario } from '../../interfaces/usuario';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { Turno } from '../../interfaces/turno';
import { Timestamp } from '@angular/fire/firestore';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { CaptchaPropioComponent } from '../captcha-propio/captcha-propio.component';
import { MatSnackBar } from '@angular/material/snack-bar';
  
const animacion = trigger('slideInEllipticBottomFwd', [
  state('void', style({
    transform: 'translateY(600px) rotateX(30deg) scale(0)',
    transformOrigin: '50% 100%',
    opacity: 0
  })),
  state('*', style({
    transform: 'translateY(0) rotateX(0) scale(1)',
    transformOrigin: '50% -1400px',
    opacity: 1
  })),
  transition('void => *', [
    animate('0.7s cubic-bezier(0.250, 0.460, 0.450, 0.940)')
  ])
])

@Component({
  selector: 'app-seccion-usuarios',
  standalone: true,
  imports: [NavbarComponent, FooterComponent, RouterLink, CommonModule, ListadoEspecialistasComponent, DetalleEspecialistaComponent, FormsModule, ReactiveFormsModule, LoaderComponent, CaptchaPropioComponent],
  templateUrl: './seccion-usuarios.component.html',
  styleUrl: './seccion-usuarios.component.css',
  animations: [animacion]
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
  pacientes: any[] = [];

  isSeccionPaciente: boolean = false;

  turnos: Turno[] = [];
  @ViewChild('captcha') captchaComponent!: CaptchaPropioComponent;

  constructor(private firestore: FirestoreService, private fb: FormBuilder, private AuthService: AuthService, private datePipe: DatePipe, private snackBar: MatSnackBar) {

    this.usuario = this.AuthService.getUser('usuario');

    this.firestore.usuarios.subscribe(usuarios => {
      if (usuarios) {
        usuarios.forEach(usu => {
          if (usu.tipo === 'Paciente') {
            this.pacientes.push(usu);
          }
        });
      }
    })
  }

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
  
  descargarExcel(usuario: Usuario, tipo: boolean) {

    let userData: any[] = [];
    let tableColumn: any[] = [];
    const tableRows: any[][] = [];
    if (tipo) {
      tableColumn = ['Nombre', 'Apellido', 'Edad', 'DNI', 'Email', 'Tipo']
      this.pacientes.forEach(user => {
        userData = [
          user.nombre,
          user.apellido,
          user.edad,
          user.dni,
          user.correo,
          user.tipo
        ];
        tableRows.push(userData);
      });
    }
    else {

      this.firestore.getTurnosByPaciente(usuario.uid, 'paciente').subscribe(turnos => {
        turnos = turnos.map(t => { t.fechaTurno = t.fechaTurno instanceof Timestamp ? this.convertirTimestampADate(t.fechaTurno) : t.fechaTurno; return t });
        this.turnos = [...turnos];
      });

      tableColumn = ['FechaTurno', 'Especialidad', 'Paciente', 'Especialista']
      this.turnos.forEach(turno => {
        if (turno.estado === 'realizado') {
          const turnoFechaMod = this.datePipe.transform(turno.fechaTurno, 'MMM d, y');
          userData = [
            turnoFechaMod,
            turno.especialidad,
            usuario.nombre,
            turno.especialista.nombre
          ];
          tableRows.push(userData);
        }
      });
    }


    const worksheet: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet([tableColumn, ...tableRows]);
    const workbook: XLSX.WorkBook = {
      Sheets: { 'Datos de Usuarios': worksheet },
      SheetNames: ['Datos de Usuarios']
    };

    const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob: Blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
    saveAs(blob, `Datos_Usuarios_${new Date().toLocaleDateString()}.xlsx`);
  }


  convertirTimestampADate(timestamp: any): Date {
    const milliseconds = timestamp.seconds * 1000 + timestamp.nanoseconds / 1000000;
    return new Date(milliseconds);
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
    this.isSeccionPaciente = false;
  }

  seleccionarFotoPerfilUno($event: any) {
    if ($event.target.files.length > 0) {
      this.imagenPerfilUno = $event.target.files[0];
    }
  }


  async register() {
    if (this.form.valid && this.captchaComponent.captchaSolved) {
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
          imagen: { foto1: '' }
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
    else if(!this.captchaComponent.captchaSolved)
    {
      this.snackBar.open(`Complete el captcha.`, 'Close', {
        duration: 2000
      });
    }
    else 
    {
      this.snackBar.open(`Complete todos los campos.`, 'Close', {
        duration: 2000
      });
    }
  }
}

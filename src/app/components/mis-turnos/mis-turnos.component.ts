import { CommonModule } from '@angular/common';
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { Turno } from '../../interfaces/turno';
import { FirestoreService } from '../../services/firestore.service';
import { FooterComponent } from '../footer/footer.component';
import { Component, Input, inject } from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { ModalComentarioComponent } from '../modal-comentario/modal-comentario.component';
import { Usuario } from '../../interfaces/usuario';
import { Timestamp } from '@angular/fire/firestore';
import { SweetAlert2Module } from '@sweetalert2/ngx-sweetalert2';
import Swal from 'sweetalert2';
import { CambiarColorDirective } from '../../directivas/cambiar-color.directive';
import { FiltrarPipe } from '../../pipes/filtrar.pipe';
import { animate, state, style, transition, trigger } from '@angular/animations';

const animacion = [trigger('scaleInVerBottom', [
  state('void', style({
    transform: 'scaleY(0)',
    transformOrigin: '0% 100%',
    opacity: 1
  })),
  state('*', style({
    transform: 'scaleY(1)',
    transformOrigin: '0% 100%',
    opacity: 1
  })),
  transition('void => *', [
    animate('1s cubic-bezier(0.250, 0.460, 0.450, 0.940)')
  ])
])]

@Component({
  selector: 'app-mis-turnos',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, FormsModule, FooterComponent, CommonModule, MatTableModule, MatFormFieldModule, SweetAlert2Module, CambiarColorDirective, FiltrarPipe, ModalComentarioComponent, FooterComponent],
  templateUrl: './mis-turnos.component.html',
  styleUrl: './mis-turnos.component.css',
  animations: [animacion]
})
export class MisTurnosComponent {

  turnos: Turno[] = [];
  turnosFiltrados: Turno[] = [];
  cancelado: boolean = false;
  readonly modal = inject(MatDialog);
  turnoSeleccionado!: Turno;
  filtro: string = "";
  usuario: Usuario | undefined;
  filtroEspecialista: string = "";
  mostrarModalHistorial: boolean = false;
  filtroAdmin:string = "";

  constructor(private firestore: FirestoreService, private authService: AuthService) {

    this.usuario = authService.getUser('usuario');
    


    this.cargarTurnos();
  }

  convertirTimestampADate(timestamp: any): Date {
    const milliseconds = timestamp.seconds * 1000 + timestamp.nanoseconds / 1000000;
    return new Date(milliseconds);
  }

  async realizarEncuesta(turno: Turno) {
    const { value: formValues, isConfirmed } = await Swal.fire({
      html: `
        <h3><strong>Facilidad al solicitar un turno.</h3>
        <input id="facilidadTurno" class="swal2-input">

        <h3><strong>Tiempo de espera durante el turno.</h3>
        <input id="tiempoEspera" class="swal2-input">
      `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: 'Confirmar',
      cancelButtonText: 'Cancelar',
      preConfirm: () => {
        const facilidadTurno = document.getElementById("facilidadTurno")! as HTMLInputElement;
        const tiempoEspera = document.getElementById("tiempoEspera")! as HTMLInputElement;
          
        if (facilidadTurno.value.trim() === '' || tiempoEspera.value.trim() === '') {
          Swal.showValidationMessage('El comentario no puede estar vacío');
          return false; 
        }

        turno.encuesta!.facilidadTurno = facilidadTurno.value;
        turno.encuesta!.tiempoEspera = tiempoEspera.value;
        return true;
      }
    });
    if (isConfirmed && formValues) {
      Swal.fire({
        icon: 'success',
        timer: 2000,
      });

      this.firestore.actualizarTurno(turno, turno.id);
     
    }
  }

  mostrarModalDeHistorial(turno: Turno) {
    console.log('ingresó');
    this.turnoSeleccionado = turno;
    this.mostrarModalHistorial = true;
  }

  mostrarComentario(turno: Turno) {
    if (this.usuario?.tipo == "Especialista") {
      Swal.fire({
        title: 'Ver comentario',
        text: turno.comentarioPaciente,
        showConfirmButton: true
      });
    }
    else {
      Swal.fire({
        title: 'Ver comentario',
        text: turno.comentarioEspecialista,
        showConfirmButton: true
      });
    }
  }

  interactuarTurno(turno: Turno, tipo: string) {

    if (tipo == 'rechazado') {
      turno.estado = tipo;
    }
    else if (tipo == 'aceptado') {
      turno.estado = tipo;
    }
    this.firestore.actualizarTurno(turno, turno.id);
  }

  async calificar(turno: Turno) {

    const { value: formValues, isConfirmed } = await Swal.fire({
      html: `
        <h3><strong>Comentario</h3>
        <input id="comentario" class="swal2-input m-0">

        <h3 class="mt-3"><strong>Puntaje</h3>
        <input id="puntaje" class="swal2-input m-0">
      `,

      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: 'Confirmar',
      cancelButtonText: 'Cancelar',
      preConfirm: () => {
        const comentario = document.getElementById("comentario")! as HTMLInputElement;
        const puntaje = document.getElementById("puntaje")! as HTMLInputElement;
          
        if (comentario.value.trim() === '' || puntaje.value.trim() === '') {
          Swal.showValidationMessage('El comentario no puede estar vacío');
          return false; 
        }

        turno.calificacion!.comentario = comentario.value;
        turno.calificacion!.puntaje = parseInt(puntaje.value) as number;
        turno.calificacion!.calificado = true;
        turno.comentarioPaciente = comentario.value;
        return true; 
      }
    });
    if (isConfirmed && formValues) {
      Swal.fire({
        icon: 'success',
        timer: 2000,
        showConfirmButton: false
      });
      this.firestore.actualizarTurno(turno, turno.id);
    }
  }

  async cancelarTurno(turno: Turno, tipo: string) {
    const { value: formValues, isConfirmed } = await Swal.fire({
      html: `
        <h3><strong>Comentario del motivo.</strong></h3>
        <input id="comentario" class="swal2-input m-0">
      `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: 'Confirmar',
      cancelButtonText: 'Cancelar',
      preConfirm: () => {
        const comentario = document.getElementById("comentario")! as HTMLInputElement;
        
        if (comentario.value.trim() === '') {
          Swal.showValidationMessage('El comentario no puede estar vacío');
          return false; 
        }
        
        if (tipo == "especialista") {
          turno.comentarioEspecialista = comentario.value;
        }
        else if (tipo == 'paciente') {
          turno.comentarioPaciente = comentario.value;
        }
        else {
          turno.comentarioPaciente = comentario.value;
          turno.comentarioEspecialista = comentario.value;
        }
        turno.estado = 'cancelado';
        
        return true; 
      }
    });
  
    if (isConfirmed && formValues) {
      Swal.fire({
        icon: 'success',
        timer: 2000,
        showConfirmButton: false
      });
      this.firestore.actualizarTurno(turno, turno.id);
    }
  }

  async rechazarTurno(turno: Turno) {
    const { value: formValues, isConfirmed } = await Swal.fire({
      html: `
        <h3><strong>Comentario del motivo.</strong></h3>
        <input id="comentario" class="swal2-input m-0">
      `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: 'Confirmar',
      cancelButtonText: 'Cancelar',
      preConfirm: () => {
        const comentario = document.getElementById("comentario")! as HTMLInputElement;
        
        if (comentario.value.trim() === '') {
          Swal.showValidationMessage('El comentario no puede estar vacío');
          return false; 
        }
        turno.comentarioEspecialista = comentario.value;
        turno.estado = 'cancelado';
        return true; 
      }
    });
  
    if (isConfirmed && formValues) {
      Swal.fire({
        icon: 'success',
        timer: 2000,
        showConfirmButton: false
      });
      this.firestore.actualizarTurno(turno, turno.id);
    }
  }

  cargarTurnos() {

    if(this.usuario?.tipo == "Administrador")
    {
      this.firestore.getCollection('turnos').subscribe(turnos=>{
        if(turnos)
        {
          turnos = turnos.map(t => { t.fechaTurno = t.fechaTurno instanceof Timestamp ? this.convertirTimestampADate(t.fechaTurno) : t.fechaTurno; return t });
  
          this.turnos = [...turnos];
          this.turnosFiltrados = [...turnos];
        }
      });
    }
    else
    {
      this.authService.user$.subscribe(user => {
        if (user) {
          this.firestore.getTurnosByPaciente(user.uid, this.usuario!.tipo).subscribe(turnos => {
  
            turnos = turnos.map(t => { t.fechaTurno = t.fechaTurno instanceof Timestamp ? this.convertirTimestampADate(t.fechaTurno) : t.fechaTurno; return t });
  
            this.turnos = [...turnos];
            this.turnosFiltrados = [...turnos];
          });
        }
      });
    }
  }

  async recibirHistorial(turnoActualizado: Turno) {
    this.mostrarModalHistorial = false;
    turnoActualizado.estado = 'realizado';
    await this.firestore.actualizarTurno(turnoActualizado, turnoActualizado.id);
    this.cargarTurnos();
  }
}


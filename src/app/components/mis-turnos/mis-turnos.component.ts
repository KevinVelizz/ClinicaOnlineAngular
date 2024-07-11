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
import { combineLatest, map, Observable, startWith } from 'rxjs';
import { Especialista } from '../../interfaces/especialista';

@Component({
  selector: 'app-mis-turnos',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, FormsModule, FooterComponent, CommonModule, MatTableModule, MatFormFieldModule],
  templateUrl: './mis-turnos.component.html',
  styleUrl: './mis-turnos.component.css'
})
export class MisTurnosComponent {
  turnos: Turno[] = [];
  turnosFiltrados: Turno[] = [];
  mostrarComentario: boolean = false;
  cancelado: boolean = false;
  readonly modal = inject(MatDialog);
  turnoSeleccionado!: Turno;
  filtro: string = "";

  constructor(private firestore: FirestoreService, private authService: AuthService) {

    this.authService.user$.subscribe(user => {
      if (user) {
        this.firestore.getTurnosByPaciente(user.uid).subscribe(turnos => {
          this.turnos = [...turnos];
          this.turnosFiltrados = [...turnos];
          

          this.firestore.usuarios.subscribe(users => {
            if (users) {
              users.forEach(user => {
                this.turnosFiltrados.forEach(turno => {
                  if (user.uid === turno.especialista) {
                    turno.especialista = user.nombre;
                    turno.fechaTurno = this.convertirTimestampADate(turno?.fechaTurno); 
                    console.log(turno.fechaTurno);
                  }
                });
              });
            }
          });
        });
      }
    });
  }

  cancelar(turno: Turno) {
    this.turnoSeleccionado = turno;
    this.abrirDialogo('700ms', '700ms');
  }

  convertirTimestampADate(timestamp: any): Date {
    const milliseconds = timestamp.seconds * 1000 + timestamp.nanoseconds / 1000000;
    return new Date(milliseconds);
  }

  abrirDialogo(enterAnimationDuration: string, exitAnimationDuration: string) {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.width = '450px';
    dialogConfig.autoFocus = true;
    dialogConfig.enterAnimationDuration = enterAnimationDuration;
    dialogConfig.exitAnimationDuration = exitAnimationDuration;

    const dialogRef = this.modal.open(ModalComentarioComponent, dialogConfig
    );

    dialogRef.afterClosed().subscribe((result: string) => {
      if (this.turnoSeleccionado) {
        this.turnoSeleccionado.resenia = result;
        this.firestore.actualizarTurno(this.turnoSeleccionado, this.turnoSeleccionado.id);
      }
    });
  }

  filtrarTurnos() {
    this.turnosFiltrados = this.turnos.filter(turno => {
      const filtroLower = this.filtro.toLowerCase();
      return turno.especialidad.toLowerCase().includes(filtroLower) ||
        turno.especialista.toLowerCase().includes(filtroLower);
    });
  }
}


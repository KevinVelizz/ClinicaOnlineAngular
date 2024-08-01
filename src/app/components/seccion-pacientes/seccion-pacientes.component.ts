import { Component } from '@angular/core';
import { Usuario } from '../../interfaces/usuario';
import { FirestoreService } from '../../services/firestore.service';
import { AuthService } from '../../services/auth.service';
import { Turno } from '../../interfaces/turno';
import { Timestamp } from '@angular/fire/firestore';
import { CommonModule, DatePipe } from '@angular/common';
import { Paciente } from '../../interfaces/paciente';
import { SweetAlert2Module } from '@sweetalert2/ngx-sweetalert2';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-seccion-pacientes',
  standalone: true,
  imports: [CommonModule, DatePipe],
  templateUrl: './seccion-pacientes.component.html',
  styleUrl: './seccion-pacientes.component.css'
})
export class SeccionPacientesComponent {

  pacientesAtendidos: Usuario[] = [];
  usuario: Usuario | undefined;
  turnos: Turno[] = [];
  ultimosTurnosPaciente: Turno[] = [];

  constructor(private firestore: FirestoreService, private auth: AuthService) {

    this.usuario = this.auth.getUser('usuario');

    this.firestore.getTurnosByPaciente(this.usuario!.uid, this.usuario!.tipo).subscribe(turnos => {
      if (turnos) {
        turnos = turnos.map(t => { t.fechaTurno = t.fechaTurno instanceof Timestamp ? this.convertirTimestampADate(t.fechaTurno) : t.fechaTurno; return t });
        this.turnos = [...turnos];
      }
    });

    this.firestore.usuarios.subscribe(usuarios => {
      if (usuarios) {
        this.turnos.forEach(turno => {
          if (turno.historial?.comentario !== '') {
            usuarios.forEach(usu => {
              if (usu.uid === turno.paciente.uid) {
                if (!this.pacientesAtendidos.find(p => p.uid === usu.uid)) {
                  this.pacientesAtendidos.push(usu);
                }
                if (!this.ultimosTurnosPaciente.find(t => t.id === turno.id)) {
                  this.ultimosTurnosPaciente.push(turno);
                }
              }
            });
          }
        });
        console.log(this.ultimosTurnosPaciente);

      }
    });


    this.ultimosTurnosPaciente = this.turnos
      .sort((a, b) => b.fechaTurno.getTime() - a.fechaTurno.getTime())
      .slice(0, 3);
  }

  async mostrarHistorial(paciente: Usuario) {
    const turnosDelPaciente = this.turnos.filter(turno => turno.paciente.uid === paciente.uid);

    const filas = turnosDelPaciente.map(turno => `
      <tr>
        <td>${turno.especialidad}</td>
        <td>${turno.especialista.nombre}</td>
        <td>${new Date(turno.fechaTurno).toLocaleDateString()}</td>
        <td>${new Date(turno.fechaTurno).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
        <td>${turno.historial?.altura}</td>
        <td>${turno.historial?.peso}</td>
        <td>${turno.historial?.temperatura}</td>
        <td>${turno.historial?.presion}</td>
        <td>${turno.historial?.comentario}</td>
        <td>
          <ul class="list-none">
            ${turno.historial?.datosDinamicos ? turno.historial.datosDinamicos.map(dato => `<li>${dato.clave}: ${dato.valor}</li>`).join('') : 'N/A'}
          </ul>
        </td>
      </tr>`).join('');

    await Swal.fire({
      html: `
        <div class="flex justify-center items-center">
          <div class="w-full bg-white border border-gray-200 rounded-lg shadow dark:bg-gray-800 dark:border-gray-700 p-6" style="width: 90vw;">
            <div class="overflow-x-auto">
              <table class="table-auto w-90vh text-center">
                <thead class="bg-blue-500 text-white">
                  <tr>
                    <th>Especialidad</th>
                    <th>Especialista</th>
                    <th>Fecha</th>
                    <th>Hora</th>
                    <th>Altura (cm)</th>
                    <th>Peso (kg)</th>
                    <th>Temperatura (°C)</th>
                    <th>Presión</th>
                    <th>Comentario</th>
                    <th>Datos adicionales</th>
                  </tr>
                </thead>
                <tbody>
                  ${filas}
                </tbody>
              </table>
            </div>
          </div>
        </div>`,
      width: '100%',
      focusConfirm: false,
    });
  }

  convertirTimestampADate(timestamp: any): Date {
    const milliseconds = timestamp.seconds * 1000 + timestamp.nanoseconds / 1000000;
    return new Date(milliseconds);
  }
}

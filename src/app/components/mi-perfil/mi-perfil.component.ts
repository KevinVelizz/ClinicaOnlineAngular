import { Component } from '@angular/core';
import { FooterComponent } from '../footer/footer.component';
import { NavbarComponent } from '../navbar/navbar.component';
import { FormBuilder, FormGroup, FormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Usuario } from '../../interfaces/usuario';
import { CommonModule, DatePipe } from '@angular/common';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { FirestoreService } from '../../services/firestore.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Turno } from '../../interfaces/turno';
import { Timestamp } from '@angular/fire/firestore';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { animate, state, style, transition, trigger } from '@angular/animations';

const animacion = [trigger('slideInRight', [
  state('void', style({
    transform: 'translateX(350px)',
    opacity: 0
  })),
  state('*', style({
    transform: 'translateX(0)',
    opacity: 1
  })),
  transition('void => *', [
    animate('1s cubic-bezier(0.250, 0.460, 0.450, 0.940)')
  ])
])]

@Component({
  selector: 'app-mi-perfil',
  standalone: true,
  imports: [NavbarComponent, FooterComponent, CommonModule, FormsModule],
  templateUrl: './mi-perfil.component.html',
  styleUrl: './mi-perfil.component.css',
  animations: [animacion]
})
export class MiPerfilComponent {

  user: Usuario | any;
  isEspecialista: boolean = false;
  horariosForm: FormGroup;
  especialidades: string[] = [];
  imagenes: any[] = [];
  horarios: { [dia: string]: { desde: string, hasta: string }[] } = {};
  horas: { [dia: string]: string[] } = {
    'Lunes': this.generarHoras('Lunes'),
    'Martes': this.generarHoras('Martes'),
    'Miércoles': this.generarHoras('Miércoles'),
    'Jueves': this.generarHoras('Jueves'),
    'Viernes': this.generarHoras('Viernes'),
    'Sábado': this.generarHoras('Sábado')
  };

  usuarios: any[] = [];
  turnosHistorial: Turno[] = [];

  constructor(
    private authService: AuthService,
    private fb: FormBuilder,
    private firestore: FirestoreService,
    private snackBar: MatSnackBar,
    private datePipe: DatePipe
  ) {
    this.horariosForm = this.fb.group({
      especialidad: ['', Validators.required],
      horario: ['', Validators.required]
    });
    this.user = this.authService.getUser('usuario');

    this.imagenes.push(this.user.imagen);

    if (this.user?.tipo == 'Paciente') {
      this.firestore.getTurnosByPaciente(this.user.uid, this.user.tipo).subscribe(turnos=>{
        if(turnos)
        {
          turnos = turnos.map(t => { t.fechaTurno = t.fechaTurno instanceof Timestamp ? this.convertirTimestampADate(t.fechaTurno) : t.fechaTurno; return t });
          this.turnosHistorial = [...turnos];
        }
      });
    }
    else if(this.user?.tipo == 'Administrador')
    {
      this.firestore.usuarios.subscribe(usuarios=>{
        if(usuarios)
        {
          this.usuarios = usuarios;
        }
      });
    }
  }


  getHorasInicioDisponibles(dia: string, index: number): string[] {
    const horariosDia = this.horarios[dia];
    return this.horas[dia].filter(hora => {
      const horarioActual = horariosDia[index];
      return !horarioActual.hasta || hora < horarioActual.hasta;
    });
  }

  getHorasFinDisponibles(dia: string, index: number): string[] {
    const horariosDia = this.horarios[dia];
    return this.horas[dia].filter(hora => {
      const horarioActual = horariosDia[index];
      return !horarioActual.desde || hora > horarioActual.desde;
    });
  }

  convertirTimestampADate(timestamp: any): Date {
    const milliseconds = timestamp.seconds * 1000 + timestamp.nanoseconds / 1000000;
    return new Date(milliseconds);
  }

  agregarHorario(dia: string) {
    if (!this.horarios[dia]) {
      this.horarios[dia] = [];
    }
    if (this.horarios[dia].length === 0) {

      this.horarios[dia].push({ desde: '', hasta: '' });
    }
  }

  descargarPDF() {


    const doc = new jsPDF();

    doc.text('Informe de Historial Clínico', 10, 10);
    doc.text(`Fecha de emisión: ${new Date().toLocaleDateString()}`, 10, 30);
    doc.addImage('assets/resources/img/logo-clinica.jpg', 'JPEG', 150, 10, 50, 30);

    const tableColumn = ['Especialidad', 'Especialista', 'Fecha', 'Hora', 'Altura (cm)', 'Peso (kg)', 'Temperatura (°C)', 'Presión', 'Comentario', 'Datos adicionales'];
    const tableRows: any[][] = [];

    this.turnosHistorial.forEach(turno => {
      const datosAdicionales = turno.historial?.datosDinamicos.map(dato => `${dato.clave}: ${dato.valor}`).join('\n') || '';
      const turnoFechaMod = this.datePipe.transform(turno.fechaTurno, 'MMM d, y');
      const turnoData = [
        turno.especialidad,
        turno.especialista.nombre,
        turnoFechaMod,
        `${turno.fechaTurno.getHours()}:${turno.fechaTurno.getMinutes()}`,
        turno.historial?.altura || '',
        turno.historial?.peso || '',
        turno.historial?.temperatura || '',
        turno.historial?.presion || '',
        turno.historial?.comentario || '',
        datosAdicionales
      ];
      tableRows.push(turnoData);
    });

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 50,
    });

    doc.save(`Historial_Clinico_${'Todas'}.pdf`);
  }


  descargarExcel() {

    const tableColumn = ['Nombre', 'Apellido', 'Edad', 'DNI', 'Email', 'Tipo'];
    const tableRows: any[][] = [];

    this.usuarios.forEach(usuario => {
      const userData = [
        usuario.nombre,
        usuario.apellido,
        usuario.edad,
        usuario.dni,
        usuario.correo,
        usuario.tipo
      ];
      tableRows.push(userData);
    });

    const worksheet: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet([tableColumn, ...tableRows]);
    const workbook: XLSX.WorkBook = {
      Sheets: { 'Datos de Usuarios': worksheet },
      SheetNames: ['Datos de Usuarios']
    };

    const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob: Blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
    saveAs(blob, `Datos_Usuarios_${new Date().toLocaleDateString()}.xlsx`);
  }

  guardarDisponibilidad() {
    if (this.user.tipo) {
      this.user.disponibilidad = this.horarios;
      this.firestore.actualizarEntidad(this.user, this.user.id, 'usuarios')
        .then(() => {
          this.snackBar.open(`Guardado Correctamente.`, 'Close', {
            duration: 2000
          });
        })
        .catch(error => console.error('Error al guardar disponibilidad:', error));
    }
  }

  generarHoras(dia: string): string[] {
    const horas: string[] = [];
    let inicio = (dia === 'Sábado') ? 8 : 8;
    let fin = (dia === 'Sábado') ? 14 : 19;
  
    for (let i = inicio; i <= fin; i++) {
      horas.push(i.toString().padStart(2, '0') + ':00');
      if ((dia !== 'Sábado' && i !== 19) || (dia === 'Sábado' && i !== 14)) {
        horas.push(i.toString().padStart(2, '0') + ':30');
      }
    }
    return horas;
  }



}

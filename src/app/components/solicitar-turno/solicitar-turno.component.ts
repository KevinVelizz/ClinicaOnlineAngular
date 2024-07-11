import { CommonModule, DatePipe } from '@angular/common';
import { Component } from '@angular/core';
import { Form, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Especialista } from '../../interfaces/especialista';
import { Paciente } from '../../interfaces/paciente';
import { FirestoreService } from '../../services/firestore.service';
import { AuthService } from '../../services/auth.service';
import { DiasPipe } from '../../pipes/dias.pipe';
import { Turno } from '../../interfaces/turno';
import { Timestamp } from 'rxjs';

@Component({
  selector: 'app-solicitar-turno',
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, CommonModule],
  templateUrl: './solicitar-turno.component.html',
  styleUrl: './solicitar-turno.component.css'
})
export class SolicitarTurnoComponent {
  especialidades: any[] = [];
  especialistas: Especialista[] = [];
  especialistasFiltrados: Especialista[] = [];
  diasDisponibles: any[] = [];
  horariosDisponibles: Date[] = [];
  especialistaSeleccionado!: Especialista;
  esAdmin: boolean = false;
  especialidadesMostrar: any[] = [];
  fechasDisponibles: string[] = [];
  horasDisponibles: string[] = [];
  horarioTurno: { [dia: string]: { desde: string, hasta: string }[] } = {};
  subirTurno: boolean = false;

  fechaFinal: Date = new Date();

  turnosFirebase: Turno[] = [];

  constructor(private firestore: FirestoreService, private authService: AuthService, private datePipe: DatePipe) {

    this.firestore.usuarios.subscribe(users => {
      if (users) {
        users.forEach(user => {
          if (user.tipo == "Especialista") {
            this.especialistas.push(user as Especialista);
          }
        });
      }
    });

    this.firestore.getCollection('especialidades').subscribe(especialidades => {
      if (especialidades) {
        this.especialidades = [...especialidades];
      }
    });

    this.firestore.getCollection('turnos').subscribe(turnos => {
      if (turnos) {
        this.turnosFirebase = turnos;

        for (let index = 0; index < this.turnosFirebase.length; index++) {
          this.turnosFirebase[index].fechaTurno = this.convertirTimestampADate(this.turnosFirebase[index].fechaTurno);
        }
      }
      console.log(this.turnosFirebase);
    });
    
  }

  ngOnInit(): void {
  }

  convertirTimestampADate(timestamp: any): Date {
    const milliseconds = timestamp.seconds * 1000 + timestamp.nanoseconds / 1000000;
    return new Date(milliseconds);
  }

  seleccionarEspecialista(especialista: Especialista) {
    this.subirTurno = false;
    this.especialistaSeleccionado = especialista;
    this.especialidadesEspecialista(especialista.especialidad);
  }

  mostrarDias() {
    this.diasDisponibles = [];
    this.diasDisponibles = Object.keys(this.especialistaSeleccionado.disponibilidad);
  }

  especialidadesEspecialista(especialidad: any) {
    this.subirTurno = false;
    let especialidades = especialidad;
    this.especialidadesMostrar = especialidades.filter((especialidades: any) =>
      this.especialidades.some(especialidad2 => especialidad2.nombre === especialidades)
    );
  }

  fechaSeleccionadoElDia(dia: string) {
    this.subirTurno = false;
    this.horariosDisponibles = [];
    let datesArray: Array<Date> = [];
    const horarios = this.especialistaSeleccionado.disponibilidad[dia][0];

    let [hoursStrDesde, minutesStrDesde] = horarios.desde.split(':');
    const hoursStart = parseInt(hoursStrDesde, 10);
    const minutesStart = parseInt(minutesStrDesde, 10);
    const startDate: Date = new Date();
    startDate.setDate(startDate.getDate() + 1);
    startDate.setHours(hoursStart, minutesStart, 0, 0);

    let [hoursStrHasta, minutesStrHasta] = horarios.hasta.split(':');
    const hoursEnd = parseInt(hoursStrHasta, 10);
    const minutesEnd = parseInt(minutesStrHasta, 10);
    const endDate: Date = new Date(startDate);
    endDate.setDate(endDate.getDate() + 15);
    endDate.setHours(hoursEnd, minutesEnd, 0, 0);

    let auxDate: Date = new Date(startDate);

    const diasPipe = new DiasPipe();
    const numeroDia = diasPipe.transform(dia);
    console.log(horarios);

    const tiempoInicio = `${hoursStrDesde.padStart(2, '0')}:${minutesStrDesde.padStart(2, '0')}`;
    const tiempoFinal = `${hoursStrHasta.padStart(2, '0')}:${minutesStrHasta.padStart(2, '0')}`;

    while (auxDate < endDate) {
      const tiempoActual = `${(auxDate.getHours().toString()).padStart(2, '0')}:${(auxDate.getMinutes().toString()).padStart(2, '0')}`;
      if (numeroDia == auxDate.getDay() && this.isTimeInRange(tiempoActual, tiempoInicio, tiempoFinal)) {
        datesArray.push(new Date(auxDate));
        auxDate.setMinutes(auxDate.getMinutes() + 30);
        if ((auxDate.getDay() != 6 && auxDate.getHours() === 19) || (auxDate.getHours() == 14 && auxDate.getDay() == 6)) {
          if (auxDate.getDay() == 6) {
            auxDate.setDate(auxDate.getDate() + 2);
          }
          else {
            auxDate.setDate(auxDate.getDate() + 1);
          }
          auxDate.setHours(hoursStart, minutesStart, 0, 0);
        }
      } else {
        if (auxDate.getDay() == 6) {
          auxDate.setDate(auxDate.getDate() + 2);
        }
        else {
          auxDate.setDate(auxDate.getDate() + 1);
        }
        auxDate.setHours(hoursStart, minutesStart, 0, 0);
      }
    }
    this.horariosDisponibles = datesArray;
  }

  mostrarFechaPedida(dia: string) {
    this.horasDisponibles = [];
    this.fechasDisponibles = [];
    this.fechaSeleccionadoElDia(dia);
    const diasPipe = new DiasPipe();
    const numeroDia = diasPipe.transform(dia);
    const nuevaFecha = new Date();

    for (let index = 0; index < 15; index++) {

      if (nuevaFecha.getDay() == numeroDia) {
        this.fechasDisponibles.push(this.datePipe.transform(new Date(nuevaFecha), 'YYYY/MM/dd')!);
      }
      nuevaFecha.setDate(nuevaFecha.getDate() + 1);
    }

  }

  mostrarHorarioPedido(fecha: string) {
    this.horasDisponibles = [];
    const [year, mes, dia] = fecha.split('/');
    this.horariosDisponibles.forEach(fecha => {

      if (Number(year) == fecha.getFullYear() && Number(mes) - 1 == fecha.getMonth() && Number(dia) == fecha.getDate())
      
        
        this.horasDisponibles.push(`${fecha.getHours().toString().padStart(2, '0')}:${fecha.getMinutes().toString().padStart(2, '0')}`);
    });

    this.fechaFinal.setDate(Number(dia));
    this.fechaFinal.setMonth(Number(mes) - 1);
    this.fechaFinal.setFullYear(Number(year));
  }

  cargarTurno() {

    const turno: Turno =
    {
      id: "",
      especialidad: '',
      especialista: '',
      paciente: '',
      estado: 'pendiente',
      encuesta: 'string',
      calificacion: {
        puntaje: 0,
        comentario: '',
        calificado: false
      },
      fechaTurno: this.fechaFinal,
      resenia: '',
      historial: {
        altura: 0,
        peso: 0,
        temperatura: 0,
        presion: 0,
        datosDinamicos: [],
        comentario: '',
      }
    }
    this.firestore.agregar(turno, 'turnos');
  }

  horarioFinal(hora: string) {
    const [hour, minuto] = hora.split(':');
    this.fechaFinal.setHours(Number(hour), Number(minuto), 0, 0);
    this.subirTurno = true;
  }

  isTimeInRange(time: string, startTime: string, endTime: string): boolean {
    const currentTime = new Date(`1970-01-01T${time}:00`);
    const start = new Date(`1970-01-01T${startTime}:00`);
    const end = new Date(`1970-01-01T${endTime}:00`);
    return currentTime >= start && currentTime <= end;
  }
}

import { CommonModule, DatePipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Especialista } from '../../interfaces/especialista';
import { Paciente } from '../../interfaces/paciente';
import { FirestoreService } from '../../services/firestore.service';
import { AuthService } from '../../services/auth.service';
import { DiasPipe } from '../../pipes/dias.pipe';
import { Turno } from '../../interfaces/turno';
import { Usuario } from '../../interfaces/usuario';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { FooterComponent } from '../footer/footer.component';

const animacion = [trigger('scaleInVerTop', [
  state('void', style({
    transform: 'scaleY(0)',
    transformOrigin: '100% 0%',
    opacity: 1
  })),
  state('*', style({
    transform: 'scaleY(1)',
    transformOrigin: '100% 0%',
    opacity: 1
  })),
  transition('void => *', [
    animate('1s cubic-bezier(0.250, 0.460, 0.450, 0.940)')
  ])
])]

@Component({
  selector: 'app-solicitar-turno',
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, CommonModule, FooterComponent],
  templateUrl: './solicitar-turno.component.html',
  styleUrl: './solicitar-turno.component.css',
  animations: [animacion]
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

  especialidadSeleccionada: string = "";

  fechaFinal: Date = new Date();
  
  fechaSeleccionado!: any;

  turnosFirebase: Turno[] = [];

  usuarioLogueado: Usuario | undefined;

  dniPaciente!: number;

  pacienteEncontrado: Usuario | undefined;

  router = inject(Router);
  horaSeleccionada: any;
  diaSeleccionado: any;

  constructor(private firestore: FirestoreService, private authService: AuthService, private datePipe: DatePipe, private snackBar: MatSnackBar) {

    this.especialistas = [];
    this.especialistasFiltrados = [];

    this.usuarioLogueado = authService.getUser('usuario');
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
    this.diasDisponibles = [];
    this.horasDisponibles = [];
    this.fechasDisponibles = [];
    this.especialistaSeleccionado = especialista;
    this.especialidadesEspecialista(especialista.especialidad);
  }

  mostrarDias(especialidad: string) {
    this.especialidadSeleccionada = especialidad;
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
    this.diaSeleccionado = dia;
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
    this.fechaSeleccionado = fecha;
    const [year, mes, dia] = fecha.split('/');
    const fechaBusqueda = new Date(Number(year), Number(mes) - 1, Number(dia));

    this.horariosDisponibles.forEach(fecha => {

      if (fecha.getFullYear() === fechaBusqueda.getFullYear() &&
        fecha.getMonth() === fechaBusqueda.getMonth() &&
        fecha.getDate() === fechaBusqueda.getDate()) {
        const isReserved = this.turnosFirebase.some(turno => {
          const fechaTurno = new Date(turno.fechaTurno);
          return fecha.getTime() === fechaTurno.getTime();
        });
        if (!isReserved) {
          this.horasDisponibles.push(`${fecha.getHours().toString().padStart(2, '0')}:${fecha.getMinutes().toString().padStart(2, '0')}`);
        }
      }
    });

    this.fechaFinal.setDate(Number(dia));
    this.fechaFinal.setMonth(Number(mes) - 1);
    this.fechaFinal.setFullYear(Number(year));
  }

  buscarPaciente() {
    this.firestore.usuarios.subscribe(usuarios => {
      if (usuarios) {
        const usuario = usuarios.find(usuario => usuario.dni === this.dniPaciente && usuario.tipo === "Paciente");
        if (usuario) {
          this.pacienteEncontrado = usuario;
        } else {
          this.pacienteEncontrado = undefined;
        }
      } else {
        this.pacienteEncontrado = undefined;
      }
    });
  }

  cargarTurno() {

    let usuario: Paciente;

    if (this.pacienteEncontrado) {
      usuario = this.pacienteEncontrado as Paciente;
    }
    else {
      usuario = this.usuarioLogueado as Paciente;
    }

    const turno: Turno =
    {

      id: "",
      especialidad: this.especialidadSeleccionada,
      especialista: this.especialistaSeleccionado,
      paciente: usuario,
      estado: 'pendiente',
      encuesta: {
        facilidadTurno: '',
        tiempoEspera: '',
      },
      calificacion: {
        puntaje: 0,
        comentario: '',
        calificado: false
      },
      fechaTurno: this.fechaFinal,
      comentarioPaciente: '',
      comentarioEspecialista: '',
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

    this.snackBar.open(`Turno registrado correctamente`, 'Close', {
      duration: 2000
    });

    this.router.navigate(['/bienvenida']);
  }

  horarioFinal(hora: string) {
    this.horaSeleccionada = hora;
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

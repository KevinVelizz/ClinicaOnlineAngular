import { Pipe, PipeTransform } from '@angular/core';
import { Turno } from '../interfaces/turno';

@Pipe({
  name: 'filtrar',
  standalone: true
})
export class FiltrarPipe implements PipeTransform {

  transform(turnos: Turno[], busqueda: string, tipo: string): Turno[] {
    if (busqueda == '') {
      return turnos;
    }
    busqueda = busqueda.toLowerCase();
    if (tipo == 'Paciente' || tipo == 'Especialista') {
      console.log(turnos[0].fechaTurno);
      return turnos.filter(turno =>
        turno.especialidad?.toLowerCase().includes(busqueda) ||
        turno.especialista.nombre.toLowerCase().includes(busqueda) ||
        turno.paciente.nombre.toLowerCase().includes(busqueda) ||
        formatDate(turno.fechaTurno).toLowerCase().includes(busqueda) ||
        turno.estado.includes(busqueda) ||
        (turno.historial?.datosDinamicos?.some(data =>
          data.clave.toLowerCase().includes(busqueda) ||
          data.valor.toString().toLowerCase().includes(busqueda)
        )) ||
        turno.calificacion?.puntaje.toString().toLowerCase().includes(busqueda) ||
        turno.historial?.altura.toString().toLowerCase().includes(busqueda) ||
        turno.historial?.peso.toString().toLowerCase().includes(busqueda) ||
        turno.historial?.presion.toString().toLowerCase().includes(busqueda) ||
        turno.historial?.temperatura.toString().toLowerCase().includes(busqueda)
      );
    }
    else
    {
      return turnos.filter(turno =>
        turno.especialidad?.toLowerCase().includes(busqueda) ||
        turno.especialista.nombre.toLowerCase().includes(busqueda))
    }
  }
}

function formatDate(date: Date): string {
  const options: Intl.DateTimeFormatOptions = {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
    hour12: true
  };
  return date.toLocaleString('en-US', options);
}



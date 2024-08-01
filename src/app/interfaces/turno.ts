import { Especialista } from "./especialista";
import { Paciente } from "./paciente";

export interface Turno {
  id: string;
  especialidad: string;
  especialista: Especialista;
  paciente: Paciente;
  estado: 'pendiente' | 'aceptado' | 'rechazado' | 'realizado' | 'cancelado';
  encuesta?: {
    facilidadTurno: string,
    tiempoEspera: string,
  };
  calificacion?: {
    puntaje: number,
    comentario: string,
    calificado: boolean
  };
  fechaTurno: Date;
  comentarioEspecialista?: string;
  comentarioPaciente?: string;
  historial?: {
    altura: number;
    peso: number;
    temperatura: number;
    presion: number;
    datosDinamicos: Array<{ clave: string, valor: any }>;
    comentario: string,
  }
}
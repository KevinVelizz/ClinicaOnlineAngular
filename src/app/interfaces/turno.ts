
export interface Turno {
    id: string;
    especialidad: string;
    especialista: string;
    paciente: string;
    estado: 'pendiente' | 'aceptado' | 'rechazado' | 'realizado' | 'cancelado';
    encuesta?: string;
    calificacion?: {
      puntaje:number,
      comentario:string,
      calificado:boolean
    };
    fechaTurno: Date;
    resenia?:string;
    historial?:{
      altura: number;
      peso: number;
      temperatura: number;
      presion: number;
      datosDinamicos: Array<{ clave: string, valor: any }>;
      comentario:string,
    }
  }
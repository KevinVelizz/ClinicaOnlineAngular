export interface Usuario {
    id:string;
    uid: string;
    nombre: string;
    apellido: string;
    edad: number;
    dni: number;
    correo: string;
    clave: string;
    tipo:string;
}

export enum Roles {
    PACIENTE = 'Paciente',
    ADMIN = 'Administrador',
    DOC = 'Especialista',
  }
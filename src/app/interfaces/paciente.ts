import { Usuario } from "./usuario";

export interface Paciente extends Usuario {
    obraSocial: string;
    imagen: {foto1:string, foto2:string};
}

import { Usuario } from "./usuario";



export interface Especialista extends Usuario {
    especialidad:any[];
    verificado: boolean;
    imagen: {foto1:string};
    disponibilidad: { [dia: string]: { desde: string, hasta: string }[] };
}

import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection, DocumentReference } from '@angular/fire/compat/firestore';
import { Observable } from 'rxjs';
import { Especialista } from '../interfaces/especialista';
import { Paciente } from '../interfaces/paciente';

@Injectable({
  providedIn: 'root'
})
export class FirestoreService {
  
  private especialistasCollection: AngularFirestoreCollection<Especialista>;
  especialistas: Observable<Especialista[]>;

  private pacientesCollection: AngularFirestoreCollection<Paciente>;
  pacientes: Observable<Paciente[]>;

  // private administradoresCollection: AngularFirestoreCollection<Administrador>;
  // administradores: Observable<Administrador[]>;
  
  constructor(private angularFirestore: AngularFirestore)
  {
    this.especialistasCollection = this.angularFirestore.collection<Especialista>('especialistas');
    this.especialistas = this.especialistasCollection.valueChanges({ idField: 'id' });

    this.pacientesCollection = this.angularFirestore.collection<Paciente>('pacientes');
    this.pacientes = this.pacientesCollection.valueChanges({ idField: 'id' });
  
    // this.administradoresCollection = this.angularFirestore.collection<Administrador>('administradores');
    // this.administradores = this.administradoresCollection.valueChanges({ idField: 'id' });

  }

  async agregarEntidad(tipo: Paciente | Especialista, collection:string) : Promise<DocumentReference<Paciente | Especialista>>
  {
    return this.angularFirestore.collection<Paciente | Especialista>(collection).add(tipo);
  }

  async actualizarEntidad(tipo: Paciente | Especialista, id: any, collection: string): Promise<void>
  {
    return this.angularFirestore.collection<Especialista | Paciente>(collection).doc(id).update(tipo);
  } 
}

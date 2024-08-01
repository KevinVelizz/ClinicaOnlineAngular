import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection, DocumentReference } from '@angular/fire/compat/firestore';
import { Observable, map } from 'rxjs';
import { Turno } from '../interfaces/turno';
import { Usuario } from '../interfaces/usuario';
import { collection, doc, setDoc } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root'
})
export class FirestoreService {

  private usuariosCollection: AngularFirestoreCollection<Usuario>;
  usuarios: Observable<(Usuario)[]>;

  constructor(private angularFirestore: AngularFirestore) {
    this.usuariosCollection = this.angularFirestore.collection<Usuario>('usuarios');
    this.usuarios = this.usuariosCollection.valueChanges({ idField: 'id' });
  }

  getTurnosByPaciente(pacienteId: string, tipo: string): Observable<Turno[]> {
    return this.angularFirestore.collection<Turno>('turnos', ref => ref.where(`${tipo.toLowerCase()}.uid`, '==', pacienteId)).valueChanges({ idField: 'id' });
  }

  getCollection(col: string): Observable<any[]> {
    return this.angularFirestore.collection(col).valueChanges({ idField: 'id' });
  }


  async agregarEntidad(tipo: Usuario, collection: string): Promise<DocumentReference<Usuario>> {
    return this.angularFirestore.collection<Usuario>(collection).add(tipo);
  }

  agregar(entidad: any, coleccion: any): Promise<DocumentReference<any>> {
    return this.angularFirestore.collection<Turno>(coleccion).add(entidad);
  }

  async actualizarEntidad(entidad: Usuario, id: any, collection: string): Promise<void> {
    return this.angularFirestore.collection<Usuario>(collection).doc(id).update(entidad);
  }

  async actualizarTurno(entidad: Turno, id: any): Promise<void> {
    return this.angularFirestore.collection<Usuario>('turnos').doc(id).update(entidad);
  }

  async agregarDocumentoLog(data: any) {
    return this.angularFirestore.collection('sesiones').add(data);
  }
}

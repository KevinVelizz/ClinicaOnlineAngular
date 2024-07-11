import { Injectable } from '@angular/core';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { Paciente } from '../interfaces/paciente';
import { Especialista } from '../interfaces/especialista';
import { FirebaseStorage, getDownloadURL, getStorage, ref, uploadBytes } from '@angular/fire/storage';
import { FirestoreService } from './firestore.service';
import { Administrador } from '../interfaces/administrador';
@Injectable({
  providedIn: 'root'
})
export class FirestorageService {

  constructor(private firestore: FirestoreService, private fireStorage: AngularFireStorage) { }

  async agregarEntidadConFoto(file: string, imagenes: any, entidad: Paciente | Especialista | Administrador | any) {

    if (imagenes) {
      console.log(Object.keys(imagenes).length);
      if (Object.keys(imagenes).length > 1) {
        const type = imagenes.fotoUno.type.split('/')[1];
        const path = file + '/' + entidad.nombre + Date.now() + '_1' + '.' + type;
        const storageRef: any = ref(this.fireStorage.storage, path);
        await uploadBytes(storageRef, imagenes.fotoUno);
        const url = await getDownloadURL(storageRef);

        const type2 = imagenes.fotoDos.type.split('/')[1];
        const path2 = file + '/' + entidad.nombre + Date.now() + '_2' + '.' + type2;
        const storageRef2: any = ref(this.fireStorage.storage, path2);
        await uploadBytes(storageRef2, imagenes.fotoDos);
        const url1 = await getDownloadURL(storageRef2);
        entidad.imagen = { foto1: url, foto2: url1 };
      }
      else
      {
        const type = imagenes.fotoUno.type.split('/')[1];
        const path = file + '/' + entidad.nombre + Date.now() + '.' + type;
        const storageRef: any = ref(this.fireStorage.storage, path);
        await uploadBytes(storageRef, imagenes.foto1);
        const url = await getDownloadURL(storageRef);
        entidad.imagen = url;
      }
      this.firestore.agregarEntidad(entidad, 'usuarios');
      return entidad;
    }
  }
}

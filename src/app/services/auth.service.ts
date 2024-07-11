import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import firebase from 'firebase/compat/app';
import { Paciente } from '../interfaces/paciente';
import { Administrador } from '../interfaces/administrador';
import { Especialista } from '../interfaces/especialista';
import { Usuario } from '../interfaces/usuario';
import { User, UserCredential, Auth, createUserWithEmailAndPassword, getAuth, sendEmailVerification, user, signInWithEmailAndPassword } from '@angular/fire/auth';
import { FirestoreService } from './firestore.service';
import { FirestorageService } from './firestorage.service';
import { initializeApp } from '@angular/fire/app';
import { Router } from '@angular/router';
@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private _userSub = new BehaviorSubject<User | null>(null);
  public user$ = this._userSub.asObservable();
  routerLogin = inject(Router);
  constructor(private authF: Auth, private firestorage: FirestorageService, private fire: FirestoreService) {
  }

  getUser<T extends User | Usuario>(usuario:string): T | undefined {
    const userStorage = sessionStorage.getItem(usuario) || '';
    if (userStorage) {
      return JSON.parse(userStorage) as T;
    }
    return undefined;
  }

  async loginUserFireBase(email: string, pass: string) {
    await signInWithEmailAndPassword(this.authF, email, pass).then((usu) => {

      if (!usu.user?.emailVerified) {
        console.log("verifique el correo.");
        return;
      }
      else {
        this.routerLogin.navigate(['/bienvenida']);
      }
      this.fire.usuarios.subscribe((usuarios) => {
        this.usuarioSesion = usuarios.filter(u => u.uid === usu.user?.uid)[0];
      })
    });
  }

  public set usuarioSesion(valor: Usuario | any) {
    if (valor) {
      sessionStorage.setItem('usuario', JSON.stringify(valor));
      let fireUser: User;
      const curreUser = this.authF.currentUser;
      if (curreUser) {
        fireUser = curreUser;
        sessionStorage.setItem('fireUser', JSON.stringify(fireUser));
      }
      else {
        fireUser = JSON.parse(sessionStorage.getItem('fireUser')!);
      }
    }
    else {
      sessionStorage.removeItem('usuario');
      sessionStorage.removeItem('fireUser');
      const curreUser = this.authF.currentUser;
      if (curreUser) {
        this.signOut();
      }
    }
    this._userSub.next(valor);
  }

  async registrar(usuario: Usuario, contr: string, foto: any): Promise<any> {
    try {
      const ssFireUser = sessionStorage.getItem('fireUser');
      const fireUserViejo: firebase.User | null = ssFireUser ? JSON.parse(ssFireUser) : null;

      const authInst: any = !fireUserViejo ? this.authF : getAuth(initializeApp({
        apiKey: "AIzaSyA_4Ej40-VVj8UQRH5rYKqYAdRIXxtgtH4",
        authDomain: "tpfinal-54230.firebaseapp.com",
        projectId: "tpfinal-54230",
        storageBucket: "tpfinal-54230.appspot.com",
        messagingSenderId: "601025109200",
        appId: "1:601025109200:web:a799ae2f2cc2296169d2d5"
      }, "Secondary"));
      return createUserWithEmailAndPassword(authInst, usuario.correo, contr).then(async (usu) => {
        usuario.uid = usu.user?.uid;
        await sendEmailVerification(usu.user);
        this.usuarioSesion = await this.firestorage.agregarEntidadConFoto(usuario.tipo, foto, usuario);
      }).catch(error => { console.log(error) });
    } catch (error: any) {
      throw error;
    }
  }

  async signOut() {
    this.usuarioSesion = null;
  }
}

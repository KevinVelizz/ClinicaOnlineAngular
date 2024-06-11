import { Injectable } from '@angular/core';
import {AngularFireAuth} from '@angular/fire/compat/auth';
import { Observable } from 'rxjs';
import firebase from 'firebase/compat/app'; 
@Injectable({
  providedIn: 'root'
})
export class AuthService {

  user$!: Observable<firebase.User | null>;
  constructor(private authF: AngularFireAuth) {
    this.user$ = this.authF.authState;
  }

  async loginUserFireBase(email:string, pass:string){
    return this.authF.signInWithEmailAndPassword(email, pass);
  }
    
  async registerFireBase(email:string, pass:string) {
    return await this.authF.createUserWithEmailAndPassword(email, pass);
  }
  
  async signOut()
  {
    return await this.authF.signOut();
  }
}

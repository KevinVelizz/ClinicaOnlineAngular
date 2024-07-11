import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
import { getStorage, provideStorage } from '@angular/fire/storage';
import {AngularFireModule} from '@angular/fire/compat';
import { RecaptchaModule } from 'ng-recaptcha';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { DatePipe } from '@angular/common';

export const appConfig: ApplicationConfig = {
  providers: [provideRouter(routes),DatePipe,importProvidersFrom(AngularFireModule.initializeApp({apiKey: "AIzaSyA_4Ej40-VVj8UQRH5rYKqYAdRIXxtgtH4",
    authDomain: "tpfinal-54230.firebaseapp.com",
    projectId: "tpfinal-54230",
    storageBucket: "tpfinal-54230.appspot.com",
    messagingSenderId: "601025109200",
    appId: "1:601025109200:web:a799ae2f2cc2296169d2d5"})), provideFirebaseApp(() => initializeApp({
      apiKey: "AIzaSyA_4Ej40-VVj8UQRH5rYKqYAdRIXxtgtH4",
      authDomain: "tpfinal-54230.firebaseapp.com",
      projectId: "tpfinal-54230",
      storageBucket: "tpfinal-54230.appspot.com",
      messagingSenderId: "601025109200",
      appId: "1:601025109200:web:a799ae2f2cc2296169d2d5"
    })),provideAuth(() => getAuth()), provideFirestore(() => getFirestore()), provideStorage(() => getStorage()), provideAnimationsAsync()]
};

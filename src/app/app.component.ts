import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from './components/navbar/navbar.component';
import { FirestoreService } from './services/firestore.service';
import { AuthService } from './services/auth.service';
import { FooterComponent } from './components/footer/footer.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent, FooterComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'tpfinal';
  usuario:any;

  constructor(private auth: AuthService){
   const userStorage = sessionStorage.getItem('usuario');
   this.auth.usuarioSesion = userStorage ? JSON.parse(userStorage) : null;
  }
}

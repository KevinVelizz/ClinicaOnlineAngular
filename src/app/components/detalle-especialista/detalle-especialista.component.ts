import { Component, Input } from '@angular/core';
import { Especialista } from '../../interfaces/especialista';
import { CommonModule } from '@angular/common';
import { FirestoreService } from '../../services/firestore.service';
import { LoaderComponent } from '../loader/loader.component';

@Component({
  selector: 'app-detalle-especialista',
  standalone: true,
  imports: [CommonModule, LoaderComponent],
  templateUrl: './detalle-especialista.component.html',
  styleUrl: './detalle-especialista.component.css'
})

export class DetalleEspecialistaComponent {
  @Input() especialista!: Especialista;
  isLoading: boolean = false;

  constructor(private firestore: FirestoreService) {

    setTimeout(() => {
      this.isLoading = false;
    }, 3000), this.isLoading = true;
  }

  actualizarEspecialista() {
    this.especialista.verificado = true;
    console.log(this.especialista);
    this.firestore.actualizarEntidad(this.especialista, this.especialista.id, 'usuarios');
  }
}

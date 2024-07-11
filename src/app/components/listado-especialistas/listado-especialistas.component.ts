import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FirestoreService } from '../../services/firestore.service';
import { Especialista } from '../../interfaces/especialista';
import { LoaderComponent } from '../loader/loader.component';

@Component({
  selector: 'app-listado-especialistas',
  standalone: true,
  imports: [LoaderComponent],
  templateUrl: './listado-especialistas.component.html',
  styleUrl: './listado-especialistas.component.css'
})
export class ListadoEspecialistasComponent {
  @Input() especialistas: Especialista[];
  @Output() especialistaSeleccionado = new EventEmitter<any>();
  isLoading:boolean = false;

  constructor(){
    this.especialistas = [];
  }
  
  especialistaSelect(click: any) {
    this.especialistas.forEach(e => {
      if(e.nombre == click.srcElement.innerText){
        this.especialistaSeleccionado.emit(e);
      }
    });
  }
}

import { animate, state, style, transition, trigger } from '@angular/animations';
import { Component } from '@angular/core';

const mostrarOcultar = trigger('mostrarOcultar', [
  state(
    'abierto',
    style({ opacity: 1 })
  ),
  state(
    'cerrado',
    style({ opacity: 0 })
  ),

  transition('* => cerrado', [animate('1s')]),
  transition('cerrado => *', [animate('0.5s')]),
]);

@Component({
  selector: 'app-animacion',
  standalone: true,
  imports: [],
  templateUrl: './animacion.component.html',
  styleUrl: './animacion.component.css',
  animations: [mostrarOcultar]
})
export class AnimacionComponent {


  mostrarContenido: boolean = false;

  mostrarOcultar() {
    this.mostrarContenido = !this.mostrarContenido;
  }

}

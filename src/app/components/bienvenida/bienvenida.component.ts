import { Component } from '@angular/core';
import { FooterComponent } from '../footer/footer.component';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { animate, state, style, transition, trigger } from '@angular/animations';

const animacion = [trigger('slideInLeft', [
  state('void', style({
    transform: 'translateX(-1000px)',
    opacity: 0
  })),
  state('*', style({
    transform: 'translateX(0)',
    opacity: 1
  })),
  transition('void => *', [
    animate('1s cubic-bezier(0.250, 0.460, 0.450, 0.940)')
  ])
])]

@Component({
  selector: 'app-bienvenida',
  standalone: true,
  imports: [FooterComponent, CommonModule, RouterLink],
  templateUrl: './bienvenida.component.html',
  styleUrl: './bienvenida.component.css',
  animations: [animacion]
})
export class BienvenidaComponent {

}

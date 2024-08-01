import { Directive, ElementRef, Input, OnChanges, Renderer2, SimpleChanges } from '@angular/core';

@Directive({
  selector: '[appCambiarColor]',
  standalone: true
})
export class CambiarColorDirective implements OnChanges {

  @Input() estado: string = '';

  constructor(private element: ElementRef, private renderer: Renderer2) { }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['estado']) {
      this.cambiarColor();
    }
  }

  private cambiarColor() {
    let color = '';
    switch (this.estado) {
      case 'aceptado':
        color = 'green';
        break;
      case 'cancelado':
        color = 'red';
        break;
      case 'realizado':
        color = 'blue';
        break;
      case 'rechazado':
        color = 'orange';
        break;
      default:
        color = 'black';
        break;
    }
    this.renderer.setStyle(this.element.nativeElement, 'color', color);
  }
}

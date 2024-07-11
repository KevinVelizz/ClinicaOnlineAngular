import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'dias',
  standalone: true
})
export class DiasPipe implements PipeTransform {

  transform(value: any): number {
    let dia: string = value.toString();
    switch (dia) {
      case 'Lunes':
        return 1;
      case 'Martes':
        return 2;
      case 'Miércoles':
        return 3;
      case 'Jueves':
        return 4;
      case 'Viernes':
        return 5;
      case 'Sábado':
        return 6;
      case 'Domingo':
        return 0;
      default:
        return value;
    }
  }
}

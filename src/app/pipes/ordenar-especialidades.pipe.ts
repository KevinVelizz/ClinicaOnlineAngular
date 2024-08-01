import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'ordenarEspecialidades',
  standalone: true
})
export class OrdenarEspecialidadesPipe implements PipeTransform {

  transform(especialidades: any[]): any[] {
    if (!especialidades || especialidades.length === 0) {
      return especialidades;
    }
    return especialidades.sort((a, b) => a.nombre.localeCompare(b.nombre));
  }
}

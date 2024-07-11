import { Component } from '@angular/core';
import { FooterComponent } from '../footer/footer.component';
import { NavbarComponent } from '../navbar/navbar.component';
import { FormBuilder, FormGroup, FormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Usuario } from '../../interfaces/usuario';
import { CommonModule } from '@angular/common';
import { Especialista } from '../../interfaces/especialista';
import { Paciente } from '../../interfaces/paciente';
import { Administrador } from '../../interfaces/administrador';
import { FirestoreService } from '../../services/firestore.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-mi-perfil',
  standalone: true,
  imports: [NavbarComponent, FooterComponent, CommonModule, FormsModule],
  templateUrl: './mi-perfil.component.html',
  styleUrl: './mi-perfil.component.css'
})
export class MiPerfilComponent {

  user: Usuario | any;
  isEspecialista: boolean = false;
  horariosForm: FormGroup;
  especialidades: string[] = [];
  imagenes: any[] = [];
  horarios: { [dia: string]: { desde: string, hasta: string }[] } = {};
  horas: { [dia: string]: string[] } = {
    'Lunes': this.generarHoras('Lunes'),
    'Martes': this.generarHoras('Martes'),
    'Miércoles': this.generarHoras('Miércoles'),
    'Jueves': this.generarHoras('Jueves'),
    'Viernes': this.generarHoras('Viernes'),
    'Sábado': this.generarHoras('Sábado')
  };
  constructor(
    private authService: AuthService,
    private fb: FormBuilder,
    private firestore: FirestoreService,
    private snackBar: MatSnackBar
  ) {
    this.horariosForm = this.fb.group({
      especialidad: ['', Validators.required],
      horario: ['', Validators.required]
    });
    this.user = this.authService.getUser('usuario');

    this.imagenes.push(this.user.imagen);
  }


  getHorasInicioDisponibles(dia: string, index: number): string[] {
    const horariosDia = this.horarios[dia];
    return this.horas[dia].filter(hora => {
      const horarioActual = horariosDia[index];
      return !horarioActual.hasta || hora < horarioActual.hasta;
    });
  }

  getHorasFinDisponibles(dia: string, index: number): string[] {
    const horariosDia = this.horarios[dia];
    return this.horas[dia].filter(hora => {
      const horarioActual = horariosDia[index];
      return !horarioActual.desde || hora > horarioActual.desde;
    });
  }

  agregarHorario(dia: string) {
    if (!this.horarios[dia]) {
      this.horarios[dia] = [];
    }
    if (this.horarios[dia].length === 0) {

      this.horarios[dia].push({ desde: '', hasta: '' });
    }
  }

  guardarDisponibilidad() {
    if (this.user.tipo) {
      this.user.disponibilidad = this.horarios;
      this.firestore.actualizarEntidad(this.user, this.user.id, 'usuarios')
        .then(() => {
          this.snackBar.open(`Guardado Correctamente.`, 'Close', {
            duration: 2000
          });
        })
        .catch(error => console.error('Error al guardar disponibilidad:', error));
    }
  }

  generarHoras(dia: string): string[] {
    const horas: string[] = [];
    let inicio = (dia === 'Sábado') ? 8 : 8;
    let fin = (dia === 'Sábado') ? 14 : 19;
    for (let i = inicio; i <= fin; i++) {
      horas.push(i.toString().padStart(2, '0') + ':00');
      horas.push(i.toString().padStart(2, '0') + ':30');
    }
    return horas;
  }

  logout() {

  }

}

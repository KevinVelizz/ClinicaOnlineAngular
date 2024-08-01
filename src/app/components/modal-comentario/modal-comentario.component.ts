import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, FormBuilder, Validators, FormArray, FormGroupDirective } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { Turno } from '../../interfaces/turno';
import { M } from '@angular/cdk/keycodes';
@Component({
  selector: 'app-modal-comentario',
  standalone: true,
  imports: [
    MatDialogModule,
    MatButtonModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatInputModule,
    MatFormFieldModule,
    ReactiveFormsModule,
  ],
  templateUrl: './modal-comentario.component.html',
  styleUrl: './modal-comentario.component.css'
})
export class ModalComentarioComponent {
  @Input() turno: Turno | undefined;
  @Output() historialCompletado: EventEmitter<Turno> = new EventEmitter<Turno>();

  historialForm!: FormGroup;

  constructor(private fb: FormBuilder) { }

  ngOnInit() {
    this.historialForm = this.fb.group({
      altura: ['', [Validators.required, Validators.min(40), Validators.max(220)]],
      peso: ['', [Validators.required, Validators.min(2), Validators.max(300)]],
      temperatura: ['', [Validators.required, Validators.min(35), Validators.max(45)]],
      presion: ['', [Validators.required, Validators.min(40), Validators.max(200)]],
      comentario: [''],
      datosDinamicos: this.fb.array([]),
      rango: [0, [Validators.required, Validators.min(0), Validators.max(100)]],
      claveRango: ['', Validators.required],
      numCuadro: [0, [Validators.required]],
      claveNumerico: ['', Validators.required],
      switchControl: [false],
      claveSwitch: ['', Validators.required]
    });
  }

  get datosDinamicos() {
    return this.historialForm!.get('datosDinamicos') as FormArray;
  }

  agregarDatosDinamico() {
    if (this.datosDinamicos.length < 3) {
      this.datosDinamicos.push(this.fb.group({
        clave: [''],
        valor: ['']
      }));
    }
  }

  formatearDatosDinamicos(datos: Array<{ clave: string, valor: any }>): string {
    return datos.map(dato => `${dato.clave} = ${dato.valor}`).join(' - ');
  }

  eliminarDatosDinamico(index: number) {
    this.datosDinamicos.removeAt(index);
  }

  enviarEncuesta() {
    if (this.historialForm!.valid && this.turno) {
      const valoresAdicionales = [
        { clave: this.historialForm.value.claveRango, valor: this.historialForm.value.rango },
        { clave: this.historialForm.value.claveNumerico, valor: this.historialForm.value.numCuadro },
        { clave: this.historialForm.value.claveSwitch, valor: this.historialForm.value.switchControl }
      ];

      this.turno.historial = {
        ...this.historialForm!.value,
        datosDinamicos: [
          ...this.historialForm!.value.datosDinamicos,
          ...valoresAdicionales
        ]
      };
      this.historialCompletado.emit(this.turno);
    }
  }
}

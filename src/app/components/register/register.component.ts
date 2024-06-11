import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, CommonModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent {
  form!: any | FormGroup;  
  registrarPaciente!:boolean;
  registrarEspecialista!:boolean;

  constructor(private router: Router, private fb: FormBuilder, private AuthService: AuthService) {
    this.form = this.fb.group({
      nombre: ['',Validators.required],
      apellido: ['',Validators.required],
      edad: ['',Validators.required],
      dni: ['',Validators.required],
      obraSocial: ['',Validators.required],
      correo: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });

    this.registrarPaciente = false;
    this.registrarEspecialista = false;
  }

  onToggle(event: any) {
    if (event.target.checked) {
      this.router.navigate(['/login']);
    } 
  }

  async singUp() {
    console.log(this.form.controls.password.value);
    if (this.form.valid) {
      try {
        const user = await this.AuthService.registerFireBase(this.form.controls.correo.value, this.form.controls.password.value);
        if (user) {
          this.router.navigate(['/bienvenida']);
        }
      } catch (error) {
        console.log(error);
      }
    }
  }
}

import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-splash-art',
  standalone: true,
  imports: [],
  templateUrl: './splash-art.component.html',
  styleUrl: './splash-art.component.css'
})

export class SplashArtComponent {
  router_service = inject(Router);

  constructor() {
    setTimeout(() => {
      this.router_service.navigate(['/login'])
    }, 3500);
  }
}

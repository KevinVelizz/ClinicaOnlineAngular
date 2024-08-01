import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { CaptchaDirective } from '../../directivas/captcha.directive';

@Component({
  selector: 'app-captcha-propio',
  standalone: true,
  imports: [CommonModule, CaptchaDirective],
  templateUrl: './captcha-propio.component.html',
  styleUrl: './captcha-propio.component.css'
})

export class CaptchaPropioComponent {
  captchaSolved: boolean = false;

  onCaptchaSolved(isSolved: boolean) {
    this.captchaSolved = isSolved;
  }
}

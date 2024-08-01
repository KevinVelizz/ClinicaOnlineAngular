import {  Directive, ElementRef, Renderer2, HostListener, Output, EventEmitter } from '@angular/core';

@Directive({
  selector: '[appCaptcha]',
  standalone: true
})
export class CaptchaDirective {

  @Output() captchaSolved = new EventEmitter<boolean>();

  constructor() {}

  @HostListener('change', ['$event.target'])
  onCheckboxChange(target: HTMLInputElement) {
    this.captchaSolved.emit(target.checked);
  }
}

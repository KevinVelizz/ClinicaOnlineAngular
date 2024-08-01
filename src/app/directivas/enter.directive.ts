import { Directive, ElementRef, HostListener } from '@angular/core';

@Directive({
  selector: '[appEnter]',
  standalone: true
})
export class EnterDirective {

  constructor(private element: ElementRef) {}

  @HostListener('document:keydown', ['$event']) onKeydownHandler(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      const button = this.element.nativeElement.querySelector('button[type="submit"]');
      if (button && !button.disabled) {
        button.click();
      }
    }
  }
}

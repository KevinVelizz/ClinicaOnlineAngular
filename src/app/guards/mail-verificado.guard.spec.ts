import { TestBed } from '@angular/core/testing';
import { CanDeactivateFn } from '@angular/router';

import { mailVerificadoGuard } from './mail-verificado.guard';

describe('mailVerificadoGuard', () => {
  const executeGuard: CanDeactivateFn = (...guardParameters) => 
      TestBed.runInInjectionContext(() => mailVerificadoGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});

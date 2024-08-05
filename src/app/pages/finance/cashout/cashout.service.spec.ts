/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { CashoutService } from './cashout.service';

describe('Service: Cashout', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [CashoutService],
    });
  });

  it('should ...', inject([CashoutService], (service: CashoutService) => {
    expect(service).toBeTruthy();
  }));
});

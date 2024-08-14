/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { BsdService } from './bsd.service';

describe('Service: Bsd', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [BsdService],
    });
  });

  it('should ...', inject([BsdService], (service: BsdService) => {
    expect(service).toBeTruthy();
  }));
});

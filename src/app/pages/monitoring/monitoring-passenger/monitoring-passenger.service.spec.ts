/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { MonitoringPassengerService } from './monitoring-passenger.service';

describe('Service: MonitoringPassenger', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [MonitoringPassengerService],
    });
  });

  it('should ...', inject([MonitoringPassengerService], (service: MonitoringPassengerService) => {
    expect(service).toBeTruthy();
  }));
});

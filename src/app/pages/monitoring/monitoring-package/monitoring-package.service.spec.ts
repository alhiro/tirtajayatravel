/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { MonitoringPackageService } from './monitoring-package.service';

describe('Service: MonitoringPackage', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [MonitoringPackageService],
    });
  });

  it('should ...', inject([MonitoringPackageService], (service: MonitoringPackageService) => {
    expect(service).toBeTruthy();
  }));
});

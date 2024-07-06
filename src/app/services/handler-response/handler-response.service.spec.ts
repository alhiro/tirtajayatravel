import { TestBed } from '@angular/core/testing';

import { HandlerResponseService } from './handler-response.service';

describe('HandlerResponseService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: HandlerResponseService = TestBed.get(HandlerResponseService);
    expect(service).toBeTruthy();
  });
});

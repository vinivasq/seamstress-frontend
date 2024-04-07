/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { SalePlatformService } from './salePlatform.service';

describe('Service: SalePlatform', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [SalePlatformService]
    });
  });

  it('should ...', inject([SalePlatformService], (service: SalePlatformService) => {
    expect(service).toBeTruthy();
  }));
});

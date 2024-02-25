/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { IBGEService } from './IBGE.service';

describe('Service: IBGE', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [IBGEService]
    });
  });

  it('should ...', inject([IBGEService], (service: IBGEService) => {
    expect(service).toBeTruthy();
  }));
});

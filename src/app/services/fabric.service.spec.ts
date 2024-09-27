/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { FabricService } from './fabric.service';

describe('Service: Fabric', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [FabricService]
    });
  });

  it('should ...', inject([FabricService], (service: FabricService) => {
    expect(service).toBeTruthy();
  }));
});

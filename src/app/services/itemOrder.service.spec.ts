/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { ItemOrderService } from './itemOrder.service';

describe('Service: ItemOrder', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ItemOrderService]
    });
  });

  it('should ...', inject([ItemOrderService], (service: ItemOrderService) => {
    expect(service).toBeTruthy();
  }));
});

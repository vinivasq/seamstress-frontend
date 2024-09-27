import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ItemFormComponent } from './itemForm.component';

describe('ItemFormComponent', () => {
  let component: ItemFormComponent;
  let fixture: ComponentFixture<ItemFormComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ItemFormComponent],
    });
    fixture = TestBed.createComponent(ItemFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

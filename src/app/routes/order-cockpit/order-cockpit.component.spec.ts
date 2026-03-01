import { ComponentFixture, TestBed } from '@angular/core/testing';
import { OrderCockpitComponent } from './order-cockpit.component';

describe('OrderCockpitComponent', () => {
  let component: OrderCockpitComponent;
  let fixture: ComponentFixture<OrderCockpitComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [OrderCockpitComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(OrderCockpitComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

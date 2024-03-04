import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChartPeriodComponent } from './chart-period.component';

describe('ChartPeriodComponent', () => {
  let component: ChartPeriodComponent;
  let fixture: ComponentFixture<ChartPeriodComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ChartPeriodComponent]
    });
    fixture = TestBed.createComponent(ChartPeriodComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

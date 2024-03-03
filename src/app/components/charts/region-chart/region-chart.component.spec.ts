import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegionChartComponent } from './region-chart.component';

describe('RegionChartComponent', () => {
  let component: RegionChartComponent;
  let fixture: ComponentFixture<RegionChartComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [RegionChartComponent]
    });
    fixture = TestBed.createComponent(RegionChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

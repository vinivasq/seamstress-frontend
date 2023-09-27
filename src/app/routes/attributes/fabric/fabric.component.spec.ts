/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { FabricComponent } from './fabric.component';

describe('FabricComponent', () => {
  let component: FabricComponent;
  let fixture: ComponentFixture<FabricComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FabricComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FabricComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

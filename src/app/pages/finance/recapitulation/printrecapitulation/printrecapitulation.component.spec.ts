/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { PrintrecapitulationComponent } from './printrecapitulation.component';

describe('PrintrecapitulationComponent', () => {
  let component: PrintrecapitulationComponent;
  let fixture: ComponentFixture<PrintrecapitulationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [PrintrecapitulationComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PrintrecapitulationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

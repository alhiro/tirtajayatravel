/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { PrintPassengerComponent } from './printPassenger.component';

describe('PrintPassengerComponent', () => {
  let component: PrintPassengerComponent;
  let fixture: ComponentFixture<PrintPassengerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [PrintPassengerComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PrintPassengerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

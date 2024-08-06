/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { CommissionComponent } from './commission.component';

describe('CommissionComponent', () => {
  let component: CommissionComponent;
  let fixture: ComponentFixture<CommissionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [CommissionComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CommissionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

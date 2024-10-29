/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { PrintcommissionComponent } from './printcommission.component';

describe('PrintcommissionComponent', () => {
  let component: PrintcommissionComponent;
  let fixture: ComponentFixture<PrintcommissionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [PrintcommissionComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PrintcommissionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

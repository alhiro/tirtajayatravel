/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { PrintcashoutComponent } from './printcashout.component';

describe('PrintcashoutComponent', () => {
  let component: PrintcashoutComponent;
  let fixture: ComponentFixture<PrintcashoutComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [PrintcashoutComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PrintcashoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

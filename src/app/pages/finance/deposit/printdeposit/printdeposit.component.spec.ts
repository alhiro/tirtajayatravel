/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { PrintdepositComponent } from './printdeposit.component';

describe('PrintdepositComponent', () => {
  let component: PrintdepositComponent;
  let fixture: ComponentFixture<PrintdepositComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [PrintdepositComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PrintdepositComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

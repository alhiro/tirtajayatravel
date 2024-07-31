/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { PrintspComponent } from './printbsd.component';

describe('PrintspComponent', () => {
  let component: PrintspComponent;
  let fixture: ComponentFixture<PrintspComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [PrintspComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PrintspComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

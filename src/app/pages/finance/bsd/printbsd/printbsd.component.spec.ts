/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { PrintbsdComponent } from './printbsd.component';

describe('PrintspComponent', () => {
  let component: PrintbsdComponent;
  let fixture: ComponentFixture<PrintbsdComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [PrintbsdComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PrintbsdComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

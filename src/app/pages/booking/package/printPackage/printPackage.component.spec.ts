/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { PrintPackageComponent } from './printPackage.component';

describe('PrintPackageComponent', () => {
  let component: PrintPackageComponent;
  let fixture: ComponentFixture<PrintPackageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [PrintPackageComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PrintPackageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

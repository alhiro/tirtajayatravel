/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { CashoutComponent } from './cashout.component';

describe('CashoutComponent', () => {
  let component: CashoutComponent;
  let fixture: ComponentFixture<CashoutComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [CashoutComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CashoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

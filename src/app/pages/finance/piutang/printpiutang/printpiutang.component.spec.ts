/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { PrintpiutangComponent } from './printpiutang.component';

describe('PrintpiutangComponent', () => {
  let component: PrintpiutangComponent;
  let fixture: ComponentFixture<PrintpiutangComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [PrintpiutangComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PrintpiutangComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

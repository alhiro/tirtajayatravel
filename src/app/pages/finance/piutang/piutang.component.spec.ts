/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { PiutangComponent } from './piutang.component';

describe('PiutangComponent', () => {
  let component: PiutangComponent;
  let fixture: ComponentFixture<PiutangComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [PiutangComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PiutangComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

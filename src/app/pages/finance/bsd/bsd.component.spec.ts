/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { BsdComponent } from './bsd.component';

describe('BsdComponent', () => {
  let component: BsdComponent;
  let fixture: ComponentFixture<BsdComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [BsdComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BsdComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

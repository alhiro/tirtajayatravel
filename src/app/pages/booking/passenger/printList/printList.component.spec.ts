/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { PrintListComponent } from './printList.component';

describe('PrintListComponent', () => {
  let component: PrintListComponent;
  let fixture: ComponentFixture<PrintListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [PrintListComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PrintListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

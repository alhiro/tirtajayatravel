/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { RecapitulationComponent } from './recapitulation.component';

describe('RecapitulationComponent', () => {
  let component: RecapitulationComponent;
  let fixture: ComponentFixture<RecapitulationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [RecapitulationComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RecapitulationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { VotelistComponent } from './votelist.component';

describe('PlaylistComponent', () => {
  let component: VotelistComponent;
  let fixture: ComponentFixture<VotelistComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ VotelistComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VotelistComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

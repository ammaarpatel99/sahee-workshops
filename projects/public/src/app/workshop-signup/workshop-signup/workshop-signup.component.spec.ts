import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkshopSignupComponent } from './workshop-signup.component';

describe('WorkshopSignupComponent', () => {
  let component: WorkshopSignupComponent;
  let fixture: ComponentFixture<WorkshopSignupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WorkshopSignupComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(WorkshopSignupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

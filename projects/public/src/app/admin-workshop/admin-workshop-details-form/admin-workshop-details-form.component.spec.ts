import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminWorkshopDetailsFormComponent } from './admin-workshop-details-form.component';

describe('AdminWorkshopDetailsFormComponent', () => {
  let component: AdminWorkshopDetailsFormComponent;
  let fixture: ComponentFixture<AdminWorkshopDetailsFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AdminWorkshopDetailsFormComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AdminWorkshopDetailsFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

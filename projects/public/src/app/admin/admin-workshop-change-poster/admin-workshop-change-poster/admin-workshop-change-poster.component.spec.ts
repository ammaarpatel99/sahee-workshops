import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminWorkshopChangePosterComponent } from './admin-workshop-change-poster.component';

describe('AdminWorkshopChangePosterComponent', () => {
  let component: AdminWorkshopChangePosterComponent;
  let fixture: ComponentFixture<AdminWorkshopChangePosterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AdminWorkshopChangePosterComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AdminWorkshopChangePosterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

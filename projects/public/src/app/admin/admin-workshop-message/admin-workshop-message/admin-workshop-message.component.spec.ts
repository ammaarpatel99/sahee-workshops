import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminWorkshopMessageComponent } from './admin-workshop-message.component';

describe('AdminWorkshopMessageComponent', () => {
  let component: AdminWorkshopMessageComponent;
  let fixture: ComponentFixture<AdminWorkshopMessageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AdminWorkshopMessageComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AdminWorkshopMessageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

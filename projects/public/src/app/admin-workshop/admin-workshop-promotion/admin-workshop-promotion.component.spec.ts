import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminWorkshopPromotionComponent } from './admin-workshop-promotion.component';

describe('AdminWorkshopPromotionComponent', () => {
  let component: AdminWorkshopPromotionComponent;
  let fixture: ComponentFixture<AdminWorkshopPromotionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AdminWorkshopPromotionComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AdminWorkshopPromotionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

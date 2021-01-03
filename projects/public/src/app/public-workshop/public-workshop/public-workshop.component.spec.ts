import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PublicWorkshopComponent } from './public-workshop.component';

describe('PublicWorkshopComponent', () => {
  let component: PublicWorkshopComponent;
  let fixture: ComponentFixture<PublicWorkshopComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PublicWorkshopComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PublicWorkshopComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

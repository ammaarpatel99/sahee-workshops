import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkshopsDashboardComponent } from './workshops-dashboard.component';

describe('WorkshopsDashboardComponent', () => {
  let component: WorkshopsDashboardComponent;
  let fixture: ComponentFixture<WorkshopsDashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WorkshopsDashboardComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(WorkshopsDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { TestBed } from '@angular/core/testing';

import { WorkshopDashboardResolver } from './workshop-dashboard.resolver';

describe('WorkshopDashboardResolver', () => {
  let resolver: WorkshopDashboardResolver;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    resolver = TestBed.inject(WorkshopDashboardResolver);
  });

  it('should be created', () => {
    expect(resolver).toBeTruthy();
  });
});

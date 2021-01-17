import { TestBed } from '@angular/core/testing';

import { LatestWorkshopGuard } from './latest-workshop.guard';

describe('LatestWorkshopGuard', () => {
  let guard: LatestWorkshopGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    guard = TestBed.inject(LatestWorkshopGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });
});

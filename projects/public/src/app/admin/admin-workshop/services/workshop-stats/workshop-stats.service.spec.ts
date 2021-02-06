import { TestBed } from '@angular/core/testing';

import { WorkshopStatsService } from './workshop-stats.service';

describe('WorkshopStatsService', () => {
  let service: WorkshopStatsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(WorkshopStatsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

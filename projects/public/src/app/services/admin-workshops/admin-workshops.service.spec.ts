import { TestBed } from '@angular/core/testing';

import { AdminWorkshopsService } from './admin-workshops.service';

describe('AdminWorkshopsService', () => {
  let service: AdminWorkshopsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AdminWorkshopsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

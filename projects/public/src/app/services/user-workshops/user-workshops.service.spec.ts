import { TestBed } from '@angular/core/testing';

import { UserWorkshopsService } from './user-workshops.service';

describe('UserWorkshopsService', () => {
  let service: UserWorkshopsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UserWorkshopsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

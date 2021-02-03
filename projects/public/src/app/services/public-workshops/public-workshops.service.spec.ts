import { TestBed } from '@angular/core/testing';

import { PublicWorkshopsService } from './public-workshops.service';

describe('PublicWorkshopsService', () => {
  let service: PublicWorkshopsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PublicWorkshopsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

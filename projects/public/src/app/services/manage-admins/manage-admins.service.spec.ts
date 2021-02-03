import { TestBed } from '@angular/core/testing';

import { ManageAdminsService } from './manage-admins.service';

describe('ManageAdminsService', () => {
  let service: ManageAdminsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ManageAdminsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

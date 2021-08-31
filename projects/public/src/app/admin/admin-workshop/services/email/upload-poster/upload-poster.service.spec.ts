import { TestBed } from '@angular/core/testing';

import { UploadPosterService } from './upload-poster.service';

describe('UploadPosterService', () => {
  let service: UploadPosterService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UploadPosterService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

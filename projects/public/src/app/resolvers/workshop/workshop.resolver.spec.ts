import { TestBed } from '@angular/core/testing';

import { WorkshopResolver } from './workshop.resolver';

describe('WorkshopResolver', () => {
  let resolver: WorkshopResolver;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    resolver = TestBed.inject(WorkshopResolver);
  });

  it('should be created', () => {
    expect(resolver).toBeTruthy();
  });
});

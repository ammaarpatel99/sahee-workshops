import { TestBed } from '@angular/core/testing';

import { AdminWorkshopResolver } from './admin-workshop.resolver';

describe('AdminWorkshopResolver', () => {
  let resolver: AdminWorkshopResolver;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    resolver = TestBed.inject(AdminWorkshopResolver);
  });

  it('should be created', () => {
    expect(resolver).toBeTruthy();
  });
});

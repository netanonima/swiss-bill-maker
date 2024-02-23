import { TestBed } from '@angular/core/testing';

import { SwissBillApiRestService } from './swiss-bill-api-rest.service';

describe('SwissBillApiRestService', () => {
  let service: SwissBillApiRestService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SwissBillApiRestService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

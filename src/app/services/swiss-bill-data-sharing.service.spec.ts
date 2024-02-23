import { TestBed } from '@angular/core/testing';

import { SwissBillDataSharingService } from './swiss-bill-data-sharing.service';

describe('SwissBillDataSharingService', () => {
  let service: SwissBillDataSharingService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SwissBillDataSharingService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

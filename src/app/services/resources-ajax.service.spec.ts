import { TestBed } from '@angular/core/testing';

import { ResourceAjaxService } from './resources-ajax.service';

describe('ResourcesAjaxService', () => {
  let service: ResourceAjaxService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ResourceAjaxService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

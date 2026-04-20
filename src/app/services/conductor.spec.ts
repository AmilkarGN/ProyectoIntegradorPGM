import { TestBed } from '@angular/core/testing';

import { Conductor } from './conductor';

describe('Conductor', () => {
  let service: Conductor;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Conductor);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

import { TestBed } from '@angular/core/testing';

import { ViajesService } from './viajes';
describe('Viajes', () => {
  let service: ViajesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ViajesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

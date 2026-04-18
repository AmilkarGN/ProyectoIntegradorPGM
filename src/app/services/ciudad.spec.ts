import { TestBed } from '@angular/core/testing';

import { Ciudad } from './ciudad';
import { Ciudades } from '../pages/ciudades/ciudades';

describe('Ciudad', () => {
  let service: Ciudad;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Ciudades);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Ciudad } from './ciudades';

describe('Ciudades', () => {
  let component: Ciudades;
  let fixture: ComponentFixture<Ciudades>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Ciudades],
    }).compileComponents();

    fixture = TestBed.createComponent(Ciudades);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MapaVivo } from './mapa-vivo';

describe('MapaVivo', () => {
  let component: MapaVivo;
  let fixture: ComponentFixture<MapaVivo>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MapaVivo],
    }).compileComponents();

    fixture = TestBed.createComponent(MapaVivo);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

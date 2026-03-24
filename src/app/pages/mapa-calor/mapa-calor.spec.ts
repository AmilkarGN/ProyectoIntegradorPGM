import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MapaCalor } from './mapa-calor';

describe('MapaCalor', () => {
  let component: MapaCalor;
  let fixture: ComponentFixture<MapaCalor>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MapaCalor],
    }).compileComponents();

    fixture = TestBed.createComponent(MapaCalor);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VisorCarga } from './visor-carga';

describe('VisorCarga', () => {
  let component: VisorCarga;
  let fixture: ComponentFixture<VisorCarga>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VisorCarga],
    }).compileComponents();

    fixture = TestBed.createComponent(VisorCarga);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CategoriasLicencia } from './categorias-licencia';

describe('CategoriasLicencia', () => {
  let component: CategoriasLicencia;
  let fixture: ComponentFixture<CategoriasLicencia>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CategoriasLicencia],
    }).compileComponents();

    fixture = TestBed.createComponent(CategoriasLicencia);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

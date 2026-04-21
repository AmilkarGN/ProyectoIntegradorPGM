import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfigFlota } from './config-flota';

describe('ConfigFlota', () => {
  let component: ConfigFlota;
  let fixture: ComponentFixture<ConfigFlota>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConfigFlota],
    }).compileComponents();

    fixture = TestBed.createComponent(ConfigFlota);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

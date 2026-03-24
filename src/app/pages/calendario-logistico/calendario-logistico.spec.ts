import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CalendarioLogistico } from './calendario-logistico';

describe('CalendarioLogistico', () => {
  let component: CalendarioLogistico;
  let fixture: ComponentFixture<CalendarioLogistico>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CalendarioLogistico],
    }).compileComponents();

    fixture = TestBed.createComponent(CalendarioLogistico);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

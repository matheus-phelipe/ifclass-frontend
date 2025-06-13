import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Gerenciarusuarios } from './gerenciarusuarios';

describe('Gerenciarusuarios', () => {
  let component: Gerenciarusuarios;
  let fixture: ComponentFixture<Gerenciarusuarios>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Gerenciarusuarios]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Gerenciarusuarios);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

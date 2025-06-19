import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GerenciadorSalas } from './gerenciador-salas';

describe('GerenciadorSalas', () => {
  let component: GerenciadorSalas;
  let fixture: ComponentFixture<GerenciadorSalas>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GerenciadorSalas]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GerenciadorSalas);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

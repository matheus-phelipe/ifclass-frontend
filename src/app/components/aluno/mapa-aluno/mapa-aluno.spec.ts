import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MapaAluno } from './mapa-aluno';

describe('MapaAluno', () => {
  let component: MapaAluno;
  let fixture: ComponentFixture<MapaAluno>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MapaAluno]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MapaAluno);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

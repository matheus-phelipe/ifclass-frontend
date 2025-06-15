import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Curso } from './curso';

describe('Curso', () => {
  let component: Curso;
  let fixture: ComponentFixture<Curso>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Curso]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Curso);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Gerenciarpermissoes } from './gerenciarpermissoes';

describe('Gerenciarpermissoes', () => {
  let component: Gerenciarpermissoes;
  let fixture: ComponentFixture<Gerenciarpermissoes>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Gerenciarpermissoes]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Gerenciarpermissoes);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

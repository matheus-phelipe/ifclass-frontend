import { Disciplina } from '../disciplinas/disciplina.model';

export interface Usuario {
  id: number;
  nome: string;
  email: string;
  prontuario: string;
  authorities: string[];
  disciplinas?: Disciplina[];
  turma?: TurmaResumo;
}

export interface TurmaResumo {
  id: number;
  ano: number;
  semestre: number;
  curso?: CursoResumo;
}

export interface CursoResumo {
  id: number;
  nome: string;
  codigo: string;
}
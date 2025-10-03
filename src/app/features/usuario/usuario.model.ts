import { Disciplina } from '../disciplinas/disciplina.model';

export interface Usuario {
  id: number;
  nome: string;
  email: string;
  senha?: string;
  prontuario: string;
  authorities: string[];
  disciplinas?: Disciplina[];
  turma?: TurmaResumo;
}

export interface UsuarioCreate {
  nome: string;
  email: string;
  senha: string;
  prontuario: string;
  authorities: string[];
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

export interface RowError {
  row: number;
  message: string;
}

export interface BatchExcelResult {
  createdCount: number;
  errors: RowError[];
}
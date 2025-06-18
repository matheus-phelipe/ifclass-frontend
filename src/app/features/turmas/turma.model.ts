export interface Turma {
  id?: number;
  curso?: {
    id: number;
    nome: string;
  };
  cursoId?: number;
  ano: number;
  semestre: number;
} 
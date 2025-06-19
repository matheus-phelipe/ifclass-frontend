export interface Disciplina {
  id?: number;
  nome: string;
  codigo: string;
  cargaHoraria: number;
  departamento: string;
  descricao: string;
  curso?: {
    id: number;
    nome: string;
  };
  cursoId?: number;
} 
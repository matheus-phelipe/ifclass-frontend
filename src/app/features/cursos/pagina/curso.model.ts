export interface Curso {
  id: number;
  nome: string;
  codigo: string;
  cargaHoraria: number;
  departamento: string;
  descricao: string; 
}

// Para o formulário de criação/edição
export interface NovoCursoDTO {
  nome: string;
  codigo: string;
  cargaHoraria: number;
  departamento: string;
  descricao: string; 
}
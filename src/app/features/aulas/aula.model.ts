import { Sala } from '../aluno/sala.model';
import { Turma } from '../turmas/turma.model';
import { Disciplina } from '../disciplinas/disciplina.model';
import { Usuario } from '../usuario/usuario.model';

export interface Aula {
  id?: number;
  sala: Sala;
  turma: Turma;
  disciplina: Disciplina;
  professor: Usuario;
  data: string; // yyyy-MM-dd
  hora: string; // HH:mm
  horaInicio?: string; // HH:mm, opcional
  horaFim?: string;    // HH:mm, opcional
} 
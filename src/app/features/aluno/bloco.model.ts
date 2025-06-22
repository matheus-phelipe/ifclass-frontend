import { Sala } from "./sala.model";

export interface Bloco {
  id: number;
  nome: string;
  salas: Sala[];
}
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Aula } from './aula.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AulaService {
  private apiUrl = `${environment.SERVIDOR}/api/aulas`;

  constructor(private http: HttpClient) {}

  criarAula(aula: Aula) {
    return this.http.post<Aula>(this.apiUrl, aula);
  }

  buscarPorTurmaEData(turmaId: number, data: string) {
    return this.http.get<Aula[]>(`${this.apiUrl}/turma/${turmaId}/data/${data}`);
  }

  buscarPorProfessorEData(professorId: number, data: string) {
    return this.http.get<Aula[]>(`${this.apiUrl}/professor/${professorId}/data/${data}`);
  }

  buscarTodas() {
    return this.http.get<Aula[]>(this.apiUrl);
  }

  buscarPorProfessor(professorId: number) {
    return this.http.get<Aula[]>(`${this.apiUrl}/professor/${professorId}`);
  }
} 
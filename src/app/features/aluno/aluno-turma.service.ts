import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Turma } from '../turmas/turma.model';

@Injectable({ providedIn: 'root' })
export class AlunoTurmaService {
  private apiUrl = `${environment.SERVIDOR}/api/aluno-turma`;

  constructor(private http: HttpClient) {}

  buscarTurmaDoAluno(alunoId: number) {
    return this.http.get<Turma>(`${this.apiUrl}/aluno/${alunoId}`);
  }
} 
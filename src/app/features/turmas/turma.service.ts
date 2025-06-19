import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Turma } from './turma.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class TurmaService {
  private apiUrl = `${environment.SERVIDOR}/api/turmas`;

  constructor(private http: HttpClient) {}

  listar(): Observable<Turma[]> {
    return this.http.get<Turma[]>(this.apiUrl);
  }

  criar(turma: Partial<Turma>): Observable<Turma> {
    return this.http.post<Turma>(this.apiUrl, turma);
  }

  atualizar(turma: Partial<Turma>): Observable<Turma> {
    return this.http.put<Turma>(`${this.apiUrl}/${turma.id}`, turma);
  }

  excluir(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  vincularAlunosEmLote(turmaId: number, alunosIds: number[]) {
    return this.http.post(`${this.apiUrl.replace('/api/turmas', '/api/aluno-turma/lote')}/${turmaId}`, alunosIds);
  }

  listarAlunosPorTurma(turmaId: number) {
    return this.http.get<any[]>(`${this.apiUrl.replace('/api/turmas', '/api/aluno-turma/turma')}/${turmaId}`);
  }

  listarIdsAlunosVinculados() {
    return this.http.get<number[]>(`${this.apiUrl.replace('/api/turmas', '/api/aluno-turma/alunos-vinculados')}`);
  }

  desvincularAlunoDaTurma(alunoId: number) {
    return this.http.delete(`${this.apiUrl.replace('/api/turmas', '/api/aluno-turma')}/${alunoId}`);
  }
} 
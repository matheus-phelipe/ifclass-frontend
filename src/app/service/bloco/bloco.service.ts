import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Bloco } from '../../model/bloco/bloco.model';

@Injectable({
  providedIn: 'root'
})
export class BlocoService {
  private apiUrl = '/api/blocos';

  constructor(private http: HttpClient) { }

  getBlocos(): Observable<Bloco[]> {
    return this.http.get<Bloco[]>(this.apiUrl);
  }

  createBloco(nome: string): Observable<Bloco> {
    const novoBloco = { nome, salas: [] };
    return this.http.post<Bloco>(this.apiUrl, novoBloco);
  }
  
  deleteBloco(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  // Envia o objeto sala sem o 'id' para ser criado
  addSala(blocoId: number, sala: { codigo: string; capacidade: number }): Observable<Bloco> {
    return this.http.post<Bloco>(`${this.apiUrl}/${blocoId}/salas`, sala);
  }

  // O endpoint de delete agora usa o ID da sala na URL
  deleteSala(blocoId: number, salaId: number): Observable<Bloco> {
    return this.http.delete<Bloco>(`${this.apiUrl}/${blocoId}/salas/${salaId}`);
  }
}
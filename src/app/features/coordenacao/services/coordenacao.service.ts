import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface EstatisticasCoordenacao {
  totalProfessores: number;
  professoresAtivos: number;
  totalDisciplinas: number;
  totalTurmas: number;
  totalAulas: number;
  aulasHoje: number;
  salasOcupadas: number;
  totalSalas: number;
  professoresNormal: number;
  professoresSobrecarregados: number;
  professoresSubutilizados: number;
  mediaHorasPorProfessor: number;
  percentualOcupacaoSalas: number;
  percentualOcupacaoTurno: number;
}

export interface ProfessorCarga {
  id: number;
  nome: string;
  email: string;
  prontuario: string;
  horasSemanais: number;
  numeroDisciplinas: number;
  status: 'NORMAL' | 'SOBRECARREGADO' | 'SUBUTILIZADO';
  disciplinas: DisciplinaProfessor[];
}

export interface DisciplinaProfessor {
  id: number;
  nome: string;
  codigo: string;
  horasSemanais: number;
  turmas: string[];
}

@Injectable({
  providedIn: 'root'
})
export class CoordenacaoService {
  private apiUrl = `${environment.SERVIDOR}/api/coordenacao`;

  constructor(private http: HttpClient) { }

  getEstatisticasDashboard(): Observable<EstatisticasCoordenacao> {
    return this.http.get<EstatisticasCoordenacao>(`${this.apiUrl}/dashboard/estatisticas`);
  }

  getProfessoresCarga(): Observable<ProfessorCarga[]> {
    return this.http.get<ProfessorCarga[]>(`${this.apiUrl}/professores/carga`);
  }

  getProfessorCarga(professorId: number): Observable<ProfessorCarga> {
    return this.http.get<ProfessorCarga>(`${this.apiUrl}/professores/carga/${professorId}`);
  }
}

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface EstatisticasAdmin {
  totalUsuarios: number;
  totalProfessores: number;
  totalAlunos: number;
  totalCoordenadores: number;
  totalAdmins: number;
  totalCursos: number;
  totalTurmas: number;
  totalDisciplinas: number;
  totalSalas: number;
  totalBlocos: number;
  totalAulas: number;
  aulasHoje: number;
  aulasEstaSemana: number;
  versaoSistema: string;
  statusSistema: string;
  tempoOnline: number;
  percentualUsoMemoria: number;
  percentualUsoCPU: number;
}

export interface MonitoramentoSistema {
  status: string;
  ultimaVerificacao: string;
  tempoOnlineMinutos: number;
  usoMemoria: number;
  usoCPU: number;
  espacoDiscoLivre: number;
  espacoDiscoTotal: number;
  statusBancoDados: string;
  conexoesAtivas: number;
  conexoesMaximas: number;
  tempoRespostaBD: number;
  usuariosOnline: number;
  sessaoesAtivas: number;
  requestsUltimaHora: number;
  errorsUltimaHora: number;
  healthChecks: { [key: string]: string };
  versaoJava: string;
  versaoSpring: string;
  versaoSistema: string;
  inicioSistema: string;
}

export interface LogSistema {
  id: number;
  timestamp: string;
  nivel: string;
  categoria: string;
  mensagem: string;
  usuario: string;
  ip: string;
  detalhes: string;
}

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private apiUrl = `${environment.SERVIDOR}/api/admin`;

  constructor(private http: HttpClient) { }

  getEstatisticasAdmin(): Observable<EstatisticasAdmin> {
    return this.http.get<EstatisticasAdmin>(`${this.apiUrl}/dashboard/estatisticas`);
  }

  getMonitoramentoSistema(): Observable<MonitoramentoSistema> {
    return this.http.get<MonitoramentoSistema>(`${this.apiUrl}/sistema/monitoramento`);
  }

  getLogsSistema(): Observable<LogSistema[]> {
    return this.http.get<LogSistema[]>(`${this.apiUrl}/sistema/logs`);
  }

  healthCheck(): Observable<string> {
    return this.http.get(`${this.apiUrl}/sistema/health`, { responseType: 'text' });
  }

  getPerformanceMetrics(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/performance`);
  }

  criarBackup(): Observable<string> {
    return this.http.post(`${this.apiUrl}/sistema/backup`, {}, { responseType: 'text' });
  }

  reiniciarServicos(): Observable<string> {
    return this.http.post(`${this.apiUrl}/sistema/restart`, {}, { responseType: 'text' });
  }

  limparCache(): Observable<string> {
    return this.http.post(`${this.apiUrl}/sistema/cache/clear`, {}, { responseType: 'text' });
  }

  otimizarBanco(): Observable<string> {
    return this.http.post(`${this.apiUrl}/sistema/database/optimize`, {}, { responseType: 'text' });
  }
}

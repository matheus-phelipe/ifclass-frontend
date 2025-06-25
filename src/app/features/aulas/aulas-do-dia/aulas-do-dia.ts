import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AulaService } from '../aula.service';
import { BlocoService } from '../../aluno/bloco.service';
import { AuthService } from '../../../service/auth/auth.service';
import { ProfileSwitcherComponent } from '../../../shared/profile-switcher/profile-switcher';
import { Aula } from '../aula.model';
import { Bloco } from '../../aluno/bloco.model';

@Component({
  selector: 'app-aulas-do-dia',
  standalone: true,
  imports: [CommonModule, RouterModule, ProfileSwitcherComponent],
  templateUrl: './aulas-do-dia.html',
  styleUrls: ['./aulas-do-dia.css']
})
export class AulasDoDiaComponent implements OnInit {
  aulas: Aula[] = [];
  blocos: Bloco[] = [];
  carregando = true;
  dataAtual = new Date();
  diaSemanaAtual = '';

  // Estatísticas
  totalAulas = 0;
  aulasMatutino = 0;
  aulasVespertino = 0;
  aulasNoturno = 0;
  salasOcupadas = 0;

  constructor(
    private aulaService: AulaService,
    private blocoService: BlocoService,
    public authService: AuthService
  ) {}

  ngOnInit(): void {
    this.definirDiaSemana();
    this.carregarBlocos();
    this.carregarAulasDeHoje();
  }

  private definirDiaSemana(): void {
    const diasSemana = [
      'Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira',
      'Quinta-feira', 'Sexta-feira', 'Sábado'
    ];
    this.diaSemanaAtual = diasSemana[this.dataAtual.getDay()];
  }

  private carregarBlocos(): void {
    this.blocoService.getBlocos().subscribe({
      next: (blocos: Bloco[]) => {
        this.blocos = blocos;
      },
      error: (error: any) => {
        console.error('Erro ao carregar blocos:', error);
      }
    });
  }

  private carregarAulasDeHoje(): void {
    this.carregando = true;
    this.aulaService.buscarAulasDeHoje().subscribe({
      next: (aulas: Aula[]) => {
        this.aulas = aulas;
        this.calcularEstatisticas();
        this.carregando = false;
      },
      error: (error: any) => {
        console.error('Erro ao carregar aulas:', error);
        this.carregando = false;
      }
    });
  }

  private calcularEstatisticas(): void {
    this.totalAulas = this.aulas.length;
    this.aulasMatutino = this.aulas.filter(a => this.getHoraNumero(a.hora) < 12).length;
    this.aulasVespertino = this.aulas.filter(a => {
      const hora = this.getHoraNumero(a.hora);
      return hora >= 12 && hora < 18;
    }).length;
    this.aulasNoturno = this.aulas.filter(a => this.getHoraNumero(a.hora) >= 18).length;
    
    const salasUnicas = new Set(this.aulas.map(a => a.sala.id));
    this.salasOcupadas = salasUnicas.size;
  }

  private getHoraNumero(hora: string): number {
    return parseInt(hora.split(':')[0]);
  }

  getBlocoNome(salaId: number): string {
    for (const bloco of this.blocos) {
      const sala = bloco.salas.find(s => s.id === salaId);
      if (sala) {
        return bloco.nome;
      }
    }
    return 'N/A';
  }

  formatarDiaSemana(diaSemana: string): string {
    const dias: { [key: string]: string } = {
      'MONDAY': 'Segunda',
      'TUESDAY': 'Terça',
      'WEDNESDAY': 'Quarta',
      'THURSDAY': 'Quinta',
      'FRIDAY': 'Sexta',
      'SATURDAY': 'Sábado',
      'SUNDAY': 'Domingo'
    };
    return dias[diaSemana] || diaSemana;
  }

  getPeriodoAula(hora: string): string {
    const horaNum = this.getHoraNumero(hora);
    if (horaNum < 12) return 'Matutino';
    if (horaNum < 18) return 'Vespertino';
    return 'Noturno';
  }

  getClassePeriodo(hora: string): string {
    const periodo = this.getPeriodoAula(hora);
    switch (periodo) {
      case 'Matutino': return 'periodo-matutino';
      case 'Vespertino': return 'periodo-vespertino';
      case 'Noturno': return 'periodo-noturno';
      default: return '';
    }
  }

  recarregarAulas(): void {
    this.carregarAulasDeHoje();
  }
}

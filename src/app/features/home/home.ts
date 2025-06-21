import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy } from '@angular/core'; // OnDestroy ainda é necessário para a inscrição dos cards
import { RouterModule } from '@angular/router';
import { AuthService } from '../../service/auth/auth.service';
import { ALL_MENU_CARDS, MenuCard } from './menu-cards';
import { ProximaAula } from '../../model/aula/proximaaula.model';
import { Aviso } from '../../model/aviso/aviso.model';
import { ProfileSwitcherComponent } from '../../shared/profile-switcher/profile-switcher';
import { Subscription } from 'rxjs';
import { AulaService } from '../aulas/aula.service';
import { UsuarioService } from '../usuario/usuario.service';
import { Aula } from '../aulas/aula.model';
import { BlocoService } from '../aluno/bloco.service';
import { Bloco } from '../aluno/bloco.model';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule, ProfileSwitcherComponent],
  templateUrl: './home.html',
  styleUrls: ['./home.css']
})
export class Home implements OnInit, OnDestroy {
  
  nomeUsuario = '';
  proximaAula: ProximaAula | null = null;
  proximaAulaFutura: ProximaAula | null = null;
  avisos: Aviso[] = [];
  menuCards: MenuCard[] = [];
  blocos: Bloco[] = [];
  professorSemAulas = false;
  
  private roleSubscription!: Subscription;

  constructor(
    public authService: AuthService, 
    private aulaService: AulaService, 
    private usuarioService: UsuarioService,
    private blocoService: BlocoService
  ) {}

  ngOnInit(): void {
    this.nomeUsuario = this.authService.getNomeUsuario() || 'Usuário';
    this.carregarBlocos();

    this.roleSubscription = this.authService.activeRole$.subscribe(() => {
      this.filterMenuCards();
      this.carregarDadosDashboard();
    });
  }

  ngOnDestroy(): void {
    if (this.roleSubscription) {
      this.roleSubscription.unsubscribe();
    }
  }

  filterMenuCards(): void {
    const activeRole = this.authService.getActiveRole();
    if (!activeRole) {
      this.menuCards = [];
      return;
    }
    
    this.menuCards = ALL_MENU_CARDS.filter(card => card.roles.includes(activeRole));
  }

  async carregarDadosDashboard(): Promise<void> {
    this.proximaAula = null;
    this.proximaAulaFutura = null;
    this.professorSemAulas = false;
    const activeRole = this.authService.getActiveRole();
    if (activeRole === 'ROLE_PROFESSOR') {
      const usuarioId = this.authService.getIdUsuario();
      if (usuarioId) {
        const hoje = new Date();
        const dataStr = hoje.toISOString().slice(0, 10);
        this.aulaService.buscarPorProfessorEData(usuarioId, dataStr).subscribe(aulas => {
          if (aulas && aulas.length > 0) {
            aulas.sort((a, b) => a.hora.localeCompare(b.hora));
            const agora = hoje.toTimeString().slice(0, 5);
            const proxima = aulas.find(a => a.hora >= agora) || aulas[0];
            this.proximaAula = {
              disciplina: proxima.disciplina.nome,
              professor: proxima.professor.nome,
              sala: proxima.sala.codigo,
              bloco: this.getBlocoNome(proxima.sala.id),
              horario: proxima.hora
            };
          } else {
            this.aulaService.buscarProximaAula(usuarioId).subscribe({
              next: proxima => {
                this.proximaAulaFutura = {
                  disciplina: proxima.disciplina.nome,
                  professor: proxima.professor.nome,
                  sala: proxima.sala.codigo,
                  bloco: this.getBlocoNome(proxima.sala.id),
                  horario: proxima.hora,
                  diaSemana: proxima.diaSemana
                };
              },
              error: (err) => { 
                if (err.status === 404) {
                  this.professorSemAulas = true;
                }
                this.proximaAulaFutura = null; 
              }
            });
          }
        });
      }
    }

    this.avisos = [
      { id: 1, titulo: 'Manutenção do sistema na próxima sexta-feira.', data: '12/06/2025' },
      { id: 2, titulo: 'Inscrições para atividades complementares abertas.', data: '10/06/2025' },
      { id: 3, titulo: 'Palestra sobre IA na educação no auditório.', data: '08/06/2025' }
    ];
  }

  getBlocoNome(salaId: number): string {
    for (const bloco of this.blocos) {
      if (bloco.salas.some(sala => sala.id === salaId)) {
        return bloco.nome;
      }
    }
    return 'Não encontrado';
  }

  formatarDiaSemana(dia: string | undefined): string {
    if (!dia) return '';
    const dias: { [key: string]: string } = {
      'MONDAY': 'Segunda-feira',
      'TUESDAY': 'Terça-feira',
      'WEDNESDAY': 'Quarta-feira',
      'THURSDAY': 'Quinta-feira',
      'FRIDAY': 'Sexta-feira',
      'SATURDAY': 'Sábado',
      'SUNDAY': 'Domingo'
    };
    return dias[dia] || dia;
  }

  private carregarBlocos(): void {
    this.blocoService.getBlocos().subscribe(blocos => {
      this.blocos = blocos;
      // Após carregar os blocos, podemos recarregar o dashboard se necessário
      this.carregarDadosDashboard();
    });
  }
}
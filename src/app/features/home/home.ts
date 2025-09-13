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
import { AvisosService } from '../../model/aviso/aviso.service';
import { FormsModule } from '@angular/forms';
import { ViewChild } from '@angular/core';
import { AlertComponent } from '../../shared/alert/alert';
import { ModalConfirmacaoComponent } from '../../shared/modal-confirmacao/modal-confirmacao';
import { Action } from 'rxjs/internal/scheduler/Action';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule, ProfileSwitcherComponent, FormsModule, AlertComponent, ModalConfirmacaoComponent],
  templateUrl: './home.html',
  styleUrls: ['./home.css']
})



export class Home implements OnInit, OnDestroy {

  nomeUsuario = '';
  proximaAula: ProximaAula | null = null;
  proximaAulaFutura: ProximaAula | null = null;
  avisos: Aviso[] = [];
  exibirModalAviso = false;
  menuCards: MenuCard[] = [];
  blocos: Bloco[] = [];
  professorSemAulas = false;
  novoAviso: Aviso = { id: 0, titulo: '', informacoes: '' };
  exibirModalTodosAvisos = false;
  avisoSelecionado: any = null;
  modoEdicao = false;
  exibirModalExcluir = false;

  @ViewChild(AlertComponent) alertComponent!: AlertComponent;
  @ViewChild('modalConfirm') modalConfirm!: ModalConfirmacaoComponent;

  private roleSubscription!: Subscription;

  constructor(
    public authService: AuthService,
    private aulaService: AulaService,
    private usuarioService: UsuarioService,
    private blocoService: BlocoService,
    private avisosService: AvisosService
  ) { }

  ngOnInit(): void {
    // compara dia atual para não habilitar a criação de um anúncio para uma data passada
    this.nomeUsuario = this.authService.getNomeUsuario() || 'Usuário';
    this.carregarBlocos();

    this.roleSubscription = this.authService.activeRole$.subscribe(() => {
      this.filterMenuCards();
      this.carregarDadosDashboard();
    });
    this.carregarAvisos();
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
  }

  mostrarAlerta(mensagem: string, tipo: 'success' | 'danger' = 'success') {
    // Aqui você pode integrar com o seu AlertComponent ou usar console.log por enquanto
    console.log(`[${tipo.toUpperCase()}] ${mensagem}`);

    // Exemplo se tiver um alert component:
    // this.alertComponent.show(mensagem, tipo);
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

  carregarAvisos(): void {
    this.avisosService.getAvisos().subscribe({
      next: (data) => {
        this.avisos = data.map(aviso => ({
          ...aviso,
          dataInsercao: aviso.dataInsercao ? new Date(aviso.dataInsercao) : undefined
        }));
      },
      error: (err) => console.error('Erro ao carregar avisos:', err)
    });
  }

  abrirModal(): void {
    if (this.authService.isRoleActiveOrHigher('ROLE_ADMIN') || this.authService.isRoleActiveOrHigher('ROLE_COORDENADOR')) {
      this.novoAviso = { id: 0, titulo: '', informacoes: '' };
      this.exibirModalAviso = true;
    }
  }

  fecharModalAviso(): void {
    this.exibirModalAviso = false;
    this.modoEdicao = false;
    this.avisoSelecionado = null;
    this.novoAviso = { id: 0, titulo: '', informacoes: '' };
  }

  abrirModalTodosAvisos(): void {
    this.exibirModalTodosAvisos = true;
  }

  fecharModalTodosAvisos(): void {
    this.exibirModalTodosAvisos = false;
  }

  abrirModalEditar(aviso: any) {
    if (this.authService.isRoleActiveOrHigher('ROLE_ADMIN') || this.authService.isRoleActiveOrHigher('ROLE_COORDENADOR')) {
      this.avisoSelecionado = aviso;
      this.novoAviso = { ...aviso };
      this.exibirModalAviso = true;
      this.modoEdicao = true;
      this.exibirModalTodosAvisos = false;
    }
  }

  removerAviso(aviso: Aviso) {
    this.exibirModalTodosAvisos = false;
    if (!aviso) return;

    // Função que só será executada se o usuário confirmar no modal
    const action = () => {
      this.avisosService.deleteAviso(aviso.id).subscribe({
        next: () => {
          this.avisos = this.avisos.filter(a => a.id !== aviso.id);
          this.exibirModalExcluir = false;
          this.alertComponent.show('Aviso removido com sucesso!', 3000, 'success');
        },
        error: () => this.mostrarAlerta('Erro ao remover aviso.', 'danger')
      });
    };

    // Abre o modal passando o callback
    this.modalConfirm.open(
      'danger',
      'Confirmar Remoção',
      `Tem certeza que deseja remover o aviso ${aviso.titulo}?`,
      action
    );
  }

  cancelarRemocao() {
    this.modalConfirm.close();
  }

  salvarAviso(): void {
    if (this.modoEdicao && this.avisoSelecionado) {
      // Atualiza o aviso existente
      const avisoAtualizado = { ...this.novoAviso };
      this.avisosService.updateAviso(this.avisoSelecionado.id, avisoAtualizado).subscribe({
        next: (aviso) => {
          const index = this.avisos.findIndex(a => a.id === this.avisoSelecionado?.id);
          if (index !== -1) this.avisos[index] = aviso;
          this.fecharModalAviso();
          this.alertComponent.show('Aviso editado com sucesso!', 3000, 'success');
        },
        error: (err) => this.alertComponent.show('Erro ao editar aviso.', 3000, 'danger')
      });
    } else {
      const avisoParaSalvar = {
        titulo: this.novoAviso.titulo,
        informacoes: this.novoAviso.informacoes,
        dataInsercao: this.novoAviso.dataInsercao
      };

      this.avisosService.addAviso(avisoParaSalvar).subscribe({
        next: (aviso) => {
          this.avisos.push(aviso);
          this.fecharModalAviso();
          this.alertComponent.show('Aviso adicionado com sucesso!', 3000, 'success');
        },
        error: (err) => this.alertComponent.show('Erro ao adicionar aviso...', 3000, 'danger')
      });
    }
  }
}
import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../service/auth/auth.service';
import { ALL_MENU_CARDS, MenuCard } from './menu-cards';
import { ProximaAula } from '../../model/aula/proximaaula.model';
import { Aviso } from '../../model/aviso/aviso.model';
import { ProfileSwitcherComponent } from '../../shared/profile-switcher/profile-switcher';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule, ProfileSwitcherComponent],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class Home implements OnInit {
  
  // Propriedades para o Dashboard
  nomeUsuario = '';
  proximaAula: ProximaAula | null = null;
  avisos: Aviso[] = [];
  menuCards: MenuCard[] = [];
  
  private roleSubscription!: Subscription;

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.nomeUsuario = this.authService.getNomeUsuario() || 'Usuário';

    // Assina as mudanças de perfil para atualizar os cards dinamicamente
    this.roleSubscription = this.authService.activeRole$.subscribe(() => {
      this.filterMenuCards();
      this.carregarDadosDashboard();
    });

    // Carga inicial
    this.filterMenuCards();
    this.carregarDadosDashboard();
  }

  ngOnDestroy(): void {
    if (this.roleSubscription) {
      this.roleSubscription.unsubscribe();
    }
  }

  filterMenuCards(): void {
    this.menuCards = ALL_MENU_CARDS.filter(card =>
      card.roles.some(role => this.authService.isRoleActiveOrHigher(role))
    );
  }

  carregarDadosDashboard(): void {
    // Limpa a próxima aula antes de verificar novamente
    this.proximaAula = null;

    // Exemplo para um aluno ou professor (baseado no perfil ativo)
    if (this.isAluno || this.isProfessor) {
      this.proximaAula = {
        disciplina: 'Cálculo I',
        professor: 'Dr. Newton',
        sala: 'S-205',
        bloco: 'Bloco B',
        horario: '14:00 - 15:40'
      };
    }

    // Exemplo de avisos para todos
    this.avisos = [
      { id: 1, titulo: 'Manutenção do sistema na próxima sexta-feira.', data: '12/06/2025' },
      { id: 2, titulo: 'Inscrições para atividades complementares abertas.', data: '10/06/2025' },
      { id: 3, titulo: 'Palestra sobre IA na educação no auditório.', data: '08/06/2025' }
    ];
  }

  // Getters para controle de permissão
  get isAdmin() { return this.authService.isRoleActiveOrHigher('ROLE_ADMIN'); }
  get isCoordenador() { return this.authService.isRoleActiveOrHigher('ROLE_COORDENADOR'); }
  get isProfessor() { return this.authService.isRoleActiveOrHigher('ROLE_PROFESSOR'); }
  get isAluno() { return this.authService.isRoleActiveOrHigher('ROLE_ALUNO'); }
}

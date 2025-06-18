import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy } from '@angular/core'; // OnDestroy ainda é necessário para a inscrição dos cards
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
  styleUrls: ['./home.css']
})
export class Home implements OnInit, OnDestroy {
  
  nomeUsuario = '';
  proximaAula: ProximaAula | null = null;
  avisos: Aviso[] = [];
  menuCards: MenuCard[] = [];
  
  private roleSubscription!: Subscription;

  constructor(public authService: AuthService) {}

  ngOnInit(): void {
    this.nomeUsuario = this.authService.getNomeUsuario() || 'Usuário';

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

   carregarDadosDashboard(): void {
    this.proximaAula = null;

    const activeRole = this.authService.getActiveRole();
    const podeVerAula = activeRole === 'ROLE_ALUNO' || activeRole === 'ROLE_PROFESSOR';

    if (podeVerAula) {
      this.proximaAula = {
        disciplina: 'Cálculo I',
        professor: 'Dr. Newton',
        sala: 'S-205',
        bloco: 'Bloco B',
        horario: '14:00 - 15:40'
      };
    }

    this.avisos = [
      { id: 1, titulo: 'Manutenção do sistema na próxima sexta-feira.', data: '12/06/2025' },
      { id: 2, titulo: 'Inscrições para atividades complementares abertas.', data: '10/06/2025' },
      { id: 3, titulo: 'Palestra sobre IA na educação no auditório.', data: '08/06/2025' }
    ];
  }
}
import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../service/auth/auth.service';
import { ALL_MENU_CARDS, MenuCard } from './menu-cards';
import { ProximaAula } from '../../model/aula/proximaaula.model';
import { Aviso } from '../../model/aviso/aviso.model';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class Home implements OnInit {
  
  // Propriedades para o Dashboard
  nomeUsuario = '';
  proximaAula: ProximaAula | null = null;
  avisos: Aviso[] = [];
  menuCards: MenuCard[] = [];
  
  constructor(private router: Router, private authService: AuthService) {}

  ngOnInit(): void {
    // Carrega o nome do usuário (idealmente viria do payload do token JWT)
    this.nomeUsuario = this.authService.getNomeUsuario() || 'Usuário'; // Você precisará criar o método getNomeUsuario() no seu AuthService

    // Filtra os cards de menu com base nas permissões
    this.menuCards = ALL_MENU_CARDS.filter(card =>
      card.roles.some(role => this.authService.hasRole(role))
    );

    // Carrega os dados do dashboard (aqui usamos dados de exemplo)
    this.carregarDadosDashboard();
  }

  carregarDadosDashboard(): void {
    // **DADOS DE EXEMPLO (MOCK)**
    // No sistema real, estes dados viriam de chamadas de serviço ao seu backend.

    // Exemplo para um aluno ou professor
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
  get isAdmin() { return this.authService.hasRole('ROLE_ADMIN'); }
  get isCoordenador() { return this.authService.hasRole('ROLE_COORDENADOR'); }
  get isProfessor() { return this.authService.hasRole('ROLE_PROFESSOR'); }
  get isAluno() { return this.authService.hasRole('ROLE_ALUNO'); }
}

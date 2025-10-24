import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../service/auth/auth.service';

@Component({
  selector: 'app-profile-switcher',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './profile-switcher.html',
  styleUrls: ['./profile-switcher.css']
})
export class ProfileSwitcherComponent implements OnInit {
  
  availableRoles: string[] = [];
  activeRole: string | null = null;
  nomeUsuario: string = '';
  dropdownOpen: boolean = false;

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    this.availableRoles = this.authService.getAvailableRoles();
    this.activeRole = this.authService.getActiveRole();
    this.nomeUsuario = this.authService.getNomeUsuario() || 'Usuário';
  }

  switchProfile(role: string): void {
    // 1. Se clicar no perfil que já está ativo, não faz nada
    if (role === this.activeRole) {
      return;
    }

    // 2. Atualiza o perfil ativo no sistema
    this.authService.setActiveRole(role);

    // 3. Pega a URL atual ANTES de fazer qualquer coisa
    const currentUrl = this.router.url;

    // 4. Força a re-execução dos guards na rota ATUAL, sem mudar de página.
    // Isso garante que as permissões (como o painel de admin) sejam atualizadas
    // na tela em que o usuário já está.
    this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
      this.router.navigate([currentUrl]);
    });
  }

  toggleDropdown(): void {
    this.dropdownOpen = !this.dropdownOpen;
  }

  formatRoleName(role: string): string {
    return role.replace('ROLE_', '').charAt(0).toUpperCase() + role.replace('ROLE_', '').slice(1).toLowerCase();
  }

  getRoleIcon(role: string): string {
    const icons: { [key: string]: string } = {
      'ROLE_ADMIN': 'bi bi-gear-fill',
      'ROLE_ALUNO': 'bi bi-person-fill',
      'ROLE_PROFESSOR': 'bi bi-person-badge-fill',
      'ROLE_COORDENADOR': 'bi bi-people-fill'
    };
    return icons[role] || 'bi bi-person-fill';
  }

  getRoleDescription(role: string): string {
    const descriptions: { [key: string]: string } = {
      'ROLE_ADMIN': 'Acesso completo ao sistema',
      'ROLE_ALUNO': 'Visualizar aulas e horários',
      'ROLE_PROFESSOR': 'Gerenciar aulas e turmas',
      'ROLE_COORDENADOR': 'Coordenar cursos e professores'
    };
    return descriptions[role] || 'Perfil de usuário';
  }
}
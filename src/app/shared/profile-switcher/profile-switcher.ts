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

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    this.availableRoles = this.authService.getAvailableRoles();
    this.activeRole = this.authService.getActiveRole();
    this.nomeUsuario = this.authService.getNomeUsuario() || 'Usuário';
  }

  switchProfile(role: string): void {
    if (role === this.activeRole) return; // Não faz nada se clicar no perfil já ativo

    this.authService.setActiveRole(role);

    // Redireciona com base no perfil escolhido
    if (role === 'ROLE_ALUNO') {
      this.router.navigate(['/aluno/mapa']);
    } else {
      // Para qualquer outro perfil, vai para a home principal
      // Usamos .then() para forçar o recarregamento do componente se já estivermos na home
      this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
        this.router.navigate(['/app/home']);
      });
    }
  }

  formatRoleName(role: string): string {
    return role.replace('ROLE_', '').charAt(0).toUpperCase() + role.replace('ROLE_', '').slice(1).toLowerCase();
  }
}
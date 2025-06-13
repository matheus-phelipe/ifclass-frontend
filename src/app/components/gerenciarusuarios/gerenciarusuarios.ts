import { Component } from '@angular/core';
import { Usuario } from '../../model/usuario/usuario.model';
import { UsuarioService } from '../../service/usuario/usuario.service';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../service/auth/auth.service';

@Component({
  selector: 'app-gerenciarusuarios',
  imports: [CommonModule, RouterModule],
  templateUrl: './gerenciarusuarios.html',
  styleUrl: './gerenciarusuarios.css'
})
export class Gerenciarusuarios {
  usuarios: Usuario[] = [];
  sidebarOpen = true;

  constructor(
    private router: Router,
    private authService: AuthService,
    private usuarioService: UsuarioService
  ) {}

  ngOnInit(): void {
    this.carregarUsuarios();
  }

  get isAdmin() { return this.authService.hasRole('ROLE_ADMIN'); }
  get isCoordenador() { return this.authService.hasRole('ROLE_COORDENADOR'); }
  get isProfessor() { return this.authService.hasRole('ROLE_PROFESSOR'); }
  get isAluno() { return this.authService.hasRole('ROLE_ALUNO'); }

  carregarUsuarios() {
    this.usuarioService.listarTodos().subscribe({
      next: (data) => {
        this.usuarios = data.map(u => ({
          ...u,
          authority: u.authorities ?? '' // garante string
        }));
      },
      error: () => alert("Erro ao carregar usuários.")
    });
  }

  toggleSidebar() {
    this.sidebarOpen = !this.sidebarOpen;
  }

  onRoleChange(usuario: Usuario, novoPapel: string) {
    this.usuarioService.atualizarAuthorities(usuario.id, novoPapel).subscribe({
      next: () => usuario.authorities = novoPapel,
      error: () => alert("Erro ao atualizar papel.")
    });
  }

  temPapel(usuario: Usuario, papel: string): boolean {
    return usuario.authorities === papel;
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}

import { Component, OnInit, ViewChild } from '@angular/core';
import { Usuario } from '../../model/usuario/usuario.model';
import { UsuarioService } from '../../service/usuario/usuario.service';
import { CommonModule } from '@angular/common';
import { AlertComponent } from '../../shared/alert/alert';
import { FormsModule } from '@angular/forms';
import { ProfileSwitcherComponent } from '../../shared/profile-switcher/profile-switcher';
import { AuthService } from '../../service/auth/auth.service';

@Component({
  selector: 'app-gerenciarpermissoes',
  standalone: true,
  imports: [CommonModule, FormsModule, AlertComponent, ProfileSwitcherComponent],
  templateUrl: './gerenciarpermissoes.html',
  styleUrls: ['./gerenciarpermissoes.css']
})
export class Gerenciarpermissoes implements OnInit {
  usuarios: Usuario[] = []; 
  usuariosFiltrados: Usuario[] = []; 
  termoBusca = '';

  usuarioSelecionado: Usuario | null = null;
  
  @ViewChild('alerta') alerta!: AlertComponent;

  constructor(
    private usuarioService: UsuarioService,
    public authService: AuthService
  ) {}

  ngOnInit(): void {
    this.carregarUsuarios();
  }

  carregarUsuarios() {
    this.usuarioService.listarCoordenador().subscribe({
      next: (data) => {
        this.usuarios = data;
        this.usuariosFiltrados = data;
        if (this.usuariosFiltrados.length > 0) {
          this.selecionarUsuario(this.usuariosFiltrados[0]);
        }
      },
      error: () => this.mostrarAlerta("Erro ao carregar usuários.", 'danger')
    });
  }
  
  selecionarUsuario(usuario: Usuario): void {
    this.usuarioSelecionado = usuario;
  }

  filtrarUsuarios(): void {
    const busca = this.termoBusca.toLowerCase();
    if (!busca) {
      this.usuariosFiltrados = this.usuarios;
    } else {
      this.usuariosFiltrados = this.usuarios.filter(usuario =>
        usuario.nome.toLowerCase().includes(busca) ||
        usuario.email.toLowerCase().includes(busca)
      );
    }
    
    if (this.usuarioSelecionado && !this.usuariosFiltrados.some(u => u.id === this.usuarioSelecionado?.id)) {
        this.usuarioSelecionado = this.usuariosFiltrados.length > 0 ? this.usuariosFiltrados[0] : null;
    } else if (!this.usuarioSelecionado && this.usuariosFiltrados.length > 0) {
        this.usuarioSelecionado = this.usuariosFiltrados[0];
    }
  }

  onRoleChange(usuario: Usuario, papel: string) {
    if (!this.authService.isRoleActiveOrHigher('ROLE_COORDENADOR')) {
      this.mostrarAlerta('Você não tem permissão para alterar papéis.', 'danger');
      return;
    }
    
    const permissoesAtuais = [...(usuario.authorities || [])];
    const index = permissoesAtuais.indexOf(papel);

    if (index > -1) {
      permissoesAtuais.splice(index, 1);
    } else {
      permissoesAtuais.push(papel);
    }
    
    this.usuarioService.atualizarAuthorities(usuario.id, permissoesAtuais).subscribe({
      next: (usuarioAtualizado) => {
        const idx = this.usuarios.findIndex(u => u.id === usuario.id);
        if (idx !== -1) {
          this.usuarios[idx].authorities = usuarioAtualizado.authorities;
        }
        if (this.usuarioSelecionado?.id === usuario.id) {
          this.usuarioSelecionado.authorities = usuarioAtualizado.authorities;
        }
        this.mostrarAlerta(`Permissões de ${usuario.nome} atualizadas.`);
      },
      error: () => this.mostrarAlerta('Erro ao atualizar a permissão.', 'danger')
    });
  }

  /**
   * Verifica se o usuário possui um papel específico em seu array de authorities.
   */
  temPapel(usuario: Usuario, papel: string): boolean {
    return usuario.authorities && usuario.authorities.includes(papel);
  }

  formatarPermissoes(authorities: string[]): string {
    if (!authorities || authorities.length === 0) {
      return 'Nenhuma';
    }
    return authorities.map(auth => auth.replace('ROLE_', '')).join(', ');
  }

  mostrarAlerta(mensagem: string, tipo: 'success' | 'danger' = 'success') {
    this.alerta.show(mensagem, 3000, tipo); 
  }
}
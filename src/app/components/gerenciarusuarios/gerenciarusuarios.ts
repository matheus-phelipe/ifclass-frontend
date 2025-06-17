import { Component, ViewChild, OnInit } from '@angular/core';
import { Usuario } from '../../model/usuario/usuario.model';
import { UsuarioService } from '../../service/usuario/usuario.service';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../service/auth/auth.service';
import { FormsModule } from '@angular/forms';
import { AlertComponent } from '../../shared/alert/alert';
import { ModalConfirmacaoComponent } from '../../shared/modal-confirmacao/modal-confirmacao';

declare var bootstrap: any;

@Component({
  selector: 'app-gerenciarusuarios',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, AlertComponent, ModalConfirmacaoComponent],
  templateUrl: './gerenciarusuarios.html',
  styleUrls: ['./gerenciarusuarios.css']
})
export class Gerenciarusuarios implements OnInit {
  
  usuarios: Usuario[] = [];
  usuariosFiltrados: Usuario[] = [];
  termoBusca = '';

  usuarioSelecionado: Usuario | null = null;
usuarioParaEditar: Usuario = {
    id: 0,
    nome: '',
    email: '',
    prontuario: '',
    authorities: []
  };
  
  usuarioParaRemover!: Usuario;
  
  // Variáveis para alteração de permissão
  usuarioParaAlterarPermissao!: Usuario;
  permissoesParaAtualizar: string[] = [];

  editarUsuarioModal: any; 

  @ViewChild('modalConfirm') modalConfirm!: ModalConfirmacaoComponent;
  @ViewChild('modalConfirmPermissao') modalConfirmPermissao!: ModalConfirmacaoComponent;
  @ViewChild('alerta') alerta!: AlertComponent;

  constructor(
    private router: Router,
    private authService: AuthService,
    private usuarioService: UsuarioService
  ) {}

  ngOnInit(): void {
    this.carregarUsuarios();
    const modalElement = document.getElementById('editarUsuarioModal');
    if (modalElement) {
      this.editarUsuarioModal = new bootstrap.Modal(modalElement);
    }
  }

  carregarUsuarios() {
    this.usuarioService.listarTodos().subscribe({
      next: (data) => {
        this.usuarios = data;
        this.usuariosFiltrados = data;
        if (this.usuariosFiltrados.length > 0 && !this.usuarioSelecionado) {
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
  
  /**
   * Prepara a alteração de uma permissão para um usuário.
   * Em vez de abrir um modal, calcula as novas permissões e chama o serviço diretamente
   * para uma experiência de usuário mais fluida.
   */
  onRoleChange(usuario: Usuario, papel: string) {
    const permissoesAtuais = [...(usuario.authorities || [])];
    const index = permissoesAtuais.indexOf(papel);

    if (index > -1) {
      // Se já tem o papel, remove
      permissoesAtuais.splice(index, 1);
    } else {
      // Se não tem o papel, adiciona
      permissoesAtuais.push(papel);
    }
    
    // Chama o serviço para atualizar as permissões
    this.usuarioService.atualizarAuthorities(usuario.id, permissoesAtuais).subscribe({
      next: (usuarioAtualizado: Usuario) => {
        // Atualiza o estado local para refletir a mudança imediatamente
        const idx = this.usuarios.findIndex(u => u.id === usuario.id);
        if (idx !== -1) {
          this.usuarios[idx].authorities = usuarioAtualizado.authorities;
        }
        this.mostrarAlerta(`Permissões de ${usuario.nome} atualizadas.`);
      },
      error: () => this.mostrarAlerta('Erro ao atualizar a permissão.', 'danger')
    });
  }

  abrirModalEditar(usuario: Usuario) {
    this.usuarioParaEditar = JSON.parse(JSON.stringify(usuario)); // Deep copy
    this.editarUsuarioModal.show();
  }

  salvarEdicao() {
    this.usuarioService.atualizarUsuario(this.usuarioParaEditar).subscribe({
      next: (usuarioAtualizado: Usuario) => {
          const index = this.usuarios.findIndex(u => u.id === usuarioAtualizado.id);
          if (index !== -1) {
            this.usuarios[index] = usuarioAtualizado;
            if(this.usuarioSelecionado?.id === usuarioAtualizado.id) {
              this.usuarioSelecionado = usuarioAtualizado;
            }
          }
          this.filtrarUsuarios();
          this.editarUsuarioModal.hide();
          this.mostrarAlerta('Usuário atualizado com sucesso!');
        },
        error: () => this.mostrarAlerta('Erro ao atualizar usuário.', 'danger')
    });
  }

  removerUsuario(usuario: Usuario) {
    this.usuarioParaRemover = usuario;
    this.modalConfirm.open(
        'danger',
        'Confirmar Remoção',
        `Tem certeza que deseja remover o usuário ${usuario.nome}? Essa ação não pode ser desfeita.`
    );
  }

  confirmarRemocao() {
    this.usuarioService.remover(this.usuarioParaRemover.id).subscribe({
        next: () => {
          this.usuarios = this.usuarios.filter(u => u.id !== this.usuarioParaRemover.id);
          this.filtrarUsuarios();
          this.mostrarAlerta('Usuário removido com sucesso!');
          this.modalConfirm.close();
        },
        error: () => this.mostrarAlerta('Erro ao remover usuário.', 'danger')
    });
  }
  
  cancelarRemocao() {
    this.modalConfirm.close();
  }

  /**
   * Verifica se o usuário possui um papel específico em seu array de authorities.
   */
  temPapel(usuario: Usuario, papel: string): boolean {
    return usuario.authorities && usuario.authorities.includes(papel);
  }

  // Novo método para formatar as permissões para exibição
  formatarPermissoes(authorities: string[]): string {
    if (!authorities || authorities.length === 0) {
      return 'Nenhuma';
    }
    return authorities.map(auth => auth.replace('ROLE_', '')).join(', ');
  }

  mostrarAlerta(mensagem: string, tipo: 'success' | 'danger' = 'success') {
    this.alerta.show(mensagem, 3000, tipo); 
  }

  // Métodos vazios para manter o template funcionando, podem ser removidos
  confirmarAlteracaoStatus() {}
  cancelarAlteracaoStatus() {}
}
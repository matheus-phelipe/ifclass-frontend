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
  usuarioParaEditar: Usuario = {} as Usuario;
  usuarioParaRemover!: Usuario;
  usuarioParaAlterarStatus!: Usuario | null;
  novaPermissao = '';
  mensagemModalConfirmacao = '';
  
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
    if (!this.termoBusca) {
      this.usuariosFiltrados = this.usuarios;
    } else {
      this.usuariosFiltrados = this.usuarios.filter(usuario =>
        usuario.nome.toLowerCase().includes(this.termoBusca.toLowerCase()) ||
        usuario.email.toLowerCase().includes(this.termoBusca.toLowerCase())
      );
    }
    if (this.usuarioSelecionado && !this.usuariosFiltrados.find(u => u.id === this.usuarioSelecionado?.id)) {
        this.usuarioSelecionado = this.usuariosFiltrados.length > 0 ? this.usuariosFiltrados[0] : null;
    } else if (!this.usuarioSelecionado && this.usuariosFiltrados.length > 0) {
        this.usuarioSelecionado = this.usuariosFiltrados[0];
    }
  }
  
  onRoleChange(usuario: Usuario, novoPapel: string) {
    if (this.temPapel(usuario, novoPapel)) return;
    this.usuarioParaAlterarStatus = usuario;
    this.novaPermissao = novoPapel;
    
    this.modalConfirmPermissao.open(
        'primary',
        'Confirmar Alteração',
        `Deseja mesmo alterar o papel de ${usuario.nome} para "${novoPapel.replace('ROLE_', '')}"?`
    );
  }

  confirmarAlteracaoStatus() {
    if (!this.usuarioParaAlterarStatus) return;
    this.usuarioService.atualizarAuthorities(this.usuarioParaAlterarStatus.id, this.novaPermissao).subscribe({
      next: () => {
        const index = this.usuarios.findIndex(u => u.id === this.usuarioParaAlterarStatus?.id);
        if (index !== -1) {
          this.usuarios[index].authorities = this.novaPermissao;
          this.filtrarUsuarios();
        }
        this.mostrarAlerta('Permissão atualizada com sucesso!');
        this.modalConfirmPermissao.close();
      },
      error: () => this.mostrarAlerta('Erro ao atualizar a permissão', 'danger')
    });
  }
  
  cancelarAlteracaoStatus() {
    this.modalConfirmPermissao.close();
  }

  abrirModalEditar(usuario: Usuario) {
    this.usuarioParaEditar = { ...usuario };
    this.editarUsuarioModal.show();
  }

  salvarEdicao() {
    this.usuarioService.atualizarUsuario(this.usuarioParaEditar).subscribe({
        next: () => {
          this.carregarUsuarios();
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
          this.carregarUsuarios();
          this.mostrarAlerta('Usuário removido com sucesso!');
          this.modalConfirm.close();
        },
        error: () => this.mostrarAlerta('Erro ao remover usuário.', 'danger')
    });
  }
  
  cancelarRemocao() {
    this.modalConfirm.close();
  }

  temPapel(usuario: Usuario, papel: string): boolean {
    return usuario.authorities === papel;
  }

  mostrarAlerta(mensagem: string, tipo: 'success' | 'danger' = 'success') {
    this.alerta.show(mensagem, 3000, tipo); 
  }
}
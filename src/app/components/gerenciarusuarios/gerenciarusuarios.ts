import { Component, ViewChild } from '@angular/core';
import { Usuario } from '../../model/usuario/usuario.model';
import { UsuarioService } from '../../service/usuario/usuario.service';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../service/auth/auth.service';
import { FormsModule } from '@angular/forms';
import { ModalComponent } from '../../shared/modal/modal';
import { AlertComponent } from '../../shared/alert/alert';
import { ModalConfirmacaoComponent } from '../../shared/modal-confirmacao/modal-confirmacao';
import { SidebarComponent } from '../../shared/sidebar/sidebar';


declare var bootstrap: any;

@Component({
  selector: 'app-gerenciarusuarios',
  imports: [CommonModule, RouterModule, FormsModule, ModalComponent, AlertComponent, ModalConfirmacaoComponent, SidebarComponent],
  templateUrl: './gerenciarusuarios.html',
  styleUrl: './gerenciarusuarios.css'
})
export class Gerenciarusuarios {
  usuarios: Usuario[] = [];
  sidebarOpen = true;
  usuarioSelecionado: Usuario = {} as Usuario; 
  editarUsuarioModal: any; 
  mensagemModalConfirmacao = '';
  usuarioParaRemover!: Usuario;
  mensagemDoModal: string = 'Texto inicial';
  usuarioParaAlterarStatus!: Usuario | null;
  novaPermissao: string = '';

  @ViewChild('modalConfirm') modalConfirm!: ModalConfirmacaoComponent;
  @ViewChild('modalConfirmPermissao') modalConfirmPermissao!: ModalConfirmacaoComponent;
  @ViewChild('meuModal') modal!: ModalComponent;
  @ViewChild('alerta') alerta!: AlertComponent;

  constructor(
    private router: Router,
    private authService: AuthService,
    private usuarioService: UsuarioService
  ) {}

  ngOnInit(): void {
    this.carregarUsuarios();

    const modalElement = document.getElementById('editarUsuarioModal');
    this.editarUsuarioModal = new bootstrap.Modal(modalElement);
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
      error: () => this.abrirModal("Erro ao carregar usuários.")
    });
  }

  toggleSidebar() {
    this.sidebarOpen = !this.sidebarOpen;
  }

  onRoleChange(usuario: Usuario, novoPapel: string) {
    this.usuarioParaAlterarStatus = usuario;
    this.novaPermissao = novoPapel;
    this.mensagemModalConfirmacao = `Confirmar alteração do status para "${novoPapel}" do usuário ${usuario.nome}?`;
    this.modalConfirmPermissao.open();
  }

  confirmarAlteracaoStatus() {
    if (!this.usuarioParaAlterarStatus) return;

    this.usuarioService.atualizarAuthorities(this.usuarioParaAlterarStatus.id, this.novaPermissao).subscribe({
    next: () => {
      this.mostrarAlerta('Permissão atualizada com sucesso!');
    },
      error: () => this.abrirModal('Erro ao atualizar a permissão')
    });

    this.modalConfirmPermissao.close();
    this.usuarioParaAlterarStatus = null;
    this.novaPermissao = '';
  }

  cancelarAlteracaoStatus() {
    this.modalConfirmPermissao.close();
    this.usuarioParaAlterarStatus = null;
    this.novaPermissao = '';
  }

  temPapel(usuario: Usuario, papel: string): boolean {
    return usuario.authorities === papel;
  }

  abrirModalEditar(usuario: Usuario) {
    this.usuarioSelecionado = { ...usuario };
    this.editarUsuarioModal.hide();
    setTimeout(() => this.editarUsuarioModal.show(), 50);
  }

  salvarEdicao() {
    this.usuarioService.atualizarUsuario(this.usuarioSelecionado).subscribe(() => {
      this.carregarUsuarios();
      this.editarUsuarioModal.hide();
      this.mostrarAlerta('Usuário atualizado com sucesso!');
    }, () => {
      this.mostrarAlerta('Erro ao atualizar usuário.');
    });
  }

  removerUsuario(usuario: Usuario) {
    this.usuarioParaRemover = usuario;
    this.mensagemModalConfirmacao = `Tem certeza que deseja remover o usuário ${usuario.nome}?`;
    this.modalConfirm.open();
  }

  confirmarRemocao() {
    this.usuarioService.remover(this.usuarioParaRemover.id).subscribe(() => {
      this.carregarUsuarios();
      this.mostrarAlerta('Removido com sucesso!');
    }, () => {
      this.mostrarAlerta('Erro ao remover usuário.');
    });
  }

  abrirModal(mensagem: string) {
    this.mensagemDoModal = mensagem;
    this.modal.open();
  }
  
  cancelarRemocao() {
    this.modalConfirm.close();
  }

  mostrarAlerta(mensagem: string) {
    this.alerta.show(mensagem, 3000); 
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}

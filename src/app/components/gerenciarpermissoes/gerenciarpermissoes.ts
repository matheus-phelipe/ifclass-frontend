import { Component, ViewChild } from '@angular/core';
import { Usuario } from '../../model/usuario/usuario.model';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../service/auth/auth.service';
import { UsuarioService } from '../../service/usuario/usuario.service';
import { CommonModule } from '@angular/common';
import { ModalConfirmacaoComponent } from '../../shared/modal-confirmacao/modal-confirmacao';
import { AlertComponent } from '../../shared/alert/alert';

@Component({
  selector: 'app-gerenciarpermissoes',
  imports: [CommonModule, RouterModule, AlertComponent, ModalConfirmacaoComponent],
  templateUrl: './gerenciarpermissoes.html',
  styleUrl: './gerenciarpermissoes.css'
})
export class Gerenciarpermissoes {
  usuarios: Usuario[] = [];
  sidebarOpen = true;
  usuarioParaAlterarStatus!: Usuario | null;
  novaPermissao: string = '';
  mensagemModalConfirmacao = '';

  @ViewChild('modalConfirmPermissao') modalConfirmPermissao!: ModalConfirmacaoComponent;
  @ViewChild('alerta') alerta!: AlertComponent;

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
      error: () => this.mostrarAlerta('Erro ao atualizar a permissão')
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

  mostrarAlerta(mensagem: string) {
    this.alerta.show(mensagem, 3000); 
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}

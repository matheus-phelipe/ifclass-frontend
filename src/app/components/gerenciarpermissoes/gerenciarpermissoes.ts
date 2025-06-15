import { Component, OnInit, ViewChild } from '@angular/core';
import { Usuario } from '../../model/usuario/usuario.model';
import { UsuarioService } from '../../service/usuario/usuario.service';
import { CommonModule } from '@angular/common';
import { ModalConfirmacaoComponent } from '../../shared/modal-confirmacao/modal-confirmacao';
import { AlertComponent } from '../../shared/alert/alert';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-gerenciarpermissoes',
  standalone: true,
  // Adicionado o FormsModule aos imports do componente.
  imports: [CommonModule, FormsModule, AlertComponent, ModalConfirmacaoComponent],
  templateUrl: './gerenciarpermissoes.html',
  styleUrls: ['./gerenciarpermissoes.css']
})
export class Gerenciarpermissoes implements OnInit {
  
  usuarios: Usuario[] = []; 
  usuariosFiltrados: Usuario[] = []; 
  termoBusca = '';

  // NOVO: Propriedade para o painel de detalhes
  usuarioSelecionado: Usuario | null = null;

  usuarioParaAlterarStatus!: Usuario | null;
  novaPermissao = '';
  mensagemModalConfirmacao = '';

  @ViewChild('modalConfirmPermissao') modalConfirmPermissao!: ModalConfirmacaoComponent;
  @ViewChild('alerta') alerta!: AlertComponent;

  constructor(
    private usuarioService: UsuarioService
  ) {}

  ngOnInit(): void {
    this.carregarUsuarios();
  }

  carregarUsuarios() {
    this.usuarioService.listarTodos().subscribe({
      next: (data) => {
        this.usuarios = data;
        this.usuariosFiltrados = data;
        // Seleciona o primeiro usuário da lista para exibir no painel de detalhes
        if (this.usuariosFiltrados.length > 0) {
          this.selecionarUsuario(this.usuariosFiltrados[0]);
        }
      },
      error: () => alert("Erro ao carregar usuários.")
    });
  }
  
  // Método para selecionar um usuário e exibi-lo no painel lateral
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
    // Se um usuário estava selecionado, mantém a seleção se ele ainda estiver na lista filtrada
    if (this.usuarioSelecionado && !this.usuariosFiltrados.find(u => u.id === this.usuarioSelecionado?.id)) {
        this.usuarioSelecionado = this.usuariosFiltrados.length > 0 ? this.usuariosFiltrados[0] : null;
    } else if (!this.usuarioSelecionado && this.usuariosFiltrados.length > 0) {
        this.usuarioSelecionado = this.usuariosFiltrados[0];
    }
  }

  onRoleChange(usuario: Usuario, novoPapel: string) {
    if (this.temPapel(usuario, novoPapel)) {
      return;
    }
    this.usuarioParaAlterarStatus = usuario;
    this.novaPermissao = novoPapel;
    this.mensagemModalConfirmacao = `Confirmar alteração do papel para "${novoPapel.replace('ROLE_', '')}" do usuário ${usuario.nome}?`;
    this.modalConfirmPermissao.open();
  }

  confirmarAlteracaoStatus() {
    if (!this.usuarioParaAlterarStatus) return;

    this.usuarioService.atualizarAuthorities(this.usuarioParaAlterarStatus.id, this.novaPermissao).subscribe({
      next: () => {
        const index = this.usuarios.findIndex(u => u.id === this.usuarioParaAlterarStatus?.id);
        if (index !== -1) {
          // Atualiza o estado local para refletir a mudança imediatamente
          this.usuarios[index].authorities = this.novaPermissao;
          this.filtrarUsuarios();
        }
        this.mostrarAlerta('Permissão atualizada com sucesso!');
        // Limpa o estado somente após a operação ser bem-sucedida
        this.modalConfirmPermissao.close();
        this.usuarioParaAlterarStatus = null;
        this.novaPermissao = '';
      },
      error: () => {
        this.mostrarAlerta('Erro ao atualizar a permissão');
        // Limpa o estado também em caso de erro
        this.modalConfirmPermissao.close();
        this.usuarioParaAlterarStatus = null;
        this.novaPermissao = '';
      }
    });
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
}
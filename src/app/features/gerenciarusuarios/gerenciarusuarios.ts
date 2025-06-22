import { Component, ViewChild, OnInit } from '@angular/core';
import { Usuario } from '../usuario/usuario.model';
import { UsuarioService } from '../usuario/usuario.service';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../service/auth/auth.service';
import { FormsModule } from '@angular/forms';
import { AlertComponent } from '../../shared/alert/alert';
import { ModalConfirmacaoComponent } from '../../shared/modal-confirmacao/modal-confirmacao';
import { ProfileSwitcherComponent } from '../../shared/profile-switcher/profile-switcher';

declare var bootstrap: any;

@Component({
  selector: 'app-gerenciarusuarios',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, AlertComponent, ModalConfirmacaoComponent, ProfileSwitcherComponent],
  templateUrl: './gerenciarusuarios.html',
  styleUrls: ['./gerenciarusuarios.css']
})
export class Gerenciarusuarios implements OnInit {
  
  // Propriedade Math para usar no template
  Math = Math;
  
  usuarios: Usuario[] = [];
  usuariosFiltrados: Usuario[] = [];
  termoBusca = '';

  // Propriedades de filtro
  filtroPermissao = 'TODOS';
  permissoesDisponiveis = ['TODOS', 'ROLE_COORDENADOR', 'ROLE_PROFESSOR', 'ROLE_ALUNO'];

  // Propriedades de paginação
  paginaAtual = 1;
  itensPorPagina = 10;
  totalPaginas = 0;
  usuariosPaginados: Usuario[] = [];

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
    public authService: AuthService,
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
        this.filtrarUsuarios();
      },
      error: () => this.mostrarAlerta("Erro ao carregar usuários.", 'danger')
    });
  }
  
  selecionarUsuario(usuario: Usuario): void {
    this.usuarioSelecionado = usuario;
  }

  filtrarPorPermissao(permissao: string): void {
    this.filtroPermissao = permissao;
    this.filtrarUsuarios();
  }

  filtrarUsuarios(): void {
    let usuariosFiltradosTemp = this.usuarios;

    // 1. Filtrar por permissão
    if (this.filtroPermissao !== 'TODOS') {
      usuariosFiltradosTemp = usuariosFiltradosTemp.filter(usuario => 
        usuario.authorities && usuario.authorities.includes(this.filtroPermissao)
      );
    }
    
    // 2. Filtrar por termo de busca
    const busca = this.termoBusca.toLowerCase();
    if (busca) {
      usuariosFiltradosTemp = usuariosFiltradosTemp.filter(usuario =>
        usuario.nome.toLowerCase().includes(busca) ||
        usuario.email.toLowerCase().includes(busca)
      );
    }
    
    this.usuariosFiltrados = usuariosFiltradosTemp;
    
    // Reset para primeira página e recalcular paginação
    this.paginaAtual = 1;
    this.calcularPaginas();
    this.atualizarUsuariosPaginados();
    
    // Atualizar usuário selecionado
    if (this.usuarioSelecionado && !this.usuariosPaginados.some(u => u.id === this.usuarioSelecionado?.id)) {
        this.usuarioSelecionado = this.usuariosPaginados.length > 0 ? this.usuariosPaginados[0] : null;
    } else if (!this.usuarioSelecionado && this.usuariosPaginados.length > 0) {
        this.usuarioSelecionado = this.usuariosPaginados[0];
    }
  }

  // Métodos de paginação
  calcularPaginas(): void {
    this.totalPaginas = Math.ceil(this.usuariosFiltrados.length / this.itensPorPagina);
  }

  atualizarUsuariosPaginados(): void {
    const inicio = (this.paginaAtual - 1) * this.itensPorPagina;
    const fim = inicio + this.itensPorPagina;
    this.usuariosPaginados = this.usuariosFiltrados.slice(inicio, fim);
  }

  irParaPagina(pagina: number): void {
    if (pagina >= 1 && pagina <= this.totalPaginas) {
      this.paginaAtual = pagina;
      this.atualizarUsuariosPaginados();
    }
  }

  paginaAnterior(): void {
    if (this.paginaAtual > 1) {
      this.irParaPagina(this.paginaAtual - 1);
    }
  }

  proximaPagina(): void {
    if (this.paginaAtual < this.totalPaginas) {
      this.irParaPagina(this.paginaAtual + 1);
    }
  }

  getPaginasVisiveis(): number[] {
    const paginas: number[] = [];
    const maxPaginasVisiveis = 5;
    
    if (this.totalPaginas <= maxPaginasVisiveis) {
      // Se temos poucas páginas, mostra todas
      for (let i = 1; i <= this.totalPaginas; i++) {
        paginas.push(i);
      }
    } else {
      // Se temos muitas páginas, mostra um range inteligente
      let inicio = Math.max(1, this.paginaAtual - 2);
      let fim = Math.min(this.totalPaginas, inicio + maxPaginasVisiveis - 1);
      
      // Ajusta o início se estamos no final
      if (fim === this.totalPaginas) {
        inicio = Math.max(1, fim - maxPaginasVisiveis + 1);
      }
      
      for (let i = inicio; i <= fim; i++) {
        paginas.push(i);
      }
    }
    
    return paginas;
  }

  alterarItensPorPagina(): void {
    this.paginaAtual = 1; // Volta para primeira página
    this.calcularPaginas();
    this.atualizarUsuariosPaginados();
  }
  
  formatarNomePermissao(permissao: string): string {
    if (permissao === 'TODOS') return 'Todos';
    const nome = permissao.replace('ROLE_', '').charAt(0).toUpperCase() + permissao.replace('ROLE_', '').slice(1).toLowerCase();
    return nome + 's';
  }

  /**
   * Prepara a alteração de uma permissão para um usuário.
   * Em vez de abrir um modal, calcula as novas permissões e chama o serviço diretamente
   * para uma experiência de usuário mais fluida.
   */
  onRoleChange(usuario: Usuario, papel: string) {
    if (papel === 'ROLE_ADMIN') {
      this.mostrarAlerta('A permissão de Administrador não pode ser alterada pela interface.', 'danger');
      return;
    }
    
    if (!this.authService.isRoleActiveOrHigher('ROLE_ADMIN')) {
      this.mostrarAlerta('Você não tem permissão para alterar papéis.', 'danger');
      return;
    }

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
    if (!this.authService.isRoleActiveOrHigher('ROLE_ADMIN')) return;
    this.usuarioParaEditar = JSON.parse(JSON.stringify(usuario));
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
    if (!this.authService.isRoleActiveOrHigher('ROLE_ADMIN')) return;
    this.usuarioParaRemover = usuario;
    
    // Passa a função de confirmação como um callback para o modal
    const action = () => {
      this.usuarioService.remover(this.usuarioParaRemover.id).subscribe({
          next: () => {
            this.usuarios = this.usuarios.filter(u => u.id !== this.usuarioParaRemover.id);
            this.filtrarUsuarios();
            this.mostrarAlerta('Usuário removido com sucesso!');
          },
          error: () => this.mostrarAlerta('Erro ao remover usuário.', 'danger')
      });
    };
    
    this.modalConfirm.open(
      'danger', 
      'Confirmar Remoção', 
      `Tem certeza que deseja remover o usuário ${usuario.nome}?`,
      action // Passando a função de callback aqui
    );
  }

  // A lógica de cancelamento é necessária para fechar o modal
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
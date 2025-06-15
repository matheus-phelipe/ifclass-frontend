import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AlertComponent } from '../../shared/alert/alert';
import { ModalConfirmacaoComponent } from '../../shared/modal-confirmacao/modal-confirmacao';
import { AuthService } from '../../service/auth/auth.service';
import { CursoService } from '../../service/curso/curso.service';
import { Cursos } from '../../model/curso/curso.model';

declare var bootstrap: any;

@Component({
  selector: 'app-curso',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, AlertComponent, ModalConfirmacaoComponent],
  templateUrl: './curso.html',
  styleUrl: './curso.css'
})
export class Curso implements OnInit {
cursos: Cursos[] = [];
  cursosFiltrados: Cursos[] = [];
  termoBusca = '';

  cursoSelecionado: Cursos | null = null;
  cursoParaEditar: Cursos = {} as Cursos;
  cursoParaRemover!: Cursos;
  cursoParaAlterarStatus!: Cursos | null;
  novaPermissao = '';
  mensagemModalConfirmacao = '';
  
  editarCursoModal: any; 

  @ViewChild('modalConfirm') modalConfirm!: ModalConfirmacaoComponent;
  @ViewChild('modalConfirmPermissao') modalConfirmPermissao!: ModalConfirmacaoComponent;
  @ViewChild('alerta') alerta!: AlertComponent;

  constructor(
    private router: Router,
    private authService: AuthService,
    private cursoService: CursoService
  ) {}

  ngOnInit(): void {
    this.carregarCursos();
    const modalElement = document.getElementById('editarCursoModal');
    if (modalElement) {
      this.editarCursoModal = new bootstrap.Modal(modalElement);
    }
  }

  carregarCursos() {
    this.cursoService.listarTodos().subscribe({
      next: (data) => {
        this.cursos = data;
        this.cursosFiltrados = data;
        if (this.cursosFiltrados.length > 0) {
          this.selecionarCurso(this.cursosFiltrados[0]);
        }
      },
      error: () => this.mostrarAlerta("Erro ao carregar cursos.", 'danger')
    });
  }
  
  selecionarCurso(curso: Cursos): void {
    this.cursoSelecionado = curso;
  }

  filtrarCursos(): void {
    if (!this.termoBusca) {
      this.cursosFiltrados = this.cursos;
    } else {
      this.cursosFiltrados = this.cursos.filter(curso =>
        curso.nome.toLowerCase().includes(this.termoBusca.toLowerCase())
      );
    }
    if (this.cursoSelecionado && !this.cursosFiltrados.find(u => u.id === this.cursoSelecionado?.id)) {
        this.cursoSelecionado = this.cursosFiltrados.length > 0 ? this.cursosFiltrados[0] : null;
    } else if (!this.cursoSelecionado && this.cursosFiltrados.length > 0) {
        this.cursoSelecionado = this.cursosFiltrados[0];
    }
  }
    
  abrirModalEditar(curso: Cursos) {
    this.cursoParaEditar = { ...curso };
    this.editarCursoModal.show();
  }

  salvarEdicao() {
    this.cursoService.atualizarCurso(this.cursoParaEditar).subscribe({
        next: () => {
          this.carregarCursos();
          this.editarCursoModal.hide();
          this.mostrarAlerta('Curso atualizado com sucesso!');
        },
        error: () => this.mostrarAlerta('Erro ao atualizar curso.', 'danger')
    });
  }

  removercurso(curso: Cursos) {
    this.cursoParaRemover = curso;
    this.modalConfirm.open(
        'danger',
        'Confirmar Remoção',
        `Tem certeza que deseja remover o usuário ${curso.nome}? Essa ação não pode ser desfeita.`
    );
  }

  confirmarRemocao() {
    this.cursoService.remover(this.cursoParaRemover.id).subscribe({
        next: () => {
          this.carregarCursos();
          this.mostrarAlerta('Curso removido com sucesso!');
          this.modalConfirm.close();
        },
        error: () => this.mostrarAlerta('Erro ao remover curso.', 'danger')
    });
  }
  
  cancelarRemocao() {
    this.modalConfirm.close();
  }

  mostrarAlerta(mensagem: string, tipo: 'success' | 'danger' = 'success') {
    this.alerta.show(mensagem, 3000, tipo); 
  }
}
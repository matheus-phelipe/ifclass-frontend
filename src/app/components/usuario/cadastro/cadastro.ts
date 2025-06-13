import { ModalComponent } from './../../../shared/modal/modal';
import { Cadastro } from './../../../model/usuario/cadastro.model';
import { UsuarioService } from './../../../service/usuario/usuario.service';
import { Component, ViewChild } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, NgModel } from '@angular/forms';

@Component({
  selector: 'app-cadastro',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, ModalComponent],
  templateUrl: './cadastro.html',
  styleUrl: './cadastro.css'
})
export class CadastroComponent {
  mensagemDoModal: string = '';
  
  mostrarSenha: { [campo: string]: boolean } = {
    senha: false,
    confirmarSenha: false
  };

  @ViewChild('meuModal') modal!: ModalComponent;

  usuario: Cadastro = {
    nome: '',
    prontuario: '',
    email: '',
    senha: '',
    confirmarSenha: ''
  };

  campos: { nome: keyof Cadastro; label: string; tipo: string; placeholder: string; icone: string }[] = [
    { nome: 'nome', label: 'Nome:', tipo: 'text', placeholder: 'Digite seu nome', icone: 'bi-person-fill' },
    { nome: 'prontuario', label: 'Prontuário:', tipo: 'text', placeholder: 'Digite seu prontuário', icone: 'bi-person-badge-fill' },
    { nome: 'email', label: 'Email:', tipo: 'text', placeholder: 'Digite seu email', icone: 'bi-envelope-fill' },
    { nome: 'senha', label: 'Senha:', tipo: 'password', placeholder: 'Digite sua senha', icone: 'bi-eye-slash-fill' },
    { nome: 'confirmarSenha', label: 'Confirmar Senha:', tipo: 'password', placeholder: 'Digite sua senha novamente', icone: 'bi-eye-slash-fill' }
  ];

  constructor(private service: UsuarioService, private router: Router) {}

  cadastrar() {
    if (this.usuario.senha !== this.usuario.confirmarSenha) {
      this.abrirModal("Senhas não coincidem!");
      return;
    }

    const payload = {
      nome: this.usuario.nome,
      email: this.usuario.email,
      senha: this.usuario.senha,
      prontuario: this.usuario.prontuario
    };

    this.service.cadastrar(payload).subscribe({
      next: () => {
        this.abrirModal("Usuário cadastrado com sucesso");
        this.modal.closed.subscribe(() => {
          this.router.navigate(['/login']);
        });    
        },
      error: (err) => {
        this.abrirModal("Erro ao cadastrar usuário!");
      }
    });
  }

  isInvalidField(field: NgModel | undefined): boolean | null {
    return !!field && field.invalid && (field.dirty || field.touched);
  }

  toggleMostrarSenha(campo: 'senha' | 'confirmarSenha') {
    this.mostrarSenha[campo] = !this.mostrarSenha[campo];
  }

  abrirModal(mensagem: string) {
    this.mensagemDoModal = mensagem;
    this.modal.open();
  }
}
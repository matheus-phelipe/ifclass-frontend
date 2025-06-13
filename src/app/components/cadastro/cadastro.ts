import { Component } from '@angular/core';
import { UsuarioService } from '../../service/usuario/usuario.service';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, NgModel } from '@angular/forms';
import { Cadastro } from '../../model/usuario/cadastro.model';

@Component({
  selector: 'app-cadastro',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './cadastro.html',
  styleUrl: './cadastro.css'
})
export class CadastroComponent {
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
    { nome: 'email', label: 'Email:', tipo: 'email', placeholder: 'Digite seu email', icone: 'bi-envelope-fill' },
    { nome: 'senha', label: 'Senha:', tipo: 'password', placeholder: 'Digite sua senha', icone: 'bi-lock-fill' },
    { nome: 'confirmarSenha', label: 'Confirmar Senha:', tipo: 'password', placeholder: 'Digite sua senha novamente', icone: 'bi-lock-fill' }
  ];

  constructor(private service: UsuarioService, private router: Router) {}

  cadastrar() {
    if (this.usuario.senha !== this.usuario.confirmarSenha) {
      alert('As senhas não coincidem');
      return;
    }

    const payload = {
      nome: this.usuario.nome,
      email: this.usuario.email,
      senha: this.usuario.senha,
      prontuario: this.usuario.prontuario
    };

    this.service.salvar(payload).subscribe({
      next: () => {
        alert('Usuário cadastrado com sucesso!');
        this.router.navigate(['/login']);
      },
      error: (err) => {
        alert('Erro ao cadastrar usuário');
      }
    });
  }

  isInvalidField(field: NgModel | undefined): boolean | null {
    return !!field && field.invalid && (field.dirty || field.touched);
  }
}
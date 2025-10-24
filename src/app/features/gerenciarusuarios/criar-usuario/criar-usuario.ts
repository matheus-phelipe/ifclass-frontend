import { Component, EventEmitter, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { UsuarioService } from '../../usuario/usuario.service';
import { UsuarioCreate } from '../../usuario/usuario.model';
import { NotificationService } from '../../../shared/sweetalert/notification.service';

@Component({
  selector: 'app-criar-usuario',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './criar-usuario.html',
  styleUrls: ['./criar-usuario.css']
})
export class CriarUsuario {
  @Output() fechar = new EventEmitter<void>();

  nome: string = '';
  email: string = '';
  senha: string = '';
  prontuario: string = '';
  permissoes: string[] = [];

  permissoesSelecionadas: { [key: string]: boolean } = {
    ROLE_ALUNO: false,
    ROLE_PROFESSOR: false,
    ROLE_COORDENADOR: false,
    ROLE_ADMIN: false
  };

  constructor(
    private usuarioService: UsuarioService,
    private notificationService: NotificationService
  ) {}

  criarConta() {
    // Cria o array de authorities apenas com as chaves marcadas como true
    const authorities = Object.entries(this.permissoesSelecionadas)
      .filter(([_, checked]) => !!checked)
      .map(([role, _]) => role);

    console.log('permissoesSelecionadas', this.permissoesSelecionadas);
    console.log('authorities a enviar', authorities);

    const novoUsuario: UsuarioCreate = {
      nome: this.nome,
      email: this.email,
      senha: this.senha,
      prontuario: this.prontuario,
      authorities
    };

    this.usuarioService.cadastrar(novoUsuario).subscribe({
      next: (res) => {
        this.notificationService.success('Sucesso!', `Usuário ${res.nome} criado com sucesso!`);
        this.fechar.emit();
      },
      error: (err) => {
        let errorMessage = 'Erro ao criar usuário';
        
        if (err.error?.error) {
          if (err.error.error.includes('Email já cadastrado')) {
            errorMessage = 'Este email já está sendo usado por outro usuário.';
          } else if (err.error.error.includes('Prontuário já cadastrado')) {
            errorMessage = 'Este prontuário já está sendo usado por outro usuário.';
          } else {
            errorMessage = err.error.error;
          }
        } else if (err.error?.message) {
          errorMessage = err.error.message;
        }
        
        this.notificationService.error('Erro!', errorMessage);
      }
    });
  }
}

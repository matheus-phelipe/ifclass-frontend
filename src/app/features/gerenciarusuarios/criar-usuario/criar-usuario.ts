import { Component, EventEmitter, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { UsuarioService } from '../../usuario/usuario.service';
import { UsuarioCreate } from '../../usuario/usuario.model';

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

  constructor(private usuarioService: UsuarioService) {}

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
        alert(`Usuário ${res.nome} criado com sucesso!`);
        this.fechar.emit();
      },
      error: (err) => {
        alert('Erro ao criar usuário: ' + (err.error?.message || 'desconhecido'));
      }
    });
  }
}

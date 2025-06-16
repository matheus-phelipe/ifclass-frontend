import { ModalComponent } from './../../../shared/modal/modal';
import { AuthService } from './../../../service/auth/auth.service';
import { UsuarioService } from './../../../service/usuario/usuario.service';
import { Login } from './../../../model/usuario/login.model';
import { CommonModule } from '@angular/common';
import { Component, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink, RouterModule } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.css'
})

export class LoginComponent {
  mensagemDoModal: string = 'Texto inicial';
  mostrarSenha: boolean = false;

  @ViewChild('meuModal') modal!: ModalComponent;

  credenciais: Login = {
    email: '',
    senha:''
  };

  constructor(private service: UsuarioService, private router: Router, private authService: AuthService) {}

  login(){
    this.authService.login(this.credenciais.email, this.credenciais.senha).subscribe({
      next: (res) => {
        this.authService.salvarToken(res.token);
        this.router.navigate(['/home']);
      },
      error: () => {
        this.abrirModal('Credenciais inválidas');
      }
    });
  }

  abrirModal(mensagem: string) {
    this.mensagemDoModal = mensagem;
    this.modal.open();
  }
}

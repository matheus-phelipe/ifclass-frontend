// login.ts
import { ModalComponent } from './../../../shared/modal/modal';
import { AuthService } from './../../../service/auth/auth.service';
import { UsuarioService } from './../../../service/usuario/usuario.service';
import { Login } from './../../../model/usuario/login.model';
import { CommonModule } from '@angular/common';
import { Component, ViewChild, OnInit } from '@angular/core'; // Importe OnInit
import { FormsModule } from '@angular/forms';
import { Router, RouterLink, RouterModule } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.css'
})

// Implemente OnInit
export class LoginComponent implements OnInit {
  mensagemDoModal: string = 'Texto inicial';
  mostrarSenha: boolean = false;
  lembrarMe: boolean = false; // Nova propriedade para o checkbox

  @ViewChild('meuModal') modal!: ModalComponent;

  credenciais: Login = {
    email: '',
    senha:''
  };

  constructor(private service: UsuarioService, private router: Router, private authService: AuthService) {}

  // Adicione o método ngOnInit
  ngOnInit(): void {
    // Tenta carregar o email salvo no localStorage
    const savedEmail = localStorage.getItem('rememberedEmail');
    const rememberMeFlag = localStorage.getItem('rememberMeFlag');

    if (savedEmail && rememberMeFlag === 'true') {
      this.credenciais.email = savedEmail;
      this.lembrarMe = true;
    }
  }

  login(){
    this.authService.login(this.credenciais.email, this.credenciais.senha).subscribe({
      next: (res) => {
        this.authService.salvarToken(res.token);

        // Lógica para "Lembrar-me"
        if (this.lembrarMe) {
          localStorage.setItem('rememberedEmail', this.credenciais.email);
          localStorage.setItem('rememberMeFlag', 'true');
        } else {
          localStorage.removeItem('rememberedEmail');
          localStorage.setItem('rememberMeFlag', 'false');
        }

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
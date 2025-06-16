// login.ts
import { AlertComponent } from './../../../shared/alert/alert'; // Importe AlertComponent
// Remova: import { ModalComponent } from './../../../shared/modal/modal';
import { AuthService } from './../../../service/auth/auth.service';
import { UsuarioService } from './../../../service/usuario/usuario.service';
import { Login } from './../../../model/usuario/login.model';
import { CommonModule } from '@angular/common';
import { Component, ViewChild, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink, RouterModule } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, RouterLink, AlertComponent], // Adicionado AlertComponent
  templateUrl: './login.html',
  styleUrls: ['./login.css'] // Corrigido para styleUrls
})
export class LoginComponent implements OnInit {
  // Remova: mensagemDoModal: string = 'Texto inicial';
  mostrarSenha: boolean = false;
  lembrarMe: boolean = false;

  // Remova: @ViewChild('meuModal') modal!: ModalComponent;
  @ViewChild('alerta') alerta!: AlertComponent; // Adicionado para exibir alertas

  credenciais: Login = {
    email: '',
    senha:''
  };

  constructor(private service: UsuarioService, private router: Router, private authService: AuthService) {}

  ngOnInit(): void {
    const savedEmail = localStorage.getItem('rememberedEmail');
    const rememberMeFlag = localStorage.getItem('rememberMeFlag');

    if (savedEmail && rememberMeFlag === 'true') {
      this.credenciais.email = savedEmail;
      this.lembrarMe = true;
    }
  }

  login() {
    this.authService.login(this.credenciais.email, this.credenciais.senha).subscribe({
      next: (res) => {
        this.authService.salvarToken(res.token);

        if (this.lembrarMe) {
          localStorage.setItem('rememberedEmail', this.credenciais.email);
          localStorage.setItem('rememberMeFlag', 'true');
        } else {
          localStorage.removeItem('rememberedEmail');
          localStorage.setItem('rememberMeFlag', 'false');
        }

        // --- LÓGICA DE REDIRECIONAMENTO ADAPTADA ---
        const roles = this.authService.getRoles();
        
        if (roles.includes('ROLE_ALUNO') && roles.length === 1) {
          this.router.navigate(['/aluno/mapa']);
        } else {
          // Para todos os outros (Admin, Coordenador, etc.)
          this.router.navigate(['/app/home']);
        }
      },
      error: () => {
        this.alerta.show('Credenciais inválidas.', 3000, 'danger');
      }
    });
  }
}
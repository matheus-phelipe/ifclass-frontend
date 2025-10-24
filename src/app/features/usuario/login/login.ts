// login.ts
import { AlertComponent } from './../../../shared/alert/alert'; // Importe AlertComponent
// Remova: import { ModalComponent } from './../../../shared/modal/modal';
import { AuthService } from './../../../service/auth/auth.service';
import { UsuarioService } from '../usuario.service';
import { Login } from './login.model';
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
  mostrarSenha: boolean = false;
  lembrarMe: boolean = false;

  @ViewChild('alerta') alerta!: AlertComponent;

  credenciais: Login = {
    email: '',
    senha:''
  };

  constructor(private service: UsuarioService, private router: Router, private authService: AuthService) {}

  ngOnInit(): void {
    // Verifica se já está autenticado (evita login duplo)
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/app/home']);
      return;
    }

    const savedEmail = localStorage.getItem('rememberedEmail');
    const rememberMeFlag = localStorage.getItem('rememberMeFlag');

    if (savedEmail && rememberMeFlag === 'true') {
      this.credenciais.email = savedEmail;
      this.lembrarMe = true;
    }
  }

  login() {
    // Limpa qualquer estado anterior antes do login (sem navegar)
    this.authService.clearAuthState();
    
    this.authService.login(this.credenciais.email, this.credenciais.senha).subscribe({
      next: (response) => {
        // Salva o token
        this.authService.salvarToken(response.token);

        // Salva email se "lembrar-me" estiver marcado
        if (this.lembrarMe) {
          localStorage.setItem('rememberedEmail', this.credenciais.email);
          localStorage.setItem('rememberMeFlag', 'true');
        } else {
          localStorage.removeItem('rememberedEmail');
          localStorage.removeItem('rememberMeFlag');
        }

        // Determina o perfil ativo
        const availableRoles = this.authService.getAvailableRoles();
        const isStudent = availableRoles.includes('ROLE_ALUNO');

        if (isStudent) {
          this.authService.setActiveRole('ROLE_ALUNO');
          this.router.navigate(['/aluno/mapa']);
        } else {
          const primaryRole = availableRoles.length > 0 ? availableRoles[0] : null;
          if (primaryRole) {
            this.authService.setActiveRole(primaryRole);
          }
          this.router.navigate(['/app/home']);
        }
      },
      error: (error) => {
        console.error('Erro no login:', error);
        // Mostra erro específico se disponível
        const errorMessage = error.error?.message || 'Erro ao fazer login. Tente novamente.';
        this.mostrarAlerta(errorMessage, 'danger');
      }
    });
  }

   mostrarAlerta(mensagem: string, tipo: 'success' | 'danger' = 'success') {
    this.alerta.show(mensagem, 3000, tipo); 
  }
}
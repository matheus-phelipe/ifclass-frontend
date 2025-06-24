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
    const savedEmail = localStorage.getItem('rememberedEmail');
    const rememberMeFlag = localStorage.getItem('rememberMeFlag');

    if (savedEmail && rememberMeFlag === 'true') {
      this.credenciais.email = savedEmail;
      this.lembrarMe = true;
    }
  }

  login() {
    this.authService.login(this.credenciais.email, this.credenciais.senha).subscribe({
      next: (response) => {
        this.authService.salvarToken(response.token);

        const availableRoles = this.authService.getAvailableRoles();

        // Se o usuário tem múltiplas roles, define a mais alta como ativa
        if (availableRoles.length > 1) {
          // Hierarquia: ADMIN > COORDENADOR > PROFESSOR > ALUNO
          if (availableRoles.includes('ROLE_ADMIN')) {
            this.authService.setActiveRole('ROLE_ADMIN');
          } else if (availableRoles.includes('ROLE_COORDENADOR')) {
            this.authService.setActiveRole('ROLE_COORDENADOR');
          } else if (availableRoles.includes('ROLE_PROFESSOR')) {
            this.authService.setActiveRole('ROLE_PROFESSOR');
          } else {
            this.authService.setActiveRole('ROLE_ALUNO');
          }
          this.router.navigate(['/app/home']);
        } else {
          // Se tem apenas uma role
          const singleRole = availableRoles[0];
          this.authService.setActiveRole(singleRole);

          if (singleRole === 'ROLE_ALUNO') {
            this.router.navigate(['/aluno/mapa']);
          } else {
            this.router.navigate(['/app/home']);
          }
        }
      }
    });
  }

   mostrarAlerta(mensagem: string, tipo: 'success' | 'danger' = 'success') {
    this.alerta.show(mensagem, 3000, tipo); 
  }
}
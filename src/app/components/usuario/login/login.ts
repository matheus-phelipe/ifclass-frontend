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
        const isStudent = availableRoles.includes('ROLE_ALUNO');

        // REGRA: Se tem a permissão de ALUNO e outra permissão (ex: PROFESSOR)
        if (isStudent) {
          // Se o usuário TEM A PERMISSÃO DE ALUNO, o destino inicial SEMPRE será a visão de aluno.
          // Isso cobre tanto o caso "só aluno" quanto "aluno + outras permissões".
          // O Profile Switcher aparecerá para o usuário com múltiplos papéis.
          this.authService.setActiveRole('ROLE_ALUNO');
          this.router.navigate(['/aluno/mapa']);
        } else {
          // REGRA: Para todos os outros casos (só admin, só professor, etc.)
          // Define o primeiro perfil da lista como ativo
          const primaryRole = availableRoles.length > 0 ? availableRoles[0] : null;
          if (primaryRole) {
            this.authService.setActiveRole(primaryRole);
          }
          // Redireciona para a home principal
          this.router.navigate(['/app/home']);
        }
      },
      error: (err) => {
        this.mostrarAlerta('Credenciais inválidas!', 'danger');
      }
    });
  }

   mostrarAlerta(mensagem: string, tipo: 'success' | 'danger' = 'success') {
    this.alerta.show(mensagem, 3000, tipo); 
  }
}
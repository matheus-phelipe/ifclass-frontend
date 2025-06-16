import { Component, OnInit, ViewChild } from '@angular/core';
import { ModalComponent } from '../../../shared/modal/modal';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../service/auth/auth.service';

@Component({
  selector: 'app-resetar-senha',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, ModalComponent],
  templateUrl: './resetar-senha.html',
  styleUrl: './resetar-senha.css'
})
export class ResetarSenhaComponent implements OnInit { // Implemente OnInit
  email: string = '';
  token: string | null = null; // Para capturar o token da URL
  newPassword: string = '';
  confirmNewPassword: string = '';
  showResetForm: boolean = false; // Controla qual parte do formulário mostrar
  mensagemDoModal: string = '';

  @ViewChild('meuModal') modal!: ModalComponent;

  constructor(
    private router: Router,
    private route: ActivatedRoute, // Para acessar parâmetros da URL
    private authService: AuthService // Injete o AuthService
  ) {}

  ngOnInit(): void {
    // Tenta pegar o token da URL (ex: /reset-password?token=SEU_TOKEN_AQUI)
    this.route.queryParams.subscribe(params => {
      this.token = params['token'] || null;
      if (this.token) {
        this.showResetForm = true; // Se tiver token, mostra o formulário de nova senha
      } else {
        this.showResetForm = false; // Se não tiver, mostra o formulário de solicitar link
      }
    });
  }

  // Método para solicitar o link de redefinição de senha
  sendResetLink() {
    if (!this.email) {
      this.abrirModal('Por favor, digite seu e-mail.');
      return;
    }

    this.authService.requestPasswordReset(this.email).subscribe({
      next: () => {
        this.abrirModal('Se o e-mail estiver cadastrado, um link de redefinição foi enviado para ' + this.email + '. Por favor, verifique sua caixa de entrada.');
        this.modal.closed.subscribe(() => {
          this.router.navigate(['/login']);
        });
      },
      error: (err) => {
        // Para segurança, é melhor não informar se o email existe ou não.
        // A mensagem deve ser genérica.
        this.abrirModal('Ocorreu um erro ao processar sua solicitação. Por favor, tente novamente.');
        console.error('Erro ao solicitar redefinição de senha:', err);
      }
    });
  }

  // Método para redefinir a senha usando o token
  resetPasswordConfirmed() {
    if (!this.token) {
      this.abrirModal('Token de redefinição inválido ou ausente.');
      this.router.navigate(['/resetar-senha']); // Redireciona para o início do processo
      return;
    }

    if (this.newPassword !== this.confirmNewPassword) {
      this.abrirModal('As senhas não coincidem.');
      return;
    }

    if (this.newPassword.length < 6) { // Adicione sua validação de senha aqui
      this.abrirModal('A nova senha deve ter no mínimo 6 caracteres.');
      return;
    }

    this.authService.resetPassword(this.token, this.newPassword).subscribe({
      next: () => {
        this.abrirModal('Sua senha foi redefinida com sucesso! Você já pode fazer login com a nova senha.');
        this.modal.closed.subscribe(() => {
          this.router.navigate(['/login']); // Redireciona para o login
        });
      },
      error: (err) => {
        let errorMessage = 'Ocorreu um erro ao redefinir sua senha. O link pode ter expirado ou ser inválido.';
        if (err.status === 400 && err.error && err.error.message) {
            errorMessage = err.error.message; // Exemplo: "Token expirado" do back-end
        }
        this.abrirModal(errorMessage);
        console.error('Erro ao redefinir senha:', err);
        // Opcional: redirecionar para /reset-password se o token for inválido/expirado
        if (err.status === 400) { // Exemplo de status para token inválido/expirado
             this.router.navigate(['/resetar-senha']);
        }
      }
    });
  }

  abrirModal(mensagem: string) {
    this.mensagemDoModal = mensagem;
    this.modal.open();
  }
}

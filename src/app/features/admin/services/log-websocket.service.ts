import { Injectable } from '@angular/core';
import { Client, IMessage } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { Subject } from 'rxjs';
import { LogSistema } from './admin.service'; // Reutilizando a interface que você já tem

@Injectable({
  providedIn: 'root'
})
export class LogWebsocketService {

  private stompClient: Client;
  private logSubject = new Subject<LogSistema>();

  // Onde recebe os logs
  public log$ = this.logSubject.asObservable();

  constructor() {
    this.stompClient = new Client({
      // Cria o WebSocket que usa SockJS para se conectar ao endpoint do Spring Boot
      webSocketFactory: () => new SockJS('http://localhost:8080/ws-logs'),

      //Mostra logs de debug da própria conexão no console do navegador
      debug: (str) => { console.log(new Date(), str); },

      // Tenta reconectar a cada 5 segundos se a conexão cair
      reconnectDelay: 5000,
    });

    // O que fazer quando a conexão for bem-sucedida
    this.stompClient.onConnect = (frame) => {
      console.log('Conectado ao WebSocket de Logs: ' + frame);

      // Se conectou bem, inscreve-se no canal de logs
      this.stompClient.subscribe('/topic/logs', (message: IMessage) => {
        // Converte a mensagem recebida (que é uma string JSON) para um objeto LogSistema
        const log: LogSistema = JSON.parse(message.body);
        // Emite o novo log para todos os "ouvintes" do (log$)
        this.logSubject.next(log);
      });
    };

    // O que fazer se houver um erro na conexão STOMP
    this.stompClient.onStompError = (frame) => {
      console.error('Erro no Broker STOMP: ' + frame.headers['message']);
      console.error('Detalhes do erro: ' + frame.body);
    };
  }

  // Método público para iniciar a conexão
  connect(): void {
    if (!this.stompClient.active) {
      this.stompClient.activate();
    }
  }

  // Método público para encerrar a conexão
  disconnect(): void {
    if (this.stompClient.active) {
      this.stompClient.deactivate();
    }
  }
}

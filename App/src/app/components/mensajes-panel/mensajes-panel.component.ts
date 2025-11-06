import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MensajeService, Mensaje, Chat } from '../../services/mensaje.service';
import { AlertService } from '../../services/alert.service';

@Component({
  selector: 'app-mensajes-panel',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './mensajes-panel.component.html',
  styles: [
    `
      .mensajes-container {
        display: flex;
        height: 100%;
        gap: 0;
        background: white;
        border-radius: 8px;
        overflow: hidden;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      }

      /* Sidebar de chats */
      .chats-sidebar {
        width: 300px;
        border-right: 1px solid #e0e0e0;
        display: flex;
        flex-direction: column;
        background: #f9f9f9;
      }

      .chats-header {
        padding: 16px;
        border-bottom: 1px solid #e0e0e0;
        background: white;
      }

      .chats-header h3 {
        margin: 0;
        color: #4a1d4a;
        font-size: 18px;
        font-weight: 600;
      }

      .chats-list {
        flex: 1;
        overflow-y: auto;
        list-style: none;
        padding: 0;
        margin: 0;
      }

      .chat-item {
        padding: 12px 16px;
        border-bottom: 1px solid #e0e0e0;
        cursor: pointer;
        transition: all 0.2s ease;
        display: flex;
        flex-direction: column;
        gap: 4px;
      }

      .chat-item:hover {
        background: #f0f0f0;
      }

      .chat-item.active {
        background: #4a1d4a;
        color: white;
      }

      .chat-telefono {
        font-weight: 600;
        font-size: 14px;
      }

      .chat-preview {
        font-size: 12px;
        opacity: 0.7;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .chat-time {
        font-size: 11px;
        opacity: 0.6;
      }

      .empty-chats {
        padding: 20px;
        text-align: center;
        color: #999;
      }

      /* Panel de chat */
      .chat-panel {
        flex: 1;
        display: flex;
        flex-direction: column;
      }

      .chat-header {
        padding: 16px;
        border-bottom: 1px solid #e0e0e0;
        background: white;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      .chat-header h2 {
        margin: 0;
        color: #4a1d4a;
        font-size: 18px;
        font-weight: 600;
      }

      .chat-messages {
        flex: 1;
        overflow-y: auto;
        padding: 16px;
        display: flex;
        flex-direction: column;
        gap: 12px;
        background: #f5f5f5;
      }

      .message {
        display: flex;
        gap: 8px;
        animation: slideIn 0.3s ease;
      }

      @keyframes slideIn {
        from {
          opacity: 0;
          transform: translateY(10px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      .message.admin {
        justify-content: flex-end;
      }

      .message-bubble {
        max-width: 70%;
        padding: 12px 16px;
        border-radius: 12px;
        word-wrap: break-word;
      }

      .message.admin .message-bubble {
        background: #4a1d4a;
        color: white;
        border-bottom-right-radius: 4px;
      }

      .message.cliente .message-bubble {
        background: white;
        color: #333;
        border: 1px solid #e0e0e0;
        border-bottom-left-radius: 4px;
      }

      .message-time {
        font-size: 11px;
        opacity: 0.6;
        margin-top: 4px;
      }

      .empty-chat {
        display: flex;
        align-items: center;
        justify-content: center;
        height: 100%;
        color: #999;
        font-size: 16px;
      }

      /* Input de mensaje */
      .chat-input-area {
        padding: 16px;
        border-top: 1px solid #e0e0e0;
        background: white;
        display: flex;
        gap: 8px;
      }

      .message-input {
        flex: 1;
        padding: 10px 12px;
        border: 1px solid #e0e0e0;
        border-radius: 6px;
        font-size: 14px;
        resize: none;
        max-height: 100px;
        font-family: inherit;
      }

      .message-input:focus {
        outline: none;
        border-color: #4a1d4a;
        box-shadow: 0 0 0 3px rgba(74, 29, 74, 0.1);
      }

      .btn-send {
        padding: 10px 20px;
        background: #4a1d4a;
        color: white;
        border: none;
        border-radius: 6px;
        cursor: pointer;
        font-weight: 600;
        transition: all 0.2s ease;
        white-space: nowrap;
      }

      .btn-send:hover {
        background: #331333;
        transform: translateY(-1px);
      }

      .btn-send:active {
        transform: translateY(0);
      }

      .btn-send:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }

      /* Loading state */
      .loading-container {
        display: flex;
        align-items: center;
        justify-content: center;
        height: 100%;
        color: #999;
      }

      .loading-spinner {
        border: 3px solid #f3f3f3;
        border-top: 3px solid #4a1d4a;
        border-radius: 50%;
        width: 40px;
        height: 40px;
        animation: spin 1s linear infinite;
        margin-right: 12px;
      }

      @keyframes spin {
        0% {
          transform: rotate(0deg);
        }
        100% {
          transform: rotate(360deg);
        }
      }

      /* Responsive */
      @media (max-width: 768px) {
        .chats-sidebar {
          width: 100%;
          max-height: 200px;
          border-right: none;
          border-bottom: 1px solid #e0e0e0;
        }

        .mensajes-container {
          flex-direction: column;
        }

        .chat-panel {
          flex: 1;
        }

        .message-bubble {
          max-width: 90%;
        }
      }
    `,
  ],
})
export class MensajesPanelComponent implements OnInit {
  chats: Chat[] = [];
  selectedChat: Chat | null = null;
  mensajes: Mensaje[] = [];
  nuevoMensaje: string = '';

  isLoadingChats: boolean = false;
  isLoadingMensajes: boolean = false;
  isSending: boolean = false;
  chatsError: string | null = null;
  mensajesError: string | null = null;

  constructor(
    private mensajeService: MensajeService,
    private alertService: AlertService
  ) {}

  ngOnInit(): void {
    this.loadChats();
  }

  /**
   * Carga la lista de chats
   */
  loadChats(): void {
    this.isLoadingChats = true;
    this.chatsError = null;

    this.mensajeService.getChats().subscribe({
      next: (response) => {
        if (response.success) {
          this.chats = response.data;
          // Seleccionar el primer chat automáticamente
          if (this.chats.length > 0 && !this.selectedChat) {
            this.selectChat(this.chats[0]);
          }
        } else {
          this.chatsError = 'Error al cargar los chats';
        }
        this.isLoadingChats = false;
      },
      error: (error) => {
        console.error('Error al cargar chats:', error);
        this.chatsError = 'No se pudieron cargar los chats';
        this.isLoadingChats = false;
      },
    });
  }

  /**
   * Selecciona un chat y carga sus mensajes
   */
  selectChat(chat: Chat): void {
    this.selectedChat = chat;
    this.loadMensajes(chat.telefono);
  }

  /**
   * Carga los mensajes de un teléfono específico
   */
  loadMensajes(telefono: string): void {
    this.isLoadingMensajes = true;
    this.mensajesError = null;

    this.mensajeService.getMensajesByTelefono(telefono).subscribe({
      next: (response) => {
        if (response.success) {
          this.mensajes = response.data;
          // Scroll al último mensaje
          setTimeout(() => this.scrollToBottom(), 100);
        } else {
          this.mensajesError = 'Error al cargar los mensajes';
        }
        this.isLoadingMensajes = false;
      },
      error: (error) => {
        console.error('Error al cargar mensajes:', error);
        this.mensajesError = 'No se pudieron cargar los mensajes';
        this.isLoadingMensajes = false;
      },
    });
  }

  /**
   * Envía un nuevo mensaje
   */
  enviarMensaje(): void {
    if (!this.selectedChat || !this.nuevoMensaje.trim()) {
      return;
    }

    this.isSending = true;

    this.mensajeService
      .createMensaje(this.selectedChat.telefono, this.nuevoMensaje.trim(), true)
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.mensajes.push(response.data);
            this.nuevoMensaje = '';
            this.alertService.showSuccess('Mensaje enviado');
            setTimeout(() => this.scrollToBottom(), 100);
          } else {
            this.alertService.showError('Error al enviar el mensaje');
          }
          this.isSending = false;
        },
        error: (error) => {
          console.error('Error al enviar mensaje:', error);
          this.alertService.showError('No se pudo enviar el mensaje');
          this.isSending = false;
        },
      });
  }

  /**
   * Formatea la fecha y hora
   */
  formatTime(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  /**
   * Scroll al último mensaje
   */
  private scrollToBottom(): void {
    const messagesContainer = document.querySelector('.chat-messages');
    if (messagesContainer) {
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
  }

  /**
   * Maneja el Enter en el input
   */
  onKeyPress(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.enviarMensaje();
    }
  }
}

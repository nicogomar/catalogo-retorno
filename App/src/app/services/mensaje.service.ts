import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

/**
 * Interfaz para representar un mensaje
 */
export interface Mensaje {
  id?: number;
  telefono: string;
  mensaje: string;
  es_admin: boolean;
  created_at: string;
}

/**
 * Interfaz para un chat
 */
export interface Chat {
  telefono: string;
  lastMessage: string;
  lastMessageTime: string;
}

/**
 * Interfaz para la respuesta de mensajes
 */
export interface MensajesResponse {
  success: boolean;
  data: Mensaje[];
  count: number;
}

/**
 * Interfaz para la respuesta de chats
 */
export interface ChatsResponse {
  success: boolean;
  data: Chat[];
  count: number;
}

/**
 * Interfaz para la respuesta de crear mensaje
 */
export interface CreateMensajeResponse {
  success: boolean;
  message: string;
  data: Mensaje;
}

/**
 * Interfaz para la respuesta de eliminar mensaje
 */
export interface DeleteMensajeResponse {
  success: boolean;
  message: string;
}

/**
 * Interfaz para la respuesta de contar mensajes
 */
export interface MensajesCountResponse {
  success: boolean;
  data: {
    count: number;
  };
}

@Injectable({
  providedIn: 'root',
})
export class MensajeService {
  private readonly apiUrl = `${environment.apiUrl}/mensajes`;

  constructor(private http: HttpClient) {}

  /**
   * Obtiene todos los chats agrupados por teléfono
   * @returns Observable con la respuesta de chats
   */
  getChats(): Observable<ChatsResponse> {
    return this.http.get<ChatsResponse>(`${this.apiUrl}/chats`);
  }

  /**
   * Obtiene todos los mensajes de un teléfono específico
   * @param telefono Número de teléfono
   * @returns Observable con la respuesta de mensajes
   */
  getMensajesByTelefono(telefono: string): Observable<MensajesResponse> {
    return this.http.get<MensajesResponse>(
      `${this.apiUrl}/telefono/${encodeURIComponent(telefono)}`
    );
  }

  /**
   * Crea un nuevo mensaje
   * @param telefono Número de teléfono
   * @param mensaje Contenido del mensaje
   * @param esAdmin Si es un mensaje del admin
   * @returns Observable con la respuesta
   */
  createMensaje(
    telefono: string,
    mensaje: string,
    esAdmin: boolean = true
  ): Observable<CreateMensajeResponse> {
    return this.http.post<CreateMensajeResponse>(`${this.apiUrl}`, {
      telefono,
      mensaje,
      esAdmin,
    });
  }

  /**
   * Elimina un mensaje
   * @param id ID del mensaje
   * @returns Observable con la respuesta
   */
  deleteMensaje(id: number): Observable<DeleteMensajeResponse> {
    return this.http.delete<DeleteMensajeResponse>(
      `${this.apiUrl}/${id}`
    );
  }

  /**
   * Obtiene la cantidad total de mensajes
   * @returns Observable con la respuesta
   */
  getMensajesCount(): Observable<MensajesCountResponse> {
    return this.http.get<MensajesCountResponse>(`${this.apiUrl}/count`);
  }
}

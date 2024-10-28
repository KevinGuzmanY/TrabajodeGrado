import { Component } from '@angular/core';
import {AuthService} from "../../services/auth.service";
import {ToastrService} from "ngx-toastr";

@Component({
  selector: 'app-notificaciones',
  templateUrl: './notificaciones.component.html',
  styleUrl: './notificaciones.component.scss'
})
export class NotificacionesComponent {
  userRole: string = '';
  userId: string = '';
  mensajes: Array<{ id: string; titulo: string; contenido: string; hora: string; leido: boolean }> = [];
  nuevoMensaje: string = '';

  constructor(private authService: AuthService,private toastr: ToastrService) {}

  ngOnInit(): void {
    // Obtener el rol y el ID del usuario desde localStorage
    this.userRole = localStorage.getItem('rol') || '';
    this.userId = localStorage.getItem('user_id') || '';

    // Cargar las notificaciones del usuario
    this.obtenerNotificaciones();
  }

  obtenerNotificaciones(): void {
    if (this.userId) {
      this.authService.getUserNotifications(this.userId).subscribe(
        (notificaciones) => {
          // Mapear las notificaciones recibidas al formato de mensajes
          this.mensajes = notificaciones.map((notificacion: any) => ({
            id: notificacion.notification_id,
            titulo: notificacion.titulo || 'Notificación',
            contenido: notificacion.message,
            hora: notificacion.created_at,
            leido: notificacion.is_read || false
          }));
          console.log((this.mensajes))
        },
        (error) => {
          console.error('Error al obtener notificaciones:', error);
        }
      );
    }
  }

  agregarMensaje(): void {
    if (this.userRole === 'admin' && this.nuevoMensaje.trim()) {
      // Enviar notificación a todos los usuarios
      this.authService.sendNotificationToAllUsers(this.nuevoMensaje).subscribe(
        () => {
          // Recargar las notificaciones tras enviar una nueva
          this.obtenerNotificaciones();
          this.nuevoMensaje = ''; // Limpiar el campo de entrada
          this.toastr.success("Mensaje Enviado");
        },
        (error) => {
          console.error('Error al enviar notificación:', error);
        }
      );
    }
  }

  marcarComoLeido(mensajeId: string): void {
    this.authService.markNotificationAsRead(mensajeId).subscribe(
      () => {
        // Actualizar el estado de la notificación localmente
        const mensaje = this.mensajes.find(msg => msg.id === mensajeId);
        if (mensaje) {
          mensaje.leido = true;
        }
        this.toastr.success("Marcado Como Leido");
      },
      (error) => {
        console.error('Error al marcar la notificación como leída:', error);
      }
    );
  }
}

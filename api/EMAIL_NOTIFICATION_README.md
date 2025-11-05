# Email Notification Service Documentation

Esta documentación describe la implementación del servicio de notificaciones por correo electrónico que permite enviar confirmaciones cuando se crea o actualiza una orden en la aplicación.

## Características

- Envío de notificaciones por correo electrónico cuando se crea un nuevo pedido
- Notificaciones a los administradores sobre nuevos pedidos
- Confirmación por correo al cliente cuando se crea su pedido
- Actualizaciones de estado enviadas por correo al cliente cuando cambia el estado de un pedido
- Configuración flexible a través de variables de entorno

## Configuración

### Requisitos previos

Para usar este servicio, necesitas:

1. Una cuenta de Gmail
2. Habilitar la verificación en dos pasos en tu cuenta de Google
3. Generar una "contraseña de aplicación" específica para esta aplicación

### Pasos para obtener una contraseña de aplicación en Gmail

1. Ve a tu cuenta de Google en [myaccount.google.com](https://myaccount.google.com)
2. Selecciona "Seguridad" en el menú lateral
3. Bajo "Acceso a Google", asegúrate de que la "Verificación en dos pasos" esté activada
4. Bajo "Verificación en dos pasos", selecciona "Contraseñas de aplicaciones"
5. Selecciona "Correo" como la aplicación y elige tu dispositivo
6. Google generará una contraseña de 16 caracteres. Cópiala (esta será tu `EMAIL_PASSWORD`)

### Variables de entorno

Añade las siguientes variables a tu archivo `.env`:

```
# Email Configuration
EMAIL_USER=tu-correo@gmail.com
EMAIL_PASSWORD=tu-contraseña-de-aplicacion
ADMIN_EMAIL_RECIPIENTS=admin1@ejemplo.com,admin2@ejemplo.com
```

## Uso del servicio

El servicio de correo electrónico se ha integrado automáticamente en el flujo de pedidos:

1. **Creación de pedidos**: Cuando se crea un nuevo pedido, se envía una notificación a:
   - Los administradores listados en `ADMIN_EMAIL_RECIPIENTS`
   - El cliente (si proporcionó un correo electrónico)

2. **Actualización de estado**: Cuando cambia el estado de un pedido, se envía una notificación al cliente (si proporcionó un correo electrónico).

## Implementación técnica

El servicio utiliza:

- [Nodemailer](https://nodemailer.com/) para el envío de correos
- SMTP de Gmail como servicio de correo saliente
- Plantillas HTML para formatear los correos electrónicos

### Archivos relevantes

- `src/services/email.service.ts`: Implementación principal del servicio de correo
- `src/controllers/pedido.controller.ts`: Integración con el flujo de pedidos

## Mensajes de error comunes

- **Error de autenticación**: Verifica que la contraseña de aplicación sea correcta y esté actualizada
- **Límite de envío excedido**: Gmail tiene límites diarios de envío, considera usar un servicio SMTP dedicado para producción
- **Error de conexión**: Comprueba la conectividad a Internet y los ajustes del firewall

## Mejoras futuras

- Añadir plantillas de correo personalizables
- Implementar cola de envío para manejar alta carga
- Añadir opción para servicio SMTP alternativo (SendGrid, Mailgun, etc.)
- Implementar seguimiento de apertura/click de correos

## Solución de problemas

Si los correos no se envían:

1. Ejecuta `emailService.verifyConnection()` para verificar la configuración
2. Revisa los registros del servidor para mensajes de error específicos
3. Comprueba que las variables de entorno estén correctamente configuradas
4. Verifica que la cuenta de Gmail no tenga bloqueadas las aplicaciones menos seguras

---

Para obtener más ayuda, contacta al equipo de desarrollo o consulta la documentación de Nodemailer en [nodemailer.com](https://nodemailer.com/).
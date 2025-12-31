# WhatsApp Catálogo Retorno API

API REST para enviar y recibir mensajes de WhatsApp, gestionando conversaciones y consultas para el sistema "EL RETORNO - Mayorista".

## Requisitos

- Node.js
- NPM

## Instalación

1. Clonar el repositorio
2. Instalar dependencias:

```bash
npm install
```

3. Iniciar el servidor:

```bash
node index.js
```

El servidor se iniciará en el puerto 3000 por defecto.

## Conexión a WhatsApp

Al iniciar la aplicación, se genera un código QR para la conexión con WhatsApp. Puedes acceder a él en:

```
http://localhost:3000/
```

Escanea el código QR con tu WhatsApp para establecer la conexión.

## Endpoints de la API

### Enviar mensaje

Permite enviar un mensaje a un número específico de WhatsApp.

**URL**: `/enviar`

**Método**: `POST`

**Parámetros en el cuerpo (JSON)**:
- `NUMERO`: String - Número de teléfono en formato internacional sin el '+' (Ej: 5491112345678)
- `MENSAJE`: String - Texto del mensaje a enviar

**Respuesta exitosa**:
- **Código**: 200
- **Contenido**: 
```json
{
  "NUMERO": "5491112345678",
  "MENSAJE": "Hola, este es un mensaje de prueba"
}
```

**Ejemplo de uso**:
```bash
curl -X POST http://localhost:3000/enviar \
  -H "Content-Type: application/json" \
  -d '{"NUMERO":"5491112345678", "MENSAJE":"Hola, este es un mensaje de prueba"}'
```

### Obtener todos los mensajes

Retorna todos los mensajes recibidos desde el inicio del servicio.

**URL**: `/mensajes`

**Método**: `GET`

**Respuesta exitosa**:
- **Código**: 200
- **Contenido**: Array de mensajes con todos los mensajes almacenados en el sistema

**Ejemplo de uso**:
```bash
curl http://localhost:3000/mensajes
```

### Obtener nuevos mensajes

Retorna los mensajes recibidos después de un mensaje específico.

**URL**: `/mensajes/nuevos`

**Método**: `GET`

**Parámetros en query**:
- `lastId`: String (opcional) - ID del último mensaje recibido

**Respuesta exitosa**:
- **Código**: 200
- **Contenido**: Array con los nuevos mensajes

**Notas**:
- Si no se especifica `lastId` o no se encuentra, retorna todos los mensajes
- Si se especifica `lastId`, retorna los mensajes recibidos después de ese ID

**Ejemplo de uso**:
```bash
curl http://localhost:3000/mensajes/nuevos?lastId=msg_1612345678_42
```

### Obtener mensajes de un número específico

Busca y retorna todos los mensajes intercambiados con un número específico.

**URL**: `/mensajes/numero/:numero`

**Método**: `GET`

**Parámetros en URL**:
- `numero`: String - Número de teléfono a buscar

**Respuesta exitosa**:
- **Código**: 200
- **Contenido**: Array con los mensajes filtrados por el número especificado

**Ejemplo de uso**:
```bash
curl http://localhost:3000/mensajes/numero/5491112345678
```

### Verificar estado del servicio

Retorna información sobre el estado actual del servicio.

**URL**: `/health`

**Método**: `GET`

**Respuesta exitosa**:
- **Código**: 200
- **Contenido**: 
```json
{
  "status": "ok",
  "whatsappConnected": true,
  "messagesCount": 42,
  "timestamp": 1612345678900
}
```

**Ejemplo de uso**:
```bash
curl http://localhost:3000/health
```

## Formato de los mensajes

Los mensajes almacenados contienen la siguiente estructura:

```json
{
  "id": "msg_1612345678_42",
  "timestamp": 1612345678900,
  "remoteJid": "5491112345678@s.whatsapp.net",
  "key": {
    "remoteJid": "5491112345678@s.whatsapp.net",
    "fromMe": false,
    "id": "original_message_id"
  },
  "messageTimestamp": 1612345678,
  "pushName": "Usuario",
  "message": {
    "conversation": "Mensaje del usuario"
  }
}
```

## Limitaciones

- El sistema almacena un máximo de 1000 mensajes en memoria
- No hay persistencia de datos cuando se reinicia el servicio

## Licencia

ISC
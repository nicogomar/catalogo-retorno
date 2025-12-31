const {
  createBot,
  createProvider,
  createFlow,
  addKeyword,
} = require("@bot-whatsapp/bot");

const QRPortalWeb = require("@bot-whatsapp/portal");
const { BaileysClass } = require("@bot-wa/bot-wa-baileys");
const MockAdapter = require("@bot-whatsapp/database/mock");

let adapterProvider = null;
let messageStore = []; // Almacenará los mensajes recibidos
let isConnected = false; // Estado de conexión a WhatsApp
const express = require("express");

const app = express();
app.use(express.json());

app.get("/", (req, res) => {
  QRPortalWeb();
  res.sendFile(__dirname + "/bot.qr.png");
});

app.post("/enviar", (req, res) => {
  const { NUMERO, MENSAJE } = req.body;
  enviarMensaje(NUMERO, MENSAJE);
  res.json({ NUMERO, MENSAJE });
});

// Endpoint para obtener todos los mensajes
app.get("/mensajes", (req, res) => {
  res.json(messageStore);
});

// Endpoint para obtener nuevos mensajes
// Se usa un parámetro lastId para filtrar mensajes nuevos desde el último recibido
app.get("/mensajes/nuevos", (req, res) => {
  const { lastId } = req.query;
  if (lastId) {
    const lastIdIndex = messageStore.findIndex((msg) => msg.id === lastId);
    if (lastIdIndex !== -1) {
      const nuevosMensajes = messageStore.slice(lastIdIndex + 1);
      return res.json(nuevosMensajes);
    }
  }
  // Si no hay lastId o no se encuentra, retorna todos los mensajes
  res.json(messageStore);
});

// Endpoint para buscar chat con un número específico
app.get("/mensajes/numero/:numero", (req, res) => {
  const { numero } = req.params;
  const mensajesFiltrados = messageStore.filter(
    (msg) =>
      msg.remoteJid.includes(numero) ||
      (msg.key && msg.key.remoteJid && msg.key.remoteJid.includes(numero)),
  );
  res.json(mensajesFiltrados);
});

app.listen(3000, () => {
  // Servidor iniciado en puerto 3000
});

// Endpoint para verificar el estado del bot
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    whatsappConnected: isConnected,
    messagesCount: messageStore.length,
    timestamp: Date.now()
  });
});

const flowPrincipal = addKeyword([]).addAnswer(
  "🙌  * Sistema de pedidos y consultas EL RETORNO - Mayorista - *",
);

function enviarMensaje(numero, mensaje) {
  adapterProvider.sendText(numero, mensaje);
}

const main = async () => {
  const adapterDB = new MockAdapter();
  const adapterFlow = createFlow([flowPrincipal]);
  adapterProvider = createProvider(BaileysClass);

  // Crear el bot
  const bot = createBot({
    flow: adapterFlow,
    provider: adapterProvider,
    database: adapterDB,
  });

  // Capturar y almacenar mensajes entrantes
  adapterProvider.on("message", async (msg) => {
    // Añadir timestamp y un ID único basado en timestamp + índice
    const timestamp = Date.now();
    const id = `msg_${timestamp}_${messageStore.length}`;

    const message = {
      id,
      timestamp,
      ...msg,
    };

    // Guardar mensaje en el store
    messageStore.push(message);

    // Limitar tamaño del store (opcional, para evitar uso excesivo de memoria)
    if (messageStore.length > 1000) {
      messageStore = messageStore.slice(messageStore.length - 1000);
    }
  });

  // Capturar evento de conexión exitosa de WhatsApp
  adapterProvider.on("ready", () => {
    isConnected = true;
  });

  // Capturar evento de desconexión de WhatsApp
  adapterProvider.on("disconnect", () => {
    isConnected = false;
  });
};

main();

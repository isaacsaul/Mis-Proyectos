const wppconnect = require("@wppconnect-team/wppconnect");
const optionsLists = require("./optionsLists");
const reporte = require("./reporte"); // Asegúrate de requerir tu archivo de reporte

let client;
let conversationLog = [];

async function startBot() {
  const welcomeMessage =
    "😊 ¡Hola! Soy tu asistente virtual del sindicato Simón Bolívar. ¿En qué puedo ayudarte hoy?";

  client.onMessage(async (message) => {
    if (message.fromMe) {
      return;
    }

    // Log the incoming message
    conversationLog.push({ from: message.from, body: message.body, timestamp: new Date(), sender: 'Usuario' });

    const messageLowerCase = message.body.toLowerCase().trim();

    if (messageLowerCase.startsWith("detalles")) {
      await client.sendText(message.from, welcomeMessage);
      logBotMessage(message.from, welcomeMessage);
      sendOptionsList(client, message.from);
    } else if (messageLowerCase.includes("reportar accidente")) { 
      sendOptionsList(client, message.from, "Reportar accidente");
    } else if (messageLowerCase.includes("denunciar")) { 
      sendOptionsList(client, message.from, "Denunciar");
    }
  });
}

function sendOptionsList(client, recipient, option) {
  let optionsList = [];

  if (option === "Denunciar") {
    optionsList = optionsLists.denunciar;
  } else if (option === "Reportar accidente") {
    optionsList = optionsLists.reportarAccidente;
  } else {
    optionsList = [
      "Reportar accidente",
      "Denunciar"
    ];
  }

  const listMessage = {
    buttonText: "Selecciona una opción",
    description: "Elige una opción de la lista",
    sections: [
      {
        title: "Opciones",
        rows: optionsList.map(option => ({ title: option }))
      }
    ]
  };

  client.sendListMessage(recipient, listMessage);
  logBotMessage(recipient, `Lista de opciones: ${optionsList.join(", ")}`);
}

async function handleUserSelection(message) {
  const selectedOption = message.body.trim();
  let thankYouMessage = "";

  if (optionsLists.reportarAccidente.includes(selectedOption)) {
    thankYouMessage = `Gracias por seleccionar "${selectedOption}" para reportar el accidente, por favor envíe alguna evidencia para validar su reporte.`;
    await client.sendText(message.from, thankYouMessage);
    logBotMessage(message.from, thankYouMessage);
    await sendEvidenceOptions(client, message.from);
  } else if (optionsLists.denunciar.includes(selectedOption)) {
    thankYouMessage = `Gracias por tu denuncia de "${selectedOption}", para poder validar su denuncia por favor envíe alguna evidencia.`;
    await client.sendText(message.from, thankYouMessage);
    logBotMessage(message.from, thankYouMessage);
    await sendEvidenceOptions(client, message.from);
  } else if (selectedOption.toLowerCase() === "foto" || selectedOption.toLowerCase() === "video") {
    const evidenceType = selectedOption.toLowerCase() === "foto" ? "foto" : "video";
    const evidenceMessage = `Has seleccionado enviar un ${evidenceType}. Por favor, envíalo como evidencia, en el caso que no se envíe nada no se tomará en cuenta.`;
    await client.sendText(message.from, evidenceMessage);
    logBotMessage(message.from, evidenceMessage);
  }
}

async function sendEvidenceOptions(client, recipient) {
  const evidenceMessage = "Por favor, elige cómo deseas enviar la evidencia:";
  const listMessage = {
    buttonText: "Selecciona una opción",
    description: evidenceMessage,
    sections: [
      {
        title: "Opciones de evidencia",
        rows: [
          { title: "Foto" },
          { title: "Video" }
        ]
      }
    ]
  };

  client.sendListMessage(recipient, listMessage);
  logBotMessage(recipient, "Opciones de evidencia: Foto, Video");
}

function logBotMessage(recipient, message) {
  conversationLog.push({ from: recipient, body: message, timestamp: new Date(), sender: 'Bot' });
}

async function main() {
  if (!client) {
    client = await wppconnect.create();
  }

  try {
    startBot();
    client.onMessage(handleUserSelection);
  } catch (error) {
    console.error("Error al iniciar el bot:", error);
  }
}

main();

// Al final de tu archivo, puedes agregar el siguiente código para guardar la conversación en un archivo Excel
process.on('SIGINT', async () => {
  console.log('Guardando la conversación...');
  await reporte.saveConversationToExcel(conversationLog); // Pasa el log de la conversación
  process.exit();
});

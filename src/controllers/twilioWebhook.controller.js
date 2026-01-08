import { createSalesAgent } from '../agent.js';

let agentCache = {};

async function getAgent(sessionId) {
  if (!agentCache[sessionId]) {
    agentCache[sessionId] = await createSalesAgent(sessionId);
  }
  return agentCache[sessionId];
}

export async function twilioWebhook(req, res) {
  try {
    const userPhone = req.body.From;      // "whatsapp:+5491234567890"
    const userMessage = req.body.Body;    // "Hola, quiero pantalones"
    
    console.log('Mensaje de WhatsApp:', { userPhone, userMessage });
    
    if (!userPhone || !userMessage) {
      return res.status(400).type('text/xml').send(`
        <Response>
          <Message>Error: No se recibió el mensaje correctamente.</Message>
        </Response>
      `);
    }
    
    // Obtener el agente para este usuario
    const salesAgent = await getAgent(userPhone);
    
    // Invocar el agente
    const response = await salesAgent.invoke(
      { messages: [{ role: "user", content: userMessage }] },
      { configurable: { thread_id: userPhone } }
    );
    
    // Extraer la respuesta del agente
    const agentReply = response.messages[response.messages.length - 1].content;
    
    console.log('Respuesta del agente:', agentReply);
    
    // Responder en formato TwiML (XML)
    res.type('text/xml');
    res.send(`
      <Response>
        <Message>${agentReply}</Message>
      </Response>
    `);
    
  } catch (error) {
    console.error('Error en twilioWebhook:', error);
    
    res.type('text/xml');
    res.send(`
      <Response>
        <Message>Lo siento, hubo un error procesando tu mensaje. Por favor intentá de nuevo.</Message>
      </Response>
    `);
  }
}
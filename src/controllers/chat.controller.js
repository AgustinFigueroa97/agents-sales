import { createSalesAgent } from '../agent.js';

let agentCache = {}; 

async function getAgent(sessionId) {  
  if (!agentCache[sessionId]) {
    agentCache[sessionId] = await createSalesAgent(sessionId);
  }
  return agentCache[sessionId];
}

export async function chat(req, res) {
  try {
    const { message, session_id } = req.body;
    
    if (!message) {
      return res.status(400).json({
        success: false,
        error: 'Falta el campo "message"'
      });
    }
    
    if (!session_id) {
      return res.status(400).json({
        success: false,
        error: 'Falta el campo "session_id"'
      });
    }
    
    const salesAgent = await getAgent(session_id);
    
    // Invocar con thread_id (memoria por usuario)
    const response = await salesAgent.invoke(
      { messages: [{ role: "user", content: message }] },
      { configurable: { thread_id: session_id } }
    );
    
    res.json({
      success: true,
      message: response.messages[response.messages.length - 1].content
    });
    
  } catch (error) {
    console.error('Error en chat:', error);
    res.status(500).json({
      success: false,
      error: 'Error al procesar mensaje'
    });
  }
}
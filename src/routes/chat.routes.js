import express from 'express';
import { chat } from '../controllers/chat.controller.js';
import { twilioWebhook } from '../controllers/twilioWebhook.controller.js';

const router = express.Router();

// POST /chat - Conversar con el agente
router.post('/', chat);

// POST /chat/webhook - Webhook de Twilio (WhatsApp)
router.post('/webhook', twilioWebhook);

export default router;
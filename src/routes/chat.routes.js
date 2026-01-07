import express from 'express';
import { chat } from '../controllers/chat.controller.js';

const router = express.Router();

// POST /chat - Conversar con el agente
router.post('/', chat);

export default router;
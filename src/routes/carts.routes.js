import express from 'express';
import { getCart, createCart, updateCart} from '../controllers/carts.controller.js';

const router = express.Router();

// POST /carts - Crear un carrito
router.post('/', createCart);

// GET /carts/:id - Obtener un carrito
router.get('/:id', getCart);

// PATCH /carts/:id - Actualizar un carrito
router.patch('/:id', updateCart);

export default router;
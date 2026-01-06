import express from 'express';

import { listProducts, getProduct } from '../controllers/products.controller.js';

const router = express.Router();

// GET /products - Listar productos con filtros opcionales
router.get('/', listProducts);

// GET /products/:id - Obtener un producto específico
router.get('/:id', getProduct);

export default router;
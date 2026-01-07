import * as cartService from '../services/cartService.js';

/**
 * POST /carts - Crear un nuevo carrito
 */
export async function createCart(req, res) {
  try {
    const { session_id, items } = req.body;
    
    // Validar datos requeridos
    if (!session_id) {
      return res.status(400).json({
        success: false,
        error: 'Falta el campo "session_id"'
      });
    }
    
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Falta el campo "items" o está vacío'
      });
    }
    
    // Validar estructura de items
    for (const item of items) {
      if (!item.product_id || !item.qty) {
        return res.status(400).json({
          success: false,
          error: 'Cada item debe tener "product_id" y "qty"'
        });
      }
    }
    
    // Crear carrito
    const cart = await cartService.createCart({ session_id, items });
    
    res.status(201).json({
      success: true,
      message: 'Carrito creado exitosamente',
      data: cart
    });
    
  } catch (error) {
    console.error('Error en createCart:', error);
    
    // Errores de validación del negocio (stock, mínimos, etc)
    if (error.message.includes('no encontrado') || 
        error.message.includes('no está disponible') ||
        error.message.includes('Stock insuficiente') ||
        error.message.includes('requiere mínimo')) {
      return res.status(404).json({
        success: false,
        error: error.message
      });
    }
    
    // Error genérico del servidor
    res.status(500).json({
      success: false,
      error: 'Error al crear carrito'
    });
  }
}

/**
 * GET /carts/:id - Obtener un carrito
 */
export async function getCart(req, res) {
  try {
    const { id } = req.params;
    
    const cart = await cartService.getCartById(id);
    
    if (!cart) {
      return res.status(404).json({
        success: false,
        error: 'Carrito no encontrado'
      });
    }
    
    res.status(200).json({
      success: true,
      data: cart
    });
    
  } catch (error) {
    console.error('Error en getCart:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener carrito'
    });
  }
}

/**
 * PATCH /carts/:id - Actualizar un carrito
 */
export async function updateCart(req, res) {
  try {
    const { id } = req.params;
    const { items } = req.body;
    
    // Validar datos requeridos
    if (!items || !Array.isArray(items)) {
      return res.status(400).json({
        success: false,
        error: 'Falta el campo "items" o no es un array'
      });
    }
    
    // Validar estructura de items (solo si hay items)
    if (items.length > 0) { 
      for (const item of items) {
        if (!item.product_id || !item.qty) {
          return res.status(400).json({
            success: false,
            error: 'Cada item debe tener "product_id" y "qty"'
          });
        }
      }
    }
    
    // Actualizar carrito
    const cart = await cartService.updateCart({ 
      cartId: parseInt(id), 
      items 
    });
    
    res.status(200).json({
      success: true,
      message: 'Carrito actualizado exitosamente',
      data: cart
    });
    
  } catch (error) {
    console.error('Error en updateCart:', error);
    
    // Errores de validación del negocio
    if (error.message.includes('no encontrado') || 
        error.message.includes('no está disponible') ||
        error.message.includes('Stock insuficiente') ||
        error.message.includes('requiere mínimo')) {
      return res.status(404).json({
        success: false,
        error: error.message
      });
    }
    
    // Error genérico del servidor
    res.status(500).json({
      success: false,
      error: 'Error al actualizar carrito'
    });
  }
}
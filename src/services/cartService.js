import pool from '../config/db.js';
import * as productService from './productService.js';
import * as pricingService from './pricingService.js';

/**
 * Crear un nuevo carrito con items,
items recibiia algo de este estilo: 
{
  session_id: "user_123",
  items: [
    { product_id: 1, qty: 55 },   // 55 pantalones
    { product_id: 3, qty: 120 }   // 120 remeras
  ]
}
 */
export async function createCart({ session_id, items }) {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    const existingCart = await getCartBySessionId(session_id);

    if (existingCart) {
      throw new Error(`Ya tenés un carrito activo (ID: ${existingCart.id}). Usá "editar_carrito" para modificarlo.`);
    }

    // 1. Validar que todos los productos existan y tengan stock
    for (const item of items) {
      const product = await productService.getProductById(item.product_id);
      
      if (!product) {
        throw new Error(`Producto ${item.product_id} no encontrado`);
      }
      
      if (!product.disponible) {
        throw new Error(`Producto ${product.tipo_prenda} no está disponible`);
      }
      
      if (product.cantidad_disponible < item.qty) {
        throw new Error(`Stock insuficiente para ${product.tipo_prenda}. Disponible: ${product.cantidad_disponible}`);
      }
      
      // Validar mínimo 50 unidades por producto
      if (!pricingService.isValidQuantity(item.qty)) {
        throw new Error(`${product.tipo_prenda} requiere mínimo 50 unidades (venta mayorista)`);
      }
    }
    
    // 2. Crear el carrito
    const cartResult = await client.query(
      'INSERT INTO carts (session_id) VALUES ($1) RETURNING *',
      [session_id]
    );
    
    const cart = cartResult.rows[0];
    
    // 3. Agregar items al carrito
    for (const item of items) {
      const product = await productService.getProductById(item.product_id);
      
      // Calcular precio según cantidad de este producto
      const unitPrice = pricingService.calculateUnitPrice(product, item.qty);
      const subtotal = pricingService.calculateSubtotal(item.qty, unitPrice);
      
      await client.query(`
        INSERT INTO cart_items (cart_id, product_id, qty, unit_price, subtotal)
        VALUES ($1, $2, $3, $4, $5)
      `, [cart.id, item.product_id, item.qty, unitPrice, subtotal]);
    }
    
    await client.query('COMMIT');
    
    // 4. Devolver el carrito completo
    return await getCartById(cart.id);
    
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Obtener un carrito con sus items
 */
export async function getCartById(cartId) {
  try {
    // Obtener carrito
    const cartResult = await pool.query(
      'SELECT * FROM carts WHERE id = $1',
      [cartId]
    );
    
    if (cartResult.rows.length === 0) {
      return null;
    }
    
    const cart = cartResult.rows[0];
    
    // Obtener items del carrito con info de productos
    const itemsResult = await pool.query(`
      SELECT 
        ci.*,
        p.tipo_prenda,
        p.talla,
        p.color
      FROM cart_items ci
      JOIN products p ON ci.product_id = p.id
      WHERE ci.cart_id = $1
    `, [cartId]);
    
    cart.items = itemsResult.rows;
    
    // Calcular totales
    const totalAmount = pricingService.calculateTotalAmount(cart.items);
    cart.total_amount = totalAmount;
    
    return cart;
    
  } catch (error) {
    console.error('Error en getCartById:', error);
    throw error;
  }
}

/**
 * Obtener carrito por session_id
 */
export async function getCartBySessionId(sessionId) {
  try {
    const result = await pool.query(
      'SELECT * FROM carts WHERE session_id = $1',
      [sessionId]
    );
    
    if (result.rows.length === 0) {
      return null;
    }
    
    return await getCartById(result.rows[0].id);
    
  } catch (error) {
    console.error('Error en getCartBySessionId:', error);
    throw error;
  }
}

/**
 * Actualizar items de un carrito existente
 */
export async function updateCart({ cartId, items }) {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    // 1. Verificar que el carrito existe
    const cartResult = await client.query(
      'SELECT * FROM carts WHERE id = $1',
      [cartId]
    );
    
    if (cartResult.rows.length === 0) {
      throw new Error('Carrito no encontrado');
    }

    if (items.length === 0) {
      await client.query('DELETE FROM cart_items WHERE cart_id = $1', [cartId]);
      await client.query('DELETE FROM carts WHERE id = $1', [cartId]);
      await client.query('COMMIT');
      
      return {
        id: cartId,
        message: 'Carrito cancelado completamente',
        items: [],
        total_amount: 0
      };
    }
    
    // 2. Validar todos los productos nuevos
    for (const item of items) {
      const product = await productService.getProductById(item.product_id);
      
      if (!product) {
        throw new Error(`Producto ${item.product_id} no encontrado`);
      }
      
      if (!product.disponible) {
        throw new Error(`Producto ${product.tipo_prenda} no está disponible`);
      }
      
      if (product.cantidad_disponible < item.qty) {
        throw new Error(`Stock insuficiente para ${product.tipo_prenda}. Disponible: ${product.cantidad_disponible}`);
      }
      
      if (!pricingService.isValidQuantity(item.qty)) {
        throw new Error(`${product.tipo_prenda} requiere mínimo 50 unidades (venta mayorista)`);
      }
    }
    
    // 3. Eliminar items actuales del carrito
    await client.query('DELETE FROM cart_items WHERE cart_id = $1', [cartId]);
    
    // 4. Insertar los nuevos items
    for (const item of items) {
      const product = await productService.getProductById(item.product_id);
      
      const unitPrice = pricingService.calculateUnitPrice(product, item.qty);
      const subtotal = pricingService.calculateSubtotal(item.qty, unitPrice);
      
      await client.query(`
        INSERT INTO cart_items (cart_id, product_id, qty, unit_price, subtotal)
        VALUES ($1, $2, $3, $4, $5)
      `, [cartId, item.product_id, item.qty, unitPrice, subtotal]);
    }
    
    // 5. Actualizar timestamp del carrito
    await client.query(
      'UPDATE carts SET updated_at = NOW() WHERE id = $1',
      [cartId]
    );
    
    await client.query('COMMIT');
    
    // 6. Devolver el carrito actualizado
    return await getCartById(cartId);
    
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}
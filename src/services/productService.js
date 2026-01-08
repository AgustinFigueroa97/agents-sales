import pool from '../config/db.js';

/**
 * Buscar productos con filtros opcionales
 */
export async function searchProducts({ tipo_prenda, color, categoria, talla }) {
  try {
    let query = 'SELECT * FROM products WHERE disponible = true AND cantidad_disponible >= 50'; // Estoy filtrando solo productos disponibles y con stock mínimo 50, es la politica que decidi
    const params = [];
    let paramCount = 1;
    
    if (tipo_prenda) {
      query += ` AND LOWER(tipo_prenda) = LOWER($${paramCount})`;
      params.push(tipo_prenda);
      paramCount++;
    }
    
    if (color) {
      query += ` AND LOWER(color) = LOWER($${paramCount})`;
      params.push(color);
      paramCount++;
    }
    
    if (categoria) {
      query += ` AND LOWER(categoria) = LOWER($${paramCount})`;
      params.push(categoria);
      paramCount++;
    }
    
    if (talla) {
      query += ` AND LOWER(talla) = LOWER($${paramCount})`;
      params.push(talla);
      paramCount++;
    }
    
    query += ' ORDER BY id ASC LIMIT 100';
    
    const result = await pool.query(query, params);
    return result.rows;
    
  } catch (error) {
    console.error('Error en searchProducts:', error);
    throw error;
  }
}

/**
 * Obtener un producto por ID
 */
export async function getProductById(id) {
  try {
    const result = await pool.query(
      'SELECT * FROM products WHERE id = $1',
      [id]
    );
    
    return result.rows[0] || null;
    
  } catch (error) {
    console.error('Error en getProductById:', error);
    throw error;
  }
}
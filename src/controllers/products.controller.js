import * as productService from '../services/productService.js';

/**
 * Listar productos con filtros opcionales
 */
export async function listProducts(req, res) {
  try {
    const { tipo_prenda, color, categoria, talla } = req.query;
    
    const filters = {
      tipo_prenda,
      color,
      categoria,
      talla
    };
    
    const products = await productService.searchProducts(filters);
    
    res.status(200).json({
      success: true,
      count: products.length,
      filters_applied: { tipo_prenda, color, categoria, talla },
      data: products
    });
    
  } catch (error) {
    console.error('Error en listProducts:', error);
    res.status(500).json({
      success: false,
      error: 'Error al cargar productos'
    });
  }
}

/**
 * Obtener un producto por ID
 */
export async function getProduct(req, res) {
  try {
    const { id } = req.params;
    
    const product = await productService.getProductById(id);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Producto no encontrado'
      });
    }
    
    res.status(200).json({
      success: true,
      data: product
    });
    
  } catch (error) {
    console.error('Error en getProduct:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener producto'
    });
  }
}
import { tool } from "langchain";
import * as z from "zod";
import * as productService from '../services/productService.js';

export const searchProductsTool = tool(
  async ({ tipo_prenda, color, categoria, talla }) => {
    
    console.log('🔍 Buscando productos:', { tipo_prenda, color, categoria, talla });
    
    // Buscar en la BD
    const products = await productService.searchProducts({
      tipo_prenda,
      color,
      categoria,
      talla
    });
    
    // Si no hay resultados
    if (products.length === 0) {
      return 'No se encontraron productos con esos criterios.';
    }
    
    // Formatear resultados (máximo 5 para no saturar al agente)
    const top5 = products.slice(0, 5);
    
    const formatted = top5.map(p => 
      `ID: ${p.id} | ${p.tipo_prenda} ${p.talla} ${p.color} | Stock: ${p.cantidad_disponible} | Precios: $${p.precio_50_u} (50-99u), $${p.precio_100_u} (100-199u), $${p.precio_200_u} (200+u)`
    ).join('\n');
    
    return `Encontré ${products.length} productos (mostrando primeros 5):\n${formatted}`;
  },
  {
    name: "buscar_productos",
    description: "Busca productos de ropa disponibles para venta mayorista (mínimo 50 unidades por producto). Usa esta herramienta cuando el usuario pregunte por prendas, colores, talles o categorías.",
    schema: z.object({
      tipo_prenda: z.string().optional().describe('Tipo de prenda: Pantalón, Camiseta, Falda, Sudadera, etc.'),
      color: z.string().optional().describe('Color: Verde, Blanco, Negro, Azul, Rojo, etc.'),
      categoria: z.string().optional().describe('Categoría: Deportivo, Casual, Formal'),
      talla: z.string().optional().describe('Talla: S, M, L, XL, XXL')
    })
  }
);



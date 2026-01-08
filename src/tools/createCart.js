import { tool } from "langchain";
import * as z from "zod";
import * as cartService from '../services/cartService.js';

export const createCartTool = tool(
  async ({ session_id, items }) => {
    try {
      console.log('Creando carrito para sesión:', session_id);
      console.log('Items:', items);
      
      // Crear carrito en la BD
      const cart = await cartService.createCart({
        session_id,
        items
      });
      
      // Formatear respuesta para el agente
      const itemsList = cart.items.map(item => 
        `- ${item.qty} ${item.tipo_prenda} ${item.talla} ${item.color} a $${item.unit_price} c/u = $${item.subtotal}`
      ).join('\n');
      
      return `Carrito #${cart.id} creado exitosamente! Productos: ${itemsList} Total: $${cart.total_amount} El carrito está listo. ¿Querés modificar algo?`;
      
    } catch (error) {
      console.error('Error creando carrito:', error);
      
      if (error.message.includes('Ya tenés un carrito activo')) {
        return `${error.message}`;
      }
      if (error.message.includes('no encontrado')) {
        return 'No se pudo crear el carrito. Uno o más productos no existen. Por favor verificá los IDs.';
      }
      if (error.message.includes('no está disponible')) {
        return 'No se pudo crear el carrito. Uno o más productos no están disponibles actualmente.';
      }
      if (error.message.includes('Stock insuficiente')) {
        return `No se pudo crear el carrito. ${error.message} Por favor ajustá las cantidades.`; 
      }
      if (error.message.includes('requiere mínimo')) {
        return `No se pudo crear el carrito. ${error.message}`; 
      }

      return 'No se pudo crear el carrito. Por favor intentá de nuevo.'; 
    }
  },
  {
    name: "crear_carrito",
    description: "Crea un carrito de compras con los productos elegidos. Usa esta herramienta cuando el usuario confirme que quiere comprar o agregar productos al carrito. IMPORTANTE: Cada producto debe tener mínimo 50 unidades (venta mayorista).",
    schema: z.object({
      session_id: z.string().describe('ID de la sesión del usuario (thread_id de la conversación)'),
      items: z.array(
        z.object({
          product_id: z.number().describe('ID del producto a agregar'),
          qty: z.number().describe('Cantidad de unidades (mínimo 50 por producto)')
        })
      ).describe('Array de productos con sus cantidades')
    })
  }
);
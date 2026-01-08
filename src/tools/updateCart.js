import { tool } from "langchain";
import * as z from "zod";
import * as cartService from '../services/cartService.js';

export const updateCartTool = tool(
  async ({ cart_id, items }) => {
    try {
      console.log('Actualizando carrito:', cart_id);
      console.log('Nuevos items:', items);
      
      // Actualizar carrito en la BD
      const cart = await cartService.updateCart({
        cartId: cart_id,
        items
      });
      
      // Formatear respuesta para el agente
      const itemsList = cart.items.map(item => 
        `- ${item.qty} ${item.tipo_prenda} ${item.talla} ${item.color} a $${item.unit_price} c/u = $${item.subtotal}`
      ).join('\n');
      
      return `Carrito #${cart.id} actualizado exitosamente! Productos actualizados: ${itemsList} Nuevo total: $${cart.total_amount} ¿Está todo bien o querés hacer algún otro cambio?`;
      
    } catch (error) {
      console.error('Error actualizando carrito:', error);
      
      // Devolver mensajes de error claros al agente
      if (error.message.includes('no encontrado')) {
        return 'El carrito no existe o uno de los productos no fue encontrado.';
      }
      if (error.message.includes('no está disponible')) {
        return 'Uno o más productos no están disponibles actualmente.';
      }
      if (error.message.includes('Stock insuficiente')) {
        return `${error.message}`;
      }
      if (error.message.includes('requiere mínimo')) {
        return `${error.message}`;
      }
      
      return 'Hubo un error al actualizar el carrito. Por favor intentá de nuevo.';
    }
  },
  {
    name: "editar_carrito",
    description: "Modifica un carrito existente cambiando cantidades o productos. Usa esta herramienta cuando el usuario quiera cambiar su pedido. IMPORTANTE: Los items que pases reemplazan completamente el contenido del carrito.",
    schema: z.object({
      cart_id: z.number().describe('ID del carrito a modificar'),
      items: z.array(
        z.object({
          product_id: z.number().describe('ID del producto'),
          qty: z.number().describe('Nueva cantidad (mínimo 50 por producto)')
        })
      ).min(0).describe('Array de productos con sus nuevas cantidades (reemplaza todo el carrito). Pasá un array vacío [] para cancelar todo el carrito.')
    })
  }
);



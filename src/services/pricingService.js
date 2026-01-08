/**
 * Determina qué precio unitario aplicar según la cantidad de ESE producto
 */
export function calculateUnitPrice(product, quantity) {
  if (quantity >= 200) {
    return parseFloat(product.precio_200_u);
  } else if (quantity >= 100) {
    return parseFloat(product.precio_100_u);
  } else if (quantity >= 50) {
    return parseFloat(product.precio_50_u);
  } else {
    // Menos de 50 unidades de este producto = no hay venta mayorista
    return null;
  }
}

/**
 * Calcula el subtotal de un item 
 */
export function calculateSubtotal(qty, unitPrice) {
  return qty * unitPrice;
}

/**
 * Calcula el monto total del carrito (suma de todos los subtotales)
 */
export function calculateTotalAmount(cartItems) {
  return cartItems.reduce((sum, item) => {
    return sum + parseFloat(item.subtotal);
  }, 0);
}

/**
 * Valida que una cantidad sea válida para venta mayorista
 */
export function isValidQuantity(quantity) {
  return quantity >= 50;
}
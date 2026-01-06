import express from 'express';
import dotenv from 'dotenv';
import { testConnection } from './config/db.js';
import productsRoutes from './routes/products.routes.js';
import cartsRoutes from './routes/carts.routes.js';

// Cargar variables de entorno
dotenv.config();

// Crear la aplicación Express
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware para parsear JSON
app.use(express.json());

// Rutas de productos
app.use('/products', productsRoutes);
app.use('/carts', cartsRoutes);

// Ruta de prueba (health check)
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'Servidor funcionando correctamente' 
  });
});

// Iniciar servidor
async function startServer() {
  // Verificar conexión a BD
  const dbConnected = await testConnection();
  
  if (!dbConnected) {
    console.error('❌ No se pudo conectar a la BD. Saliendo...');
    process.exit(1);
  }
  
  // Levantar servidor
  app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
    console.log(`🏥 Health check: http://localhost:${PORT}/health`);
    console.log(`📦 Productos: http://localhost:${PORT}/products`);
    console.log(`🛒 Carritos: http://localhost:${PORT}/carts`);
  });
}

startServer();
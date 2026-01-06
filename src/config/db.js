import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

// Función para verificar conexión
export async function testConnection() {
  try {
    const client = await pool.connect();
    console.log('✅ Conectado a PostgreSQL');
    client.release();
    return true;
  } catch (error) {
    console.error('❌ Error conectando a PostgreSQL:', error.message);
    return false;
  }
}

export default pool;
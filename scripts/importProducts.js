import XLSX from 'xlsx';
import pool from '../src/config/db.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function importProducts() {
  try {
    console.log('🔍 DATABASE_URL:', process.env.DATABASE_URL);

    console.log('📊 Leyendo archivo Excel...');
    
    // Leer el archivo Excel (ajustá la ruta si está en otro lado)
    const workbook = XLSX.readFile(path.join(__dirname, '../products.xlsx'));
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    
    // Convertir a JSON
    const rows = XLSX.utils.sheet_to_json(sheet);
    
    console.log(`✅ Se encontraron ${rows.length} productos`);
    
    // Insertar cada producto
    for (const row of rows) {
      const disponible = row.DISPONIBLE === 'Sí';
      
      await pool.query(`
        INSERT INTO products (
          id, tipo_prenda, talla, color, 
          cantidad_disponible, precio_50_u, precio_100_u, precio_200_u,
          disponible, categoria, descripcion
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        ON CONFLICT (id) DO NOTHING
      `, [
        parseInt(row.ID),                    // id
        row.TIPO_PRENDA,                     // tipo_prenda
        row.TALLA,                           // talla
        row.COLOR,                           // color
        parseInt(row.CANTIDAD_DISPONIBLE),   // cantidad_disponible
        parseFloat(row.PRECIO_50_U),         // precio_50_u
        parseFloat(row.PRECIO_100_U),        // precio_100_u
        parseFloat(row.PRECIO_200_U),        // precio_200_u
        disponible,                          // disponible (boolean)
        row.CATEGORÍA,      // categoria (por si tiene tilde)
        row.DESCRIPCIÓN   // descripcion (por si tiene tilde)
      ]);
    }
    
    console.log('✅ Productos importados exitosamente');
    
    // Verificar
    const result = await pool.query('SELECT COUNT(*) FROM products');
    console.log(`📦 Total productos en BD: ${result.rows[0].count}`);
    
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error importando productos:', error);
    process.exit(1);
  }
}

importProducts();
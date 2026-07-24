// =========================================================
// CONFIGURATION DE LA CONNEXION A LA BASE DE DONNEES MYSQL
// =========================================================
require('dotenv').config();
const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  dateStrings: true
});

// Test de connexion au demarrage
(async () => {
  try {
    const connection = await pool.getConnection();
    console.log('✅ Connexion a la base de donnees MySQL "nutrici" reussie.');
    connection.release();
  } catch (error) {
    console.error('❌ Erreur de connexion a la base de donnees :', error.message);
  }
})();

module.exports = pool;

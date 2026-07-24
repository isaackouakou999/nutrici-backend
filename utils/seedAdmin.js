require('dotenv').config();
const bcrypt = require('bcryptjs');
const pool = require('../config/db');

async function seedAdmin() {
  try {
    const email = 'admin@nutrici.ci';
    const motDePasseClair = 'Admin@2026';
    const hash = await bcrypt.hash(motDePasseClair, 10);

    const [existe] = await pool.query('SELECT email FROM Client WHERE email = ?', [email]);

    if (existe.length > 0) {
      await pool.query('UPDATE Client SET motDePasse = ?, role = ? WHERE email = ?', [
        hash,
        'ADMINISTRATEUR',
        email
      ]);
      console.log('✅ Compte administrateur mis a jour avec succes.');
    } else {
      await pool.query(
        `INSERT INTO Client (email, nomC, telephone, adresse, motDePasse, role)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [email, 'Administrateur NutriCI', '+225 07 00 00 00', 'Abidjan, Cocody', hash, 'ADMINISTRATEUR']
      );
      console.log('✅ Compte administrateur cree avec succes.');
    }

    console.log('📧 Email : admin@nutrici.ci');
    console.log('🔑 Mot de passe : Admin@2026');
    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur lors de la creation du compte admin :', error.message);
    process.exit(1);
  }
}

seedAdmin();

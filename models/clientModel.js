const pool = require('../config/db');

const ClientModel = {
  async getAll() {
    const [rows] = await pool.query(
      'SELECT email, nomC, telephone, adresse, role, dateInscription FROM Client ORDER BY dateInscription DESC'
    );
    return rows;
  },

  async getByEmail(email) {
    const [rows] = await pool.query('SELECT * FROM Client WHERE email = ?', [email]);
    return rows[0];
  },

  async getByEmailSafe(email) {
    const [rows] = await pool.query(
      'SELECT email, nomC, telephone, adresse, role, dateInscription FROM Client WHERE email = ?',
      [email]
    );
    return rows[0];
  },

  async create({ email, nomC, telephone, adresse, motDePasse, role }) {
    await pool.query(
      `INSERT INTO Client (email, nomC, telephone, adresse, motDePasse, role)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [email, nomC, telephone, adresse || null, motDePasse, role || 'CLIENT']
    );
    return this.getByEmailSafe(email);
  },

  async update(email, { nomC, telephone, adresse }) {
    await pool.query(
      'UPDATE Client SET nomC = ?, telephone = ?, adresse = ? WHERE email = ?',
      [nomC, telephone, adresse || null, email]
    );
    return this.getByEmailSafe(email);
  },

  async updatePassword(email, motDePasse) {
    await pool.query('UPDATE Client SET motDePasse = ? WHERE email = ?', [motDePasse, email]);
    return true;
  },

  async remove(email) {
    const [result] = await pool.query('DELETE FROM Client WHERE email = ?', [email]);
    return result.affectedRows > 0;
  }
};

module.exports = ClientModel;

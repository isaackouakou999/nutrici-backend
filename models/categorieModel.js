const pool = require('../config/db');

const CategorieModel = {
  async getAll() {
    const [rows] = await pool.query('SELECT * FROM Categorie ORDER BY libelle ASC');
    return rows;
  },

  async getByCode(code) {
    const [rows] = await pool.query('SELECT * FROM Categorie WHERE code = ?', [code]);
    return rows[0];
  },

  async create({ code, libelle, description, image }) {
    await pool.query(
      'INSERT INTO Categorie (code, libelle, description, image) VALUES (?, ?, ?, ?)',
      [code, libelle, description || null, image || null]
    );
    return this.getByCode(code);
  },

  async update(code, { libelle, description, image }) {
    await pool.query(
      'UPDATE Categorie SET libelle = ?, description = ?, image = ? WHERE code = ?',
      [libelle, description || null, image || null, code]
    );
    return this.getByCode(code);
  },

  async remove(code) {
    const [result] = await pool.query('DELETE FROM Categorie WHERE code = ?', [code]);
    return result.affectedRows > 0;
  },

  async countProduits(code) {
    const [rows] = await pool.query(
      'SELECT COUNT(*) AS total FROM Produit WHERE categorieCode = ?',
      [code]
    );
    return rows[0].total;
  }
};

module.exports = CategorieModel;

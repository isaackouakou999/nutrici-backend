const pool = require('../config/db');

const ProduitModel = {
  async getAll({ categorieCode, recherche } = {}) {
    let sql = `
      SELECT p.*, c.libelle AS categorieLibelle
      FROM Produit p
      INNER JOIN Categorie c ON p.categorieCode = c.code
      WHERE p.actif = 1
    `;
    const params = [];

    if (categorieCode) {
      sql += ' AND p.categorieCode = ?';
      params.push(categorieCode);
    }

    if (recherche) {
      sql += ' AND (p.nomP LIKE ? OR p.description LIKE ?)';
      params.push(`%${recherche}%`, `%${recherche}%`);
    }

    sql += ' ORDER BY p.dateCreation DESC';

    const [rows] = await pool.query(sql, params);
    return rows;
  },

  async getByRef(ref) {
    const [rows] = await pool.query(
      `SELECT p.*, c.libelle AS categorieLibelle
       FROM Produit p
       INNER JOIN Categorie c ON p.categorieCode = c.code
       WHERE p.ref = ?`,
      [ref]
    );
    return rows[0];
  },

  async create({ ref, nomP, description, prixUnitaire, qteStock, image, categorieCode }) {
    await pool.query(
      `INSERT INTO Produit (ref, nomP, description, prixUnitaire, qteStock, image, categorieCode)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [ref, nomP, description || null, prixUnitaire, qteStock || 0, image || null, categorieCode]
    );
    return this.getByRef(ref);
  },

  async update(ref, { nomP, description, prixUnitaire, image, categorieCode }) {
    await pool.query(
      `UPDATE Produit
       SET nomP = ?, description = ?, prixUnitaire = ?, image = ?, categorieCode = ?
       WHERE ref = ?`,
      [nomP, description || null, prixUnitaire, image || null, categorieCode, ref]
    );
    return this.getByRef(ref);
  },

  async updateStock(ref, qteStock) {
    await pool.query('UPDATE Produit SET qteStock = ? WHERE ref = ?', [qteStock, ref]);
    return this.getByRef(ref);
  },

  async decrementStock(ref, quantite, connection = pool) {
    await connection.query(
      'UPDATE Produit SET qteStock = qteStock - ? WHERE ref = ? AND qteStock >= ?',
      [quantite, ref, quantite]
    );
  },

  async remove(ref) {
    const [result] = await pool.query('UPDATE Produit SET actif = 0 WHERE ref = ?', [ref]);
    return result.affectedRows > 0;
  },

  async removeDefinitif(ref) {
    const [result] = await pool.query('DELETE FROM Produit WHERE ref = ?', [ref]);
    return result.affectedRows > 0;
  }
};

module.exports = ProduitModel;

const pool = require('../config/db');

const FournisseurModel = {
  async getAll() {
    const [rows] = await pool.query('SELECT * FROM Fournisseur ORDER BY raisonSocial ASC');
    return rows;
  },

  async getByCode(codeFournisseur) {
    const [rows] = await pool.query(
      'SELECT * FROM Fournisseur WHERE codeFournisseur = ?',
      [codeFournisseur]
    );
    return rows[0];
  },

  async create({ codeFournisseur, raisonSocial, pays, emailFournisseur, telephone }) {
    await pool.query(
      `INSERT INTO Fournisseur (codeFournisseur, raisonSocial, pays, emailFournisseur, telephone)
       VALUES (?, ?, ?, ?, ?)`,
      [codeFournisseur, raisonSocial, pays, emailFournisseur, telephone || null]
    );
    return this.getByCode(codeFournisseur);
  },

  async update(codeFournisseur, { raisonSocial, pays, emailFournisseur, telephone }) {
    await pool.query(
      `UPDATE Fournisseur
       SET raisonSocial = ?, pays = ?, emailFournisseur = ?, telephone = ?
       WHERE codeFournisseur = ?`,
      [raisonSocial, pays, emailFournisseur, telephone || null, codeFournisseur]
    );
    return this.getByCode(codeFournisseur);
  },

  async remove(codeFournisseur) {
    const [result] = await pool.query(
      'DELETE FROM Fournisseur WHERE codeFournisseur = ?',
      [codeFournisseur]
    );
    return result.affectedRows > 0;
  },

  async getProduitsFournis(codeFournisseur) {
    const [rows] = await pool.query(
      `SELECT p.*, a.quantiteApprovisionnee, a.dateApprovisionnement
       FROM Approvisionner a
       INNER JOIN Produit p ON a.produitRef = p.ref
       WHERE a.codeFournisseur = ?`,
      [codeFournisseur]
    );
    return rows;
  }
};

module.exports = FournisseurModel;

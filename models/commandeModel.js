const pool = require('../config/db');

const CommandeModel = {
  async getAll() {
    const [rows] = await pool.query(
      `SELECT co.*, cl.nomC, cl.email AS clientEmailInfo
       FROM Commande co
       INNER JOIN Client cl ON co.clientEmail = cl.email
       ORDER BY co.date DESC`
    );
    return rows;
  },

  async getByClient(clientEmail) {
    const [rows] = await pool.query(
      'SELECT * FROM Commande WHERE clientEmail = ? ORDER BY date DESC',
      [clientEmail]
    );
    return rows;
  },

  async getById(noCommande) {
    const [rows] = await pool.query(
      `SELECT co.*, cl.nomC, cl.email AS clientEmailInfo
       FROM Commande co
       INNER JOIN Client cl ON co.clientEmail = cl.email
       WHERE co.noCommande = ?`,
      [noCommande]
    );
    return rows[0];
  },

  async getLignes(noCommande) {
    const [rows] = await pool.query(
      `SELECT lc.*, p.nomP, p.image
       FROM LigneCommande lc
       INNER JOIN Produit p ON lc.produitRef = p.ref
       WHERE lc.noCommande = ?`,
      [noCommande]
    );
    return rows;
  },

  async create(connection, { clientEmail, adresseLivraison, telephoneLivraison, montantTotal, modePaiement }) {
    const [result] = await connection.query(
      `INSERT INTO Commande (clientEmail, adresseLivraison, telephoneLivraison, montantTotal, modePaiement, statut)
       VALUES (?, ?, ?, ?, ?, 'EN_ATTENTE')`,
      [clientEmail, adresseLivraison, telephoneLivraison, montantTotal, modePaiement || 'MOBILE_MONEY']
    );
    return result.insertId;
  },

  async addLigne(connection, { noCommande, produitRef, qteCommande, prixFacture }) {
    await connection.query(
      `INSERT INTO LigneCommande (noCommande, produitRef, qteCommande, prixFacture)
       VALUES (?, ?, ?, ?)`,
      [noCommande, produitRef, qteCommande, prixFacture]
    );
  },

  async updateStatut(noCommande, statut) {
    await pool.query('UPDATE Commande SET statut = ? WHERE noCommande = ?', [statut, noCommande]);
    return this.getById(noCommande);
  },

  async updatePaiement(connection, noCommande, referenceTransaction) {
    await connection.query(
      `UPDATE Commande SET statut = 'PAYEE', referenceTransaction = ? WHERE noCommande = ?`,
      [referenceTransaction, noCommande]
    );
  },

  async updateCoursier(noCommande, nomCoursier) {
    await pool.query('UPDATE Commande SET nomCoursier = ? WHERE noCommande = ?', [nomCoursier, noCommande]);
    return this.getById(noCommande);
  },

  async getStatistiques() {
    const [[totalCommandes]] = await pool.query('SELECT COUNT(*) AS total FROM Commande');
    const [[chiffreAffaires]] = await pool.query(
      `SELECT COALESCE(SUM(montantTotal), 0) AS total FROM Commande WHERE statut != 'ANNULEE'`
    );
    const [[totalClients]] = await pool.query(`SELECT COUNT(*) AS total FROM Client WHERE role = 'CLIENT'`);
    const [[totalProduits]] = await pool.query('SELECT COUNT(*) AS total FROM Produit WHERE actif = 1');
    const [parStatut] = await pool.query(
      'SELECT statut, COUNT(*) AS total FROM Commande GROUP BY statut'
    );
    const [produitsPopulaires] = await pool.query(
      `SELECT p.nomP, p.ref, SUM(lc.qteCommande) AS totalVendu
       FROM LigneCommande lc
       INNER JOIN Produit p ON lc.produitRef = p.ref
       GROUP BY p.ref, p.nomP
       ORDER BY totalVendu DESC
       LIMIT 5`
    );

    return {
      totalCommandes: totalCommandes.total,
      chiffreAffaires: chiffreAffaires.total,
      totalClients: totalClients.total,
      totalProduits: totalProduits.total,
      parStatut,
      produitsPopulaires
    };
  }
};

module.exports = CommandeModel;

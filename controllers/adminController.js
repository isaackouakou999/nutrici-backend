const CommandeModel = require('../models/commandeModel');
const ProduitModel = require('../models/produitModel');

const AdminController = {
  async statistiques(req, res, next) {
    try {
      const stats = await CommandeModel.getStatistiques();
      res.status(200).json({ success: true, data: stats });
    } catch (error) { next(error); }
  },

  async produitsFaibleStock(req, res, next) {
    try {
      const seuil = parseInt(req.query.seuil) || 10;
      const produits = await ProduitModel.getAll();
      const faibleStock = produits.filter(p => p.qteStock <= seuil);
      res.status(200).json({ success: true, data: faibleStock });
    } catch (error) { next(error); }
  }
};

module.exports = AdminController;

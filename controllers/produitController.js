const ProduitModel = require('../models/produitModel');
const CategorieModel = require('../models/categorieModel');

const ProduitController = {
  async getAll(req, res, next) {
    try {
      const { categorie, recherche } = req.query;
      const produits = await ProduitModel.getAll({ categorieCode: categorie, recherche });
      res.status(200).json({ success: true, data: produits });
    } catch (error) { next(error); }
  },

  async getOne(req, res, next) {
    try {
      const produit = await ProduitModel.getByRef(req.params.ref);
      if (!produit) {
        return res.status(404).json({ success: false, message: 'Produit non trouve.' });
      }
      res.status(200).json({ success: true, data: produit });
    } catch (error) { next(error); }
  },

  async create(req, res, next) {
    try {
      const { ref, nomP, description, prixUnitaire, qteStock, image, categorieCode } = req.body;

      if (!ref || !nomP || prixUnitaire === undefined || !categorieCode) {
        return res.status(400).json({
          success: false,
          message: 'Reference, nom, prix unitaire et categorie sont obligatoires.'
        });
      }

      if (isNaN(prixUnitaire) || prixUnitaire < 0) {
        return res.status(400).json({ success: false, message: 'Le prix doit etre un nombre positif.' });
      }

      const categorie = await CategorieModel.getByCode(categorieCode);
      if (!categorie) {
        return res.status(404).json({ success: false, message: 'Categorie inexistante.' });
      }

      const existe = await ProduitModel.getByRef(ref);
      if (existe) {
        return res.status(409).json({ success: false, message: 'Cette reference produit existe deja.' });
      }

      const produit = await ProduitModel.create({
        ref, nomP, description, prixUnitaire, qteStock, image, categorieCode
      });
      res.status(201).json({ success: true, message: 'Produit cree avec succes.', data: produit });
    } catch (error) { next(error); }
  },

  async update(req, res, next) {
    try {
      const { nomP, description, prixUnitaire, image, categorieCode } = req.body;
      const existe = await ProduitModel.getByRef(req.params.ref);
      if (!existe) {
        return res.status(404).json({ success: false, message: 'Produit non trouve.' });
      }

      if (!nomP || prixUnitaire === undefined || !categorieCode) {
        return res.status(400).json({
          success: false,
          message: 'Nom, prix et categorie sont obligatoires.'
        });
      }

      const categorie = await CategorieModel.getByCode(categorieCode);
      if (!categorie) {
        return res.status(404).json({ success: false, message: 'Categorie inexistante.' });
      }

      const produit = await ProduitModel.update(req.params.ref, {
        nomP, description, prixUnitaire, image, categorieCode
      });
      res.status(200).json({ success: true, message: 'Produit mis a jour.', data: produit });
    } catch (error) { next(error); }
  },

  async updateStock(req, res, next) {
    try {
      const { qteStock } = req.body;
      if (qteStock === undefined || isNaN(qteStock) || qteStock < 0) {
        return res.status(400).json({ success: false, message: 'Quantite de stock invalide.' });
      }
      const existe = await ProduitModel.getByRef(req.params.ref);
      if (!existe) {
        return res.status(404).json({ success: false, message: 'Produit non trouve.' });
      }
      const produit = await ProduitModel.updateStock(req.params.ref, qteStock);
      res.status(200).json({ success: true, message: 'Stock mis a jour.', data: produit });
    } catch (error) { next(error); }
  },

  async remove(req, res, next) {
    try {
      const supprime = await ProduitModel.remove(req.params.ref);
      if (!supprime) {
        return res.status(404).json({ success: false, message: 'Produit non trouve.' });
      }
      res.status(200).json({ success: true, message: 'Produit supprime avec succes.' });
    } catch (error) { next(error); }
  }
};

module.exports = ProduitController;

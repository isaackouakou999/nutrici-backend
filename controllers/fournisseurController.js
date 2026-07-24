const FournisseurModel = require('../models/fournisseurModel');

const FournisseurController = {
  async getAll(req, res, next) {
    try {
      const fournisseurs = await FournisseurModel.getAll();
      res.status(200).json({ success: true, data: fournisseurs });
    } catch (error) { next(error); }
  },

  async getOne(req, res, next) {
    try {
      const fournisseur = await FournisseurModel.getByCode(req.params.code);
      if (!fournisseur) {
        return res.status(404).json({ success: false, message: 'Fournisseur non trouve.' });
      }
      const produits = await FournisseurModel.getProduitsFournis(req.params.code);
      res.status(200).json({ success: true, data: { ...fournisseur, produits } });
    } catch (error) { next(error); }
  },

  async create(req, res, next) {
    try {
      const { codeFournisseur, raisonSocial, pays, emailFournisseur, telephone } = req.body;
      if (!codeFournisseur || !raisonSocial || !pays || !emailFournisseur) {
        return res.status(400).json({
          success: false,
          message: 'Code, raison sociale, pays et email sont obligatoires.'
        });
      }
      const existe = await FournisseurModel.getByCode(codeFournisseur);
      if (existe) {
        return res.status(409).json({ success: false, message: 'Ce code fournisseur existe deja.' });
      }
      const fournisseur = await FournisseurModel.create({
        codeFournisseur, raisonSocial, pays, emailFournisseur, telephone
      });
      res.status(201).json({ success: true, message: 'Fournisseur cree avec succes.', data: fournisseur });
    } catch (error) { next(error); }
  },

  async update(req, res, next) {
    try {
      const { raisonSocial, pays, emailFournisseur, telephone } = req.body;
      const existe = await FournisseurModel.getByCode(req.params.code);
      if (!existe) {
        return res.status(404).json({ success: false, message: 'Fournisseur non trouve.' });
      }
      const fournisseur = await FournisseurModel.update(req.params.code, {
        raisonSocial, pays, emailFournisseur, telephone
      });
      res.status(200).json({ success: true, message: 'Fournisseur mis a jour.', data: fournisseur });
    } catch (error) { next(error); }
  },

  async remove(req, res, next) {
    try {
      const supprime = await FournisseurModel.remove(req.params.code);
      if (!supprime) {
        return res.status(404).json({ success: false, message: 'Fournisseur non trouve.' });
      }
      res.status(200).json({ success: true, message: 'Fournisseur supprime avec succes.' });
    } catch (error) { next(error); }
  }
};

module.exports = FournisseurController;

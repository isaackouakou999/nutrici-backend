const CategorieModel = require('../models/categorieModel');

const CategorieController = {
  async getAll(req, res, next) {
    try {
      const categories = await CategorieModel.getAll();
      res.status(200).json({ success: true, data: categories });
    } catch (error) { next(error); }
  },

  async getOne(req, res, next) {
    try {
      const categorie = await CategorieModel.getByCode(req.params.code);
      if (!categorie) {
        return res.status(404).json({ success: false, message: 'Categorie non trouvee.' });
      }
      res.status(200).json({ success: true, data: categorie });
    } catch (error) { next(error); }
  },

  async create(req, res, next) {
    try {
      const { code, libelle, description, image } = req.body;
      if (!code || !libelle) {
        return res.status(400).json({ success: false, message: 'Code et libelle sont obligatoires.' });
      }
      const existe = await CategorieModel.getByCode(code);
      if (existe) {
        return res.status(409).json({ success: false, message: 'Ce code de categorie existe deja.' });
      }
      const categorie = await CategorieModel.create({ code, libelle, description, image });
      res.status(201).json({ success: true, message: 'Categorie creee avec succes.', data: categorie });
    } catch (error) { next(error); }
  },

  async update(req, res, next) {
    try {
      const { libelle, description, image } = req.body;
      const existe = await CategorieModel.getByCode(req.params.code);
      if (!existe) {
        return res.status(404).json({ success: false, message: 'Categorie non trouvee.' });
      }
      if (!libelle) {
        return res.status(400).json({ success: false, message: 'Le libelle est obligatoire.' });
      }
      const categorie = await CategorieModel.update(req.params.code, { libelle, description, image });
      res.status(200).json({ success: true, message: 'Categorie mise a jour.', data: categorie });
    } catch (error) { next(error); }
  },

  async remove(req, res, next) {
    try {
      const nbProduits = await CategorieModel.countProduits(req.params.code);
      if (nbProduits > 0) {
        return res.status(400).json({
          success: false,
          message: `Impossible de supprimer : ${nbProduits} produit(s) sont rattaches a cette categorie.`
        });
      }
      const supprime = await CategorieModel.remove(req.params.code);
      if (!supprime) {
        return res.status(404).json({ success: false, message: 'Categorie non trouvee.' });
      }
      res.status(200).json({ success: true, message: 'Categorie supprimee avec succes.' });
    } catch (error) { next(error); }
  }
};

module.exports = CategorieController;

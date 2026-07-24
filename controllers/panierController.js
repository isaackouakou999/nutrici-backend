const ProduitModel = require('../models/produitModel');

const PanierController = {
  async valider(req, res, next) {
    try {
      const { articles } = req.body; // [{ ref, quantite }]

      if (!Array.isArray(articles) || articles.length === 0) {
        return res.status(400).json({ success: false, message: 'Le panier est vide.' });
      }

      const resultats = [];
      let montantTotal = 0;
      let erreur = null;

      for (const article of articles) {
        const produit = await ProduitModel.getByRef(article.ref);

        if (!produit) {
          erreur = `Le produit ${article.ref} n existe plus.`;
          break;
        }
        if (produit.qteStock < article.quantite) {
          erreur = `Stock insuffisant pour "${produit.nomP}". Disponible : ${produit.qteStock}.`;
          break;
        }

        const sousTotal = produit.prixUnitaire * article.quantite;
        montantTotal += sousTotal;

        resultats.push({
          ref: produit.ref,
          nomP: produit.nomP,
          prixUnitaire: produit.prixUnitaire,
          quantite: article.quantite,
          sousTotal,
          image: produit.image
        });
      }

      if (erreur) {
        return res.status(400).json({ success: false, message: erreur });
      }

      res.status(200).json({
        success: true,
        data: { articles: resultats, montantTotal }
      });
    } catch (error) { next(error); }
  }
};

module.exports = PanierController;

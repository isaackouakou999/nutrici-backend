const pool = require('../config/db');
const CommandeModel = require('../models/commandeModel');
const ProduitModel = require('../models/produitModel');

const CommandeController = {
  async creer(req, res, next) {
    const connection = await pool.getConnection();
    try {
      const { articles, adresseLivraison, telephoneLivraison } = req.body;
      const clientEmail = req.user.email;

      if (!Array.isArray(articles) || articles.length === 0) {
        connection.release();
        return res.status(400).json({ success: false, message: 'Le panier est vide.' });
      }
      if (!adresseLivraison || !telephoneLivraison) {
        connection.release();
        return res.status(400).json({
          success: false,
          message: 'Adresse et telephone de livraison sont obligatoires.'
        });
      }

      await connection.beginTransaction();

      let montantTotal = 0;
      const lignesAVerifier = [];

      for (const article of articles) {
        const produit = await ProduitModel.getByRef(article.ref);
        if (!produit) {
          throw Object.assign(new Error(`Le produit ${article.ref} n existe pas.`), { statusCode: 404 });
        }
        if (produit.qteStock < article.quantite) {
          throw Object.assign(
            new Error(`Stock insuffisant pour "${produit.nomP}". Disponible : ${produit.qteStock}.`),
            { statusCode: 400 }
          );
        }
        const sousTotal = produit.prixUnitaire * article.quantite;
        montantTotal += sousTotal;
        lignesAVerifier.push({ ref: produit.ref, quantite: article.quantite, prixUnitaire: produit.prixUnitaire });
      }

      const noCommande = await CommandeModel.create(connection, {
        clientEmail,
        adresseLivraison,
        telephoneLivraison,
        montantTotal,
        modePaiement: 'MOBILE_MONEY'
      });

      for (const ligne of lignesAVerifier) {
        await CommandeModel.addLigne(connection, {
          noCommande,
          produitRef: ligne.ref,
          qteCommande: ligne.quantite,
          prixFacture: ligne.prixUnitaire
        });
        await ProduitModel.decrementStock(ligne.ref, ligne.quantite, connection);
      }

      await connection.commit();
      connection.release();

      const commande = await CommandeModel.getById(noCommande);
      const lignes = await CommandeModel.getLignes(noCommande);

      res.status(201).json({
        success: true,
        message: 'Commande creee avec succes. Veuillez proceder au paiement.',
        data: { ...commande, lignes }
      });
    } catch (error) {
      await connection.rollback();
      connection.release();
      next(error);
    }
  },

  async getMesCommandes(req, res, next) {
    try {
      const commandes = await CommandeModel.getByClient(req.user.email);
      const commandesAvecLignes = await Promise.all(
        commandes.map(async (c) => {
          const lignes = await CommandeModel.getLignes(c.noCommande);
          return { ...c, lignes };
        })
      );
      res.status(200).json({ success: true, data: commandesAvecLignes });
    } catch (error) { next(error); }
  },

  async getOne(req, res, next) {
    try {
      const commande = await CommandeModel.getById(req.params.id);
      if (!commande) {
        return res.status(404).json({ success: false, message: 'Commande non trouvee.' });
      }
      if (req.user.role !== 'ADMINISTRATEUR' && commande.clientEmail !== req.user.email) {
        return res.status(403).json({ success: false, message: 'Acces refuse a cette commande.' });
      }
      const lignes = await CommandeModel.getLignes(req.params.id);
      res.status(200).json({ success: true, data: { ...commande, lignes } });
    } catch (error) { next(error); }
  },

  async getAll(req, res, next) {
    try {
      const commandes = await CommandeModel.getAll();
      res.status(200).json({ success: true, data: commandes });
    } catch (error) { next(error); }
  },

  async changerStatut(req, res, next) {
    try {
      const { statut } = req.body;
      const statutsValides = ['EN_ATTENTE', 'PAYEE', 'EN_PREPARATION', 'EXPEDIEE', 'LIVREE', 'ANNULEE'];
      if (!statutsValides.includes(statut)) {
        return res.status(400).json({ success: false, message: 'Statut invalide.' });
      }
      const commande = await CommandeModel.getById(req.params.id);
      if (!commande) {
        return res.status(404).json({ success: false, message: 'Commande non trouvee.' });
      }
      const misAJour = await CommandeModel.updateStatut(req.params.id, statut);
      res.status(200).json({ success: true, message: 'Statut mis a jour.', data: misAJour });
    } catch (error) { next(error); }
  },

  async affecterCoursier(req, res, next) {
    try {
      const { nomCoursier } = req.body;
      if (!nomCoursier) {
        return res.status(400).json({ success: false, message: 'Le nom du coursier est requis.' });
      }
      const commande = await CommandeModel.getById(req.params.id);
      if (!commande) {
        return res.status(404).json({ success: false, message: 'Commande non trouvee.' });
      }
      const misAJour = await CommandeModel.updateCoursier(req.params.id, nomCoursier);
      res.status(200).json({ success: true, message: 'Coursier affecte.', data: misAJour });
    } catch (error) { next(error); }
  },

  async genererBonLivraison(req, res, next) {
    try {
      const commande = await CommandeModel.getById(req.params.id);
      if (!commande) {
        return res.status(404).json({ success: false, message: 'Commande non trouvee.' });
      }
      const lignes = await CommandeModel.getLignes(req.params.id);
      const client = await require('../models/clientModel').getByEmailSafe(commande.clientEmail);

      const bonLivraison = {
        numeroCommande: commande.noCommande,
        date: commande.date,
        client: {
          nom: client.nomC,
          email: client.email,
          telephone: commande.telephoneLivraison,
          adresse: commande.adresseLivraison
        },
        produits: lignes.map(l => ({
          nomP: l.nomP,
          quantite: l.qteCommande,
          prixUnitaire: l.prixFacture,
          sousTotal: l.qteCommande * l.prixFacture
        })),
        montantTotal: commande.montantTotal,
        nomCoursier: commande.nomCoursier || 'Non affecte',
        statut: commande.statut
      };

      res.status(200).json({ success: true, data: bonLivraison });
    } catch (error) { next(error); }
  }
};

module.exports = CommandeController;

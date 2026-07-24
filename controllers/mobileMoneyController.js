const pool = require('../config/db');
const CommandeModel = require('../models/commandeModel');

function genererReferenceTransaction() {
  const prefixe = 'MM';
  const timestamp = Date.now().toString().slice(-8);
  const aleatoire = Math.floor(1000 + Math.random() * 9000);
  return `${prefixe}-${timestamp}-${aleatoire}`;
}

const MobileMoneyController = {
  async payer(req, res, next) {
    const connection = await pool.getConnection();
    try {
      const { noCommande, operateur, numeroTelephone } = req.body;

      if (!noCommande || !operateur || !numeroTelephone) {
        connection.release();
        return res.status(400).json({
          success: false,
          message: 'Numero de commande, operateur et numero de telephone sont obligatoires.'
        });
      }

      const operateursValides = ['ORANGE_MONEY', 'MTN_MONEY', 'MOOV_MONEY', 'WAVE'];
      if (!operateursValides.includes(operateur)) {
        connection.release();
        return res.status(400).json({ success: false, message: 'Operateur Mobile Money non supporte.' });
      }

      const regexTelephone = /^(\+225)?[0-9]{8,10}$/;
      if (!regexTelephone.test(numeroTelephone.replace(/\s/g, ''))) {
        connection.release();
        return res.status(400).json({ success: false, message: 'Numero de telephone invalide.' });
      }

      const commande = await CommandeModel.getById(noCommande);
      if (!commande) {
        connection.release();
        return res.status(404).json({ success: false, message: 'Commande non trouvee.' });
      }
      if (commande.clientEmail !== req.user.email) {
        connection.release();
        return res.status(403).json({ success: false, message: 'Cette commande ne vous appartient pas.' });
      }
      if (commande.statut !== 'EN_ATTENTE') {
        connection.release();
        return res.status(400).json({
          success: false,
          message: 'Cette commande a deja ete traitee ou payee.'
        });
      }

      // ===== SIMULATION DU DELAI DE TRAITEMENT MOBILE MONEY =====
      await new Promise(resolve => setTimeout(resolve, 800));

      // Simulation : succes dans 95% des cas
      const paiementReussi = Math.random() < 0.95;

      if (!paiementReussi) {
        connection.release();
        return res.status(402).json({
          success: false,
          message: 'Le paiement a echoue. Veuillez verifier votre solde et reessayer.'
        });
      }

      const referenceTransaction = genererReferenceTransaction();

      await connection.beginTransaction();
      await CommandeModel.updatePaiement(connection, noCommande, referenceTransaction);
      await connection.commit();
      connection.release();

      const commandeMiseAJour = await CommandeModel.getById(noCommande);

      res.status(200).json({
        success: true,
        message: 'Paiement Mobile Money effectue avec succes.',
        data: {
          referenceTransaction,
          operateur,
          montant: commande.montantTotal,
          commande: commandeMiseAJour
        }
      });
    } catch (error) {
      await connection.rollback();
      connection.release();
      next(error);
    }
  }
};

module.exports = MobileMoneyController;

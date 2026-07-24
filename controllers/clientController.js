const bcrypt = require('bcryptjs');
const ClientModel = require('../models/clientModel');

const ClientController = {
  async getAll(req, res, next) {
    try {
      const clients = await ClientModel.getAll();
      res.status(200).json({ success: true, data: clients });
    } catch (error) { next(error); }
  },

  async getProfil(req, res, next) {
    try {
      const client = await ClientModel.getByEmailSafe(req.user.email);
      if (!client) {
        return res.status(404).json({ success: false, message: 'Client non trouve.' });
      }
      res.status(200).json({ success: true, data: client });
    } catch (error) { next(error); }
  },

  async updateProfil(req, res, next) {
    try {
      const { nomC, telephone, adresse } = req.body;
      if (!nomC || !telephone) {
        return res.status(400).json({ success: false, message: 'Nom et telephone sont obligatoires.' });
      }
      const client = await ClientModel.update(req.user.email, { nomC, telephone, adresse });
      res.status(200).json({ success: true, message: 'Profil mis a jour avec succes.', data: client });
    } catch (error) { next(error); }
  },

  async changerMotDePasse(req, res, next) {
    try {
      const { ancienMotDePasse, nouveauMotDePasse } = req.body;
      if (!ancienMotDePasse || !nouveauMotDePasse) {
        return res.status(400).json({ success: false, message: 'Ancien et nouveau mot de passe requis.' });
      }
      if (nouveauMotDePasse.length < 6) {
        return res.status(400).json({
          success: false,
          message: 'Le nouveau mot de passe doit contenir au moins 6 caracteres.'
        });
      }

      const client = await ClientModel.getByEmail(req.user.email);
      const valide = await bcrypt.compare(ancienMotDePasse, client.motDePasse);
      if (!valide) {
        return res.status(401).json({ success: false, message: 'Ancien mot de passe incorrect.' });
      }

      const nouveauHash = await bcrypt.hash(nouveauMotDePasse, 10);
      await ClientModel.updatePassword(req.user.email, nouveauHash);
      res.status(200).json({ success: true, message: 'Mot de passe modifie avec succes.' });
    } catch (error) { next(error); }
  },

  async remove(req, res, next) {
    try {
      const supprime = await ClientModel.remove(req.params.email);
      if (!supprime) {
        return res.status(404).json({ success: false, message: 'Client non trouve.' });
      }
      res.status(200).json({ success: true, message: 'Client supprime avec succes.' });
    } catch (error) { next(error); }
  }
};

module.exports = ClientController;

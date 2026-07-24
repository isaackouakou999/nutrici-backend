const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const ClientModel = require('../models/clientModel');

function genererToken(client) {
  return jwt.sign(
    { email: client.email, role: client.role, nomC: client.nomC },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
}

function validerEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

const AuthController = {
  async register(req, res, next) {
    try {
      const { email, nomC, telephone, adresse, motDePasse } = req.body;

      if (!email || !nomC || !telephone || !motDePasse) {
        return res.status(400).json({
          success: false,
          message: 'Tous les champs obligatoires doivent etre renseignes (email, nom, telephone, mot de passe).'
        });
      }

      if (!validerEmail(email)) {
        return res.status(400).json({ success: false, message: 'Format d email invalide.' });
      }

      if (motDePasse.length < 6) {
        return res.status(400).json({
          success: false,
          message: 'Le mot de passe doit contenir au moins 6 caracteres.'
        });
      }

      const clientExistant = await ClientModel.getByEmail(email);
      if (clientExistant) {
        return res.status(409).json({ success: false, message: 'Un compte existe deja avec cet email.' });
      }

      const motDePasseHash = await bcrypt.hash(motDePasse, 10);
      const nouveauClient = await ClientModel.create({
        email,
        nomC,
        telephone,
        adresse,
        motDePasse: motDePasseHash,
        role: 'CLIENT'
      });

      const token = genererToken(nouveauClient);

      return res.status(201).json({
        success: true,
        message: 'Inscription reussie.',
        token,
        user: nouveauClient
      });
    } catch (error) {
      next(error);
    }
  },

  async login(req, res, next) {
    try {
      const { email, motDePasse } = req.body;

      if (!email || !motDePasse) {
        return res.status(400).json({ success: false, message: 'Email et mot de passe requis.' });
      }

      const client = await ClientModel.getByEmail(email);
      if (!client) {
        return res.status(401).json({ success: false, message: 'Identifiants incorrects.' });
      }

      const motDePasseValide = await bcrypt.compare(motDePasse, client.motDePasse);
      if (!motDePasseValide) {
        return res.status(401).json({ success: false, message: 'Identifiants incorrects.' });
      }

      const token = genererToken(client);
      delete client.motDePasse;

      return res.status(200).json({
        success: true,
        message: 'Connexion reussie.',
        token,
        user: client
      });
    } catch (error) {
      next(error);
    }
  },

  async loginAdmin(req, res, next) {
    try {
      const { email, motDePasse } = req.body;

      if (!email || !motDePasse) {
        return res.status(400).json({ success: false, message: 'Email et mot de passe requis.' });
      }

      const client = await ClientModel.getByEmail(email);
      if (!client || client.role !== 'ADMINISTRATEUR') {
        return res.status(403).json({
          success: false,
          message: 'Acces reserve aux administrateurs.'
        });
      }

      const motDePasseValide = await bcrypt.compare(motDePasse, client.motDePasse);
      if (!motDePasseValide) {
        return res.status(401).json({ success: false, message: 'Identifiants incorrects.' });
      }

      const token = genererToken(client);
      delete client.motDePasse;

      return res.status(200).json({
        success: true,
        message: 'Connexion administrateur reussie.',
        token,
        user: client
      });
    } catch (error) {
      next(error);
    }
  },

  async me(req, res, next) {
    try {
      const client = await ClientModel.getByEmailSafe(req.user.email);
      if (!client) {
        return res.status(404).json({ success: false, message: 'Utilisateur non trouve.' });
      }
      return res.status(200).json({ success: true, user: client });
    } catch (error) {
      next(error);
    }
  }
};

module.exports = AuthController;

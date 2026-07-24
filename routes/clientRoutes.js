const express = require('express');
const router = express.Router();
const ClientController = require('../controllers/clientController');
const authMiddleware = require('../middlewares/authMiddleware');
const adminMiddleware = require('../middlewares/adminMiddleware');

router.get('/', authMiddleware, adminMiddleware, ClientController.getAll);
router.get('/profil', authMiddleware, ClientController.getProfil);
router.put('/profil', authMiddleware, ClientController.updateProfil);
router.put('/mot-de-passe', authMiddleware, ClientController.changerMotDePasse);
router.delete('/:email', authMiddleware, adminMiddleware, ClientController.remove);

module.exports = router;

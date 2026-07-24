const express = require('express');
const router = express.Router();
const CommandeController = require('../controllers/commandeController');
const authMiddleware = require('../middlewares/authMiddleware');
const adminMiddleware = require('../middlewares/adminMiddleware');

router.post('/', authMiddleware, CommandeController.creer);
router.get('/mes-commandes', authMiddleware, CommandeController.getMesCommandes);
router.get('/', authMiddleware, adminMiddleware, CommandeController.getAll);
router.get('/:id', authMiddleware, CommandeController.getOne);
router.patch('/:id/statut', authMiddleware, adminMiddleware, CommandeController.changerStatut);
router.patch('/:id/coursier', authMiddleware, adminMiddleware, CommandeController.affecterCoursier);
router.get('/:id/bon-livraison', authMiddleware, adminMiddleware, CommandeController.genererBonLivraison);

module.exports = router;

const express = require('express');
const router = express.Router();
const FournisseurController = require('../controllers/fournisseurController');
const authMiddleware = require('../middlewares/authMiddleware');
const adminMiddleware = require('../middlewares/adminMiddleware');

router.get('/', authMiddleware, adminMiddleware, FournisseurController.getAll);
router.get('/:code', authMiddleware, adminMiddleware, FournisseurController.getOne);
router.post('/', authMiddleware, adminMiddleware, FournisseurController.create);
router.put('/:code', authMiddleware, adminMiddleware, FournisseurController.update);
router.delete('/:code', authMiddleware, adminMiddleware, FournisseurController.remove);

module.exports = router;

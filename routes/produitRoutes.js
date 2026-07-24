const express = require('express');
const router = express.Router();
const ProduitController = require('../controllers/produitController');
const authMiddleware = require('../middlewares/authMiddleware');
const adminMiddleware = require('../middlewares/adminMiddleware');

router.get('/', ProduitController.getAll);
router.get('/:ref', ProduitController.getOne);
router.post('/', authMiddleware, adminMiddleware, ProduitController.create);
router.put('/:ref', authMiddleware, adminMiddleware, ProduitController.update);
router.patch('/:ref/stock', authMiddleware, adminMiddleware, ProduitController.updateStock);
router.delete('/:ref', authMiddleware, adminMiddleware, ProduitController.remove);

module.exports = router;

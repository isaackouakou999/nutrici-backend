const express = require('express');
const router = express.Router();
const CategorieController = require('../controllers/categorieController');
const authMiddleware = require('../middlewares/authMiddleware');
const adminMiddleware = require('../middlewares/adminMiddleware');

router.get('/', CategorieController.getAll);
router.get('/:code', CategorieController.getOne);
router.post('/', authMiddleware, adminMiddleware, CategorieController.create);
router.put('/:code', authMiddleware, adminMiddleware, CategorieController.update);
router.delete('/:code', authMiddleware, adminMiddleware, CategorieController.remove);

module.exports = router;

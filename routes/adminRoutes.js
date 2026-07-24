const express = require('express');
const router = express.Router();
const AdminController = require('../controllers/adminController');
const authMiddleware = require('../middlewares/authMiddleware');
const adminMiddleware = require('../middlewares/adminMiddleware');

router.get('/statistiques', authMiddleware, adminMiddleware, AdminController.statistiques);
router.get('/stock-faible', authMiddleware, adminMiddleware, AdminController.produitsFaibleStock);

module.exports = router;

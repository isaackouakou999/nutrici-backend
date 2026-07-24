const express = require('express');
const router = express.Router();
const PanierController = require('../controllers/panierController');
const authMiddleware = require('../middlewares/authMiddleware');

router.post('/valider', authMiddleware, PanierController.valider);

module.exports = router;

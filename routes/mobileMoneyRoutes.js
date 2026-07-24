const express = require('express');
const router = express.Router();
const MobileMoneyController = require('../controllers/mobileMoneyController');
const authMiddleware = require('../middlewares/authMiddleware');

router.post('/payer', authMiddleware, MobileMoneyController.payer);

module.exports = router;

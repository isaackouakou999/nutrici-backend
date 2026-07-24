const jwt = require('jsonwebtoken');
require('dotenv').config();

function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Acces refuse. Token manquant.' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { email, role }
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Token invalide ou expire.' });
  }
}

module.exports = authMiddleware;

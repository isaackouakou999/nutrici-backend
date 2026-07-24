function adminMiddleware(req, res, next) {
  if (!req.user || req.user.role !== 'ADMINISTRATEUR') {
    return res.status(403).json({
      success: false,
      message: 'Acces refuse. Reserve aux administrateurs.'
    });
  }
  next();
}

module.exports = adminMiddleware;

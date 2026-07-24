function notFoundHandler(req, res, next) {
  res.status(404).json({ success: false, message: `Route non trouvee : ${req.originalUrl}` });
}

function errorHandler(err, req, res, next) {
  console.error('❌ Erreur serveur :', err.stack || err.message);

  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    message: err.message || 'Erreur interne du serveur.'
  });
}

module.exports = { notFoundHandler, errorHandler };

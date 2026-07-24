require('dotenv').config();
const express = require('express');
const cors = require('cors');

const { notFoundHandler, errorHandler } = require('./middlewares/errorMiddleware');

const authRoutes = require('./routes/authRoutes');
const categorieRoutes = require('./routes/categorieRoutes');
const produitRoutes = require('./routes/produitRoutes');
const clientRoutes = require('./routes/clientRoutes');
const commandeRoutes = require('./routes/commandeRoutes');
const fournisseurRoutes = require('./routes/fournisseurRoutes');
const panierRoutes = require('./routes/panierRoutes');
const mobileMoneyRoutes = require('./routes/mobileMoneyRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();

// ✅ CORS pour InfinityFree
app.use(cors({
    origin: 'https://nutrici.infinityfreeapp.com',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));

// ✅ Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ Routes API
app.use('/api/auth', authRoutes);
app.use('/api/categories', categorieRoutes);
app.use('/api/produits', produitRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/commandes', commandeRoutes);
app.use('/api/fournisseurs', fournisseurRoutes);
app.use('/api/panier', panierRoutes);
app.use('/api/mobilemoney', mobileMoneyRoutes);
app.use('/api/admin', adminRoutes);

// ✅ Route de test
app.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'API NutriCI operationnelle sur Render ! 🚀'
    });
});

app.get('/api/health', (req, res) => {
    res.json({ success: true, message: 'API NutriCI operationnelle.' });
});

// ✅ Middlewares d'erreur
app.use(notFoundHandler);
app.use(errorHandler);

// ✅ Démarrer le serveur
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Serveur NutriCI demarre sur le port ${PORT}`);
});

module.exports = app;
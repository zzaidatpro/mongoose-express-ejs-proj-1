require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');

// Importation des modèles Mongoose
const Customer = require('./models/Customer');
const Account = require('./models/Account');
const Transaction = require('./models/transactions'); // Mis à jour avec le 'T' majuscule

const app = express();

// Configuration du moteur de rendu EJS
app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));

// Connexion à MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ Connecté à MongoDB'))
  .catch(err => console.error('❌ Erreur de connexion:', err));

// ----------------------------------------------------
// ROUTES DU SITE WEB
// ----------------------------------------------------

// 1. Page d'accueil : Liste des clients avec pagination dynamique
app.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50; // Par défaut 50 au lieu de 20
    const skip = (page - 1) * limit;

    // Compter le nombre total de clients dans la collection
    const totalCustomers = await Customer.countDocuments();

    // Récupérer les clients pour la page demandée
    const customers = await Customer.find({})
      .skip(skip)
      .limit(limit);

    // Calculer le nombre total de pages
    const totalPages = Math.ceil(totalCustomers / limit);

    // Envoi des variables requises par index.ejs
    res.render('index', {
      customers,
      currentPage: page,
      limit: limit,
      totalPages: totalPages,
      totalCustomers: totalCustomers
    });
  } catch (err) {
    res.status(500).send('Erreur serveur : ' + err.message);
  }
});

// 2. Page de détail d'un client
app.get('/customer/:username', async (req, res) => {
  try {
    const customer = await Customer.findOne({ username: req.params.username });
    if (!customer) return res.status(404).send('Client introuvable');

    // Récupérer les IDs des comptes associés au client
    const accountIds = customer.accountNumbers;

    // Récupérer les comptes associés dans la collection 'accounts'
    const accounts = await Account.find({
      $or: [
        { account_id: { $in: accountIds } },
        { "account_id.$numberInt": { $in: accountIds.map(String) } }
      ]
    });

    res.render('customer-detail', { customer, accounts });
  } catch (err) {
    res.status(500).send('Erreur serveur : ' + err.message);
  }
});

// 3. Page de détail d'un compte avec ses transactions
app.get('/account/:id', async (req, res) => {
  try {
    const accountId = Number(req.params.id);

    // Chercher le compte
    const account = await Account.findOne({
      $or: [
        { account_id: accountId },
        { "account_id.$numberInt": String(accountId) }
      ]
    });

    // Chercher les transactions associées
    const transactionDoc = await Transaction.findOne({
      $or: [
        { account_id: accountId },
        { "account_id.$numberInt": String(accountId) }
      ]
    });

    res.render('account-detail', { account, transactionDoc, accountId });
  } catch (err) {
    res.status(500).send('Erreur serveur : ' + err.message);
  }
});

// Lancement du serveur
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Site web démarré sur http://localhost:${PORT}`));
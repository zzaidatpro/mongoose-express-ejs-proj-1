require('dotenv').config();
const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);

const express = require('express');
const path = require('path');
const mongoose = require('mongoose');

const app = express();

// Importation des modèles Mongoose
const Customer = require('./models/Customer');
const Account = require('./models/Account');
const Transaction = require('./models/transactions');

// Middlewares
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public'))); // CSS dans public

// Configuration du moteur de rendu EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Connexion à MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ Connecté à MongoDB'))
  .catch(err => console.error('❌ Erreur de connexion:', err));

// ----------------------------------------------------
// 1. PAGE D'ACCUEIL (LISTE + FILTRES / PAGINATION)
// ----------------------------------------------------
app.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;

    const totalCustomers = await Customer.countDocuments();
    const customers = await Customer.find({})
      .skip(skip)
      .limit(limit);

    const totalPages = Math.ceil(totalCustomers / limit) || 1;

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

// ----------------------------------------------------
// 2. FORMULAIRES ET ACTIONS CRUD (À PLACER AVANT :username)
// ----------------------------------------------------

// [AJOUTER] Formulaire de création
app.get('/customer/add', (req, res) => {
  res.render('customer-form', { customer: null });
});

// [AJOUTER] Enregistrement en base
app.post('/customer/add', async (req, res) => {
  try {
    const { name, username, email, address, age, active } = req.body;

    await Customer.create({
      name,
      username,
      email,
      address,
      age: age ? Number(age) : undefined,
      active: active === 'on',
      accountNumbers: []
    });

    res.redirect('/');
  } catch (err) {
    res.status(500).send("Erreur lors de la création : " + err.message);
  }
});

// [MODIFIER] Formulaire d'édition
app.get('/customer/edit/:id', async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);
    if (!customer) return res.status(404).send('Client introuvable');

    res.render('customer-form', { customer });
  } catch (err) {
    res.status(500).send("Erreur serveur : " + err.message);
  }
});

// [MODIFIER] Enregistrement des modifications
app.post('/customer/edit/:id', async (req, res) => {
  try {
    const { name, username, email, address, age, active } = req.body;

    await Customer.findByIdAndUpdate(req.params.id, {
      name,
      username,
      email,
      address,
      age: age ? Number(age) : undefined,
      active: active === 'on'
    });

    res.redirect('/');
  } catch (err) {
    res.status(500).send("Erreur lors de la modification : " + err.message);
  }
});

// [SUPPRIMER] Action de suppression
app.post('/customer/delete/:id', async (req, res) => {
  try {
    await Customer.findByIdAndDelete(req.params.id);
    res.redirect('/');
  } catch (err) {
    res.status(500).send("Erreur lors de la suppression : " + err.message);
  }
});

// ----------------------------------------------------
// 3. DETAILS COMPTE
// ----------------------------------------------------
app.get('/account/:id', async (req, res) => {
  try {
    const accountId = Number(req.params.id);

    const account = await Account.findOne({
      $or: [
        { account_id: accountId },
        { "account_id.$numberInt": String(accountId) }
      ]
    });

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

// ----------------------------------------------------
// 4. ROUTE DYNAMIQUE USERNAME (TOUJOURS EN DERNIER !)
// ----------------------------------------------------
app.get('/customer/:username', async (req, res) => {
  try {
    const customer = await Customer.findOne({ username: req.params.username });
    if (!customer) return res.status(404).send('Client introuvable');

    const accountIds = customer.accountNumbers || [];

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

// Lancement du serveur
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Site web démarré sur http://localhost:${PORT}`));
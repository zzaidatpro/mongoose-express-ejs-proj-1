const mongoose = require('mongoose');

// Schéma pour chaque transaction individuelle dans le tableau "transactions"
const singleTransactionSchema = new mongoose.Schema({
  // Accepte un objet {$date: {$numberLong: "..."}} ou une Date JS classique
  date: mongoose.Schema.Types.Mixed,
  
  // Accepte un nombre simple ou {$numberInt: "..."}
  amount: mongoose.Schema.Types.Mixed,
  
  transaction_code: {
    type: String,
    enum: ['buy', 'sell']
  },
  
  symbol: String,
  
  // Prix et Total sous forme de chaînes de caractères (en raison de la très haute précision décimale)
  price: String,
  total: String
}, { _id: false });

// Schéma principal de la collection Transactions
const transactionSchema = new mongoose.Schema({
  account_id: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  
  transaction_count: {
    type: mongoose.Schema.Types.Mixed
  },
  
  // Plages de dates du "bucket"
  bucket_start_date: mongoose.Schema.Types.Mixed,
  bucket_end_date: mongoose.Schema.Types.Mixed,
  
  // Liste des opérations financières
  transactions: [singleTransactionSchema]
}, { timestamps: true });

// ----------------------------------------------------
// PROPRIÉTÉS VIRTUELLES (Getters propres pour votre code)
// ----------------------------------------------------

// Virtuel pour obtenir l'account_id sous forme de Nombre pur
transactionSchema.virtual('accountIdNumber').get(function() {
  if (this.account_id && typeof this.account_id === 'object' && this.account_id.$numberInt) {
    return Number(this.account_id.$numberInt);
  }
  return Number(this.account_id);
});

// Virtuel pour obtenir le nombre total de transactions sous forme de Nombre pur
transactionSchema.virtual('transactionCountNumber').get(function() {
  if (this.transaction_count && typeof this.transaction_count === 'object' && this.transaction_count.$numberInt) {
    return Number(this.transaction_count.$numberInt);
  }
  return Number(this.transaction_count);
});

// Configurer la sérialisation pour inclure les virtuels
transactionSchema.set('toJSON', { virtuals: true });
transactionSchema.set('toObject', { virtuals: true });

// Forcer le ciblage de la collection 'transactions'
module.exports = mongoose.model('Transaction', transactionSchema, 'transactions');
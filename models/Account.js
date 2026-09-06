const mongoose = require('mongoose');

const accountSchema = new mongoose.Schema({
  // Accepte un nombre simple ou l'objet {$numberInt: "..."}
  account_id: {
    type: mongoose.Schema.Types.Mixed,
    required: true,
    unique: true
  },
  
  // Accepte un nombre simple ou l'objet {$numberInt: "..."}
  limit: {
    type: mongoose.Schema.Types.Mixed
  },
  
  // Tableau de chaînes de caractères (ex: ["Derivatives", "InvestmentStock"])
  products: [{
    type: String
  }]
}, { timestamps: true });

// Virtual pour récupérer facilement account_id sous forme de nombre pur
accountSchema.virtual('accountIdNumber').get(function() {
  if (this.account_id && typeof this.account_id === 'object' && this.account_id.$numberInt) {
    return Number(this.account_id.$numberInt);
  }
  return Number(this.account_id);
});

// Virtual pour récupérer facilement la limite sous forme de nombre pur
accountSchema.virtual('limitNumber').get(function() {
  if (this.limit && typeof this.limit === 'object' && this.limit.$numberInt) {
    return Number(this.limit.$numberInt);
  }
  return Number(this.limit);
});

// Activer l'inclusion des virtuels lors de la sérialisation JSON
accountSchema.set('toJSON', { virtuals: true });
accountSchema.set('toObject', { virtuals: true });

// Forcer le ciblage de la collection 'accounts'
module.exports = mongoose.model('Account', accountSchema, 'accounts');
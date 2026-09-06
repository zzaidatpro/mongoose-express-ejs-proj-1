const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
  username: { type: String, required: true },
  name: { type: String, required: true },
  address: String,
  birthdate: mongoose.Schema.Types.Mixed,
  email: String,
  active: Boolean,
  accounts: [mongoose.Schema.Types.Mixed],
  tier_and_details: {
    type: Map,
    of: new mongoose.Schema({
      tier: String,
      id: String,
      active: Boolean,
      benefits: [String]
    }, { _id: false })
  }
}, { timestamps: true });

// Virtual pour récupérer facilement les IDs de compte sous forme de tableau de nombres [371138, 324287, ...]
customerSchema.virtual('accountNumbers').get(function() {
  if (!this.accounts) return [];
  return this.accounts.map(acc => {
    if (typeof acc === 'object' && acc.$numberInt) {
      return Number(acc.$numberInt);
    }
    return Number(acc);
  });
});

// Inclure les getters virtuels lors de la conversion en JSON / Objet
customerSchema.set('toJSON', { virtuals: true });
customerSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Customer', customerSchema, 'customers');
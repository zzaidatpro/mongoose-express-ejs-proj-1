const mongoose = require('mongoose');

const MonSchema = new mongoose.Schema({
  // Définition de vos champs ici
});

// Le 3ème argument force le nom exact de la collection sur Atlas
module.exports = mongoose.model('MaCollection', MonSchema, 'sample-dataset');
const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
  titre: {
    type: String,
    required: true
  },
  contenu: {
    type: String,
    required: true
  },
  enseignant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  enseignantNom: {
    type: String,
    required: true
  },
  classe: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Classe',
    required: true
  },
  classeNom: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  },
  lu: {
    type: Boolean,
    default: false
  },
  luPar: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }]
});

module.exports = mongoose.model('Message', MessageSchema);
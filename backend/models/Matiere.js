const mongoose = require('mongoose');

const MatiereSchema = new mongoose.Schema({
  nom: { type: String, required: true },
  enseignant: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  classe: { type: mongoose.Schema.Types.ObjectId, ref: 'Classe', required: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Matiere', MatiereSchema);
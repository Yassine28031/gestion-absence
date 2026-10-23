const mongoose = require('mongoose');

const EtudiantSchema = new mongoose.Schema({
  nom: { type: String, required: true },
  prenom: { type: String, required: true },
  email: { type: String, default: '' }
});

const ClasseSchema = new mongoose.Schema({
  nom: { type: String, required: true },
  niveau: { type: String, enum: ['L1', 'L2', 'L3', 'M1', 'M2'], required: true },
  filiere: { type: String, required: true },
  anneeScolaire: { type: String, default: '2025-2026' },
  etudiants: { type: [EtudiantSchema], default: [] },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Classe', ClasseSchema);
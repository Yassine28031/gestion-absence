const mongoose = require('mongoose');

const SeanceCoursSchema = new mongoose.Schema({
  jour: { type: String, enum: ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'], required: true },
  heureDebut: { type: String, required: true },
  heureFin: { type: String, required: true },
  matiere: { type: mongoose.Schema.Types.ObjectId, ref: 'Matiere', required: true },
  enseignant: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  classe: { type: mongoose.Schema.Types.ObjectId, ref: 'Classe', required: true },
  salle: { type: String, required: true }
});

const EmploiDuTempsSchema = new mongoose.Schema({
  classe: { type: mongoose.Schema.Types.ObjectId, ref: 'Classe', required: true, unique: true },
  semaine: { type: String, required: true },
  seances: [SeanceCoursSchema],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('EmploiDuTemps', EmploiDuTempsSchema);
const mongoose = require('mongoose');

const AbsenceSchema = new mongoose.Schema({
  etudiantNom: { type: String, required: true },
  etudiantPrenom: { type: String, required: true },
  present: { type: Boolean, default: false }
});

const SeanceSchema = new mongoose.Schema({
  matiere: { type: mongoose.Schema.Types.ObjectId, ref: 'Matiere', required: true },
  classe: { type: mongoose.Schema.Types.ObjectId, ref: 'Classe', required: true },
  enseignant: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: Date, default: Date.now },
  absences: [AbsenceSchema]
});

module.exports = mongoose.model('Seance', SeanceSchema);
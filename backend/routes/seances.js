const express = require('express');
const Seance = require('../models/Seance');
const Matiere = require('../models/Matiere');

const router = express.Router();

// GET toutes les séances
router.get('/', async (req, res) => {
  try {
    const { enseignant, classe } = req.query;
    const filter = {};
    if (enseignant) filter.enseignant = enseignant;
    if (classe) filter.classe = classe;

    const seances = await Seance.find(filter)
      .populate('matiere', 'nom')
      .populate('classe', 'nom niveau')
      .populate('enseignant', 'nom prenom')
      .sort({ date: -1 });

    res.json(seances);
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// POST créer une séance
router.post('/', async (req, res) => {
  try {
    const body = req.body;

    // Validation
    if (!body.matiere || !body.classe || !body.enseignant) {
      return res.status(400).json({ error: 'Champs requis manquants' });
    }

    // Récupérer le nom de la matière
    const matiere = await Matiere.findById(body.matiere).select('nom');

    const seance = await Seance.create({
      matiere: body.matiere,
      classe: body.classe,
      enseignant: body.enseignant,
      date: body.date || new Date(),
      absences: body.absences || []
    });

    res.status(201).json(seance);
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

module.exports = router;
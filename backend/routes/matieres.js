const express = require('express');
const Matiere = require('../models/Matiere');

const router = express.Router();

// GET toutes les matières
router.get('/', async (req, res) => {
  try {
    const { enseignant, classe } = req.query;
    const filter = {};
    if (enseignant) filter.enseignant = enseignant;
    if (classe) filter.classe = classe;

    const matieres = await Matiere.find(filter)
      .populate('enseignant', 'nom prenom email')
      .populate('classe', 'nom niveau filiere etudiants')
      .sort({ createdAt: -1 });

    res.json(matieres);
  } catch (error) {
    console.error('Erreur matieres GET:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération' });
  }
});

// POST créer une matière
router.post('/', async (req, res) => {
  try {
    const matiere = await Matiere.create(req.body);
    const populated = await matiere.populate([
      { path: 'enseignant', select: 'nom prenom email' },
      { path: 'classe', select: 'nom niveau filiere etudiants' }
    ]);
    res.status(201).json(populated);
  } catch (error) {
    console.error('Erreur matieres POST:', error);
    res.status(500).json({ error: 'Erreur lors de la création' });
  }
});

// DELETE supprimer une matière
router.delete('/:id', async (req, res) => {
  try {
    await Matiere.findByIdAndDelete(req.params.id);
    res.json({ message: 'Matière supprimée' });
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la suppression' });
  }
});

module.exports = router;
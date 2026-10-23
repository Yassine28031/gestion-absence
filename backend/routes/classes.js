const express = require('express');
const Classe = require('../models/Classe');
const Matiere = require('../models/Matiere');

const router = express.Router();

// GET toutes les classes
router.get('/', async (req, res) => {
  try {
    const classes = await Classe.find({}).sort({ createdAt: -1 });
    res.json(classes);
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la récupération' });
  }
});

// GET - Récupérer les classes d'un enseignant (via ses matières)
router.get('/enseignant/:enseignantId', async (req, res) => {
  try {
    const { enseignantId } = req.params;
    
    // Récupérer toutes les matières de l'enseignant
    const matieres = await Matiere.find({ enseignant: enseignantId }).populate('classe');
    
    // Extraire les classes uniques (sans doublons)
    const classesMap = new Map();
    matieres.forEach(matiere => {
      if (matiere.classe && !classesMap.has(matiere.classe._id.toString())) {
        classesMap.set(matiere.classe._id.toString(), matiere.classe);
      }
    });
    
    const classes = Array.from(classesMap.values());
    res.json(classes);
  } catch (error) {
    console.error('Erreur récupération classes enseignant:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération' });
  }
});

// GET une classe par ID
router.get('/:id', async (req, res) => {
  try {
    const classe = await Classe.findById(req.params.id);
    if (!classe) return res.status(404).json({ error: 'Classe non trouvée' });
    res.json(classe);
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la récupération' });
  }
});

// POST créer une classe
router.post('/', async (req, res) => {
  try {
    const classe = await Classe.create(req.body);
    res.status(201).json(classe);
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la création' });
  }
});

// DELETE supprimer une classe
router.delete('/:id', async (req, res) => {
  try {
    await Classe.findByIdAndDelete(req.params.id);
    res.json({ message: 'Classe supprimée' });
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la suppression' });
  }
});

// DELETE supprimer un étudiant d'une classe
router.delete('/:id/remove-student', async (req, res) => {
  try {
    const { id } = req.params;
    const { studentIndex } = req.body;

    const classe = await Classe.findById(id);
    if (!classe) {
      return res.status(404).json({ error: 'Classe non trouvée' });
    }

    if (studentIndex >= 0 && studentIndex < classe.etudiants.length) {
      classe.etudiants.splice(studentIndex, 1);
      await classe.save();
      res.json({ success: true, message: 'Étudiant supprimé avec succès' });
    } else {
      res.status(400).json({ error: 'Index étudiant invalide' });
    }
  } catch (error) {
    console.error('Erreur:', error);
    res.status(500).json({ error: 'Erreur lors de la suppression' });
  }
});

module.exports = router;
const express = require('express');
const EmploiDuTemps = require('../models/EmploiDuTemps');

const router = express.Router();

// GET emploi du temps
router.get('/', async (req, res) => {
  try {
    const { classe, enseignant } = req.query;

    if (classe) {
      const emploi = await EmploiDuTemps.findOne({ classe })
        .populate('seances.matiere', 'nom')
        .populate('seances.enseignant', 'nom prenom')
        .populate('seances.classe', 'nom niveau filiere');
      return res.json(emploi || { seances: [] });
    }

    if (enseignant) {
      const allEmplois = await EmploiDuTemps.find()
        .populate('seances.matiere', 'nom')
        .populate('seances.enseignant', 'nom prenom')
        .populate('seances.classe', 'nom niveau filiere');

      const enseignantSeances = [];
      for (const emploi of allEmplois) {
        for (const seance of emploi.seances) {
          if (seance.enseignant && seance.enseignant._id.toString() === enseignant) {
            enseignantSeances.push(seance);
          }
        }
      }
      return res.json({ seances: enseignantSeances });
    }

    res.json({ seances: [] });
  } catch (error) {
    console.error('Erreur emploi du temps GET:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération' });
  }
});

// POST créer/mettre à jour emploi du temps
router.post('/', async (req, res) => {
  try {
    const { classe, semaine, seances } = req.body;

    if (!classe || !semaine || !seances || !Array.isArray(seances)) {
      return res.status(400).json({ error: 'Données manquantes' });
    }

    // Ajouter la classe à chaque séance
    const seancesFinales = seances.map(seance => ({
      ...seance,
      classe,
    }));

    let emploi = await EmploiDuTemps.findOne({ classe });

    if (emploi) {
      emploi.semaine = semaine;
      emploi.seances = seancesFinales;
      emploi.updatedAt = new Date();
      await emploi.save();
    } else {
      emploi = await EmploiDuTemps.create({
        classe,
        semaine,
        seances: seancesFinales
      });
    }

    res.status(201).json({ success: true, message: 'Emploi du temps sauvegardé', emploi });
  } catch (error) {
    console.error('Erreur emploi du temps POST:', error);
    res.status(500).json({ error: error.message || 'Erreur lors de la sauvegarde' });
  }
});

// DELETE supprimer emploi du temps
router.delete('/', async (req, res) => {
  try {
    const { classe } = req.query;
    if (!classe) {
      return res.status(400).json({ error: 'Classe requise' });
    }
    await EmploiDuTemps.findOneAndDelete({ classe });
    res.json({ message: 'Emploi du temps supprimé' });
  } catch (error) {
    console.error('Erreur suppression:', error);
    res.status(500).json({ error: 'Erreur lors de la suppression' });
  }
});

module.exports = router;
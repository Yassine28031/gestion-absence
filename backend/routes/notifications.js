const express = require('express');
const Seance = require('../models/Seance');

const router = express.Router();

// GET notifications d'un étudiant
router.get('/', async (req, res) => {
  try {
    const { nom, prenom } = req.query;

    const seances = await Seance.find()
      .populate('matiere', 'nom')
      .sort({ date: -1 });

    const notifications = [];

    for (const seance of seances) {
      const absence = seance.absences?.find(
        (a) => a.etudiantNom === nom && a.etudiantPrenom === prenom && !a.present
      );
      if (absence) {
        notifications.push({
          id: seance._id,
          message: `Absence au cours de ${seance.matiere?.nom} du ${new Date(seance.date).toLocaleDateString('fr-FR')}`,
          date: seance.date,
          type: 'absence',
          lu: false,
          matiere: seance.matiere?.nom,
          seanceId: seance._id
        });
      }
    }

    res.json({ notifications });
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

module.exports = router;
const express = require('express');
const User = require('../models/User');
const Classe = require('../models/Classe');

const router = express.Router();

// GET tous les utilisateurs (avec filtre rôle)
router.get('/', async (req, res) => {
  try {
    const { role } = req.query;
    const filter = role ? { role } : {};
    const users = await User.find(filter).select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    console.error('Erreur GET users:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// GET un utilisateur par ID
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ error: 'Utilisateur non trouvé' });
    res.json(user);
  } catch (error) {
    console.error('Erreur GET user:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// PUT mettre à jour un utilisateur (y compris la photo)
router.put('/:id', async (req, res) => {
  try {
    const { nom, prenom, email, photo } = req.body;
    
    const oldUser = await User.findById(req.params.id);
    if (!oldUser) return res.status(404).json({ error: 'Utilisateur non trouvé' });
    
    // Mettre à jour l'utilisateur
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { nom, prenom, email, photo },
      { new: true, runValidators: true }
    ).select('-password');
    
    // Mettre à jour dans la classe si c'est un étudiant
    if (user.role === 'etudiant' && user.classeId) {
      const classe = await Classe.findById(user.classeId);
      if (classe) {
        // Chercher l'étudiant par email ou par nom/prénom
        let etudiantIndex = classe.etudiants.findIndex(e => e.email === oldUser.email);
        if (etudiantIndex === -1) {
          etudiantIndex = classe.etudiants.findIndex(e => e.nom === oldUser.nom && e.prenom === oldUser.prenom);
        }
        
        if (etudiantIndex !== -1) {
          classe.etudiants[etudiantIndex] = { 
            nom: nom, 
            prenom: prenom, 
            email: email 
          };
          await classe.save();
        }
      }
    }
    
    res.json({ success: true, user });
  } catch (error) {
    console.error('Erreur PUT user:', error);
    res.status(500).json({ error: 'Erreur lors de la mise à jour' });
  }
});

// DELETE supprimer un utilisateur
router.delete('/:id', async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'Utilisateur supprimé' });
  } catch (error) {
    console.error('Erreur DELETE user:', error);
    res.status(500).json({ error: 'Erreur lors de la suppression' });
  }
});

module.exports = router;
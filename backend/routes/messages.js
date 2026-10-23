const express = require('express');
const Message = require('../models/Message');
const Classe = require('../models/Classe');
const User = require('../models/User');

const router = express.Router();

// GET - Récupérer les messages d'une classe (pour les étudiants)
router.get('/classe/:classeId', async (req, res) => {
  try {
    const { classeId } = req.params;
    const messages = await Message.find({ classe: classeId })
      .populate('enseignant', 'nom prenom')
      .sort({ date: -1 });
    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la récupération' });
  }
});

// GET - Récupérer les messages envoyés par un enseignant
router.get('/enseignant/:enseignantId', async (req, res) => {
  try {
    const { enseignantId } = req.params;
    const messages = await Message.find({ enseignant: enseignantId })
      .populate('classe', 'nom niveau filiere')
      .sort({ date: -1 });
    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la récupération' });
  }
});

// POST - Envoyer un message à une classe
router.post('/', async (req, res) => {
  try {
    const { titre, contenu, enseignantId, enseignantNom, classeId, classeNom } = req.body;
    
    const message = await Message.create({
      titre,
      contenu,
      enseignant: enseignantId,
      enseignantNom,
      classe: classeId,
      classeNom,
      date: new Date(),
      lu: false
    });
    
    res.status(201).json({ success: true, message });
  } catch (error) {
    console.error('Erreur:', error);
    res.status(500).json({ error: 'Erreur lors de l\'envoi' });
  }
});

// PUT - Marquer un message comme lu
router.put('/:id/lire', async (req, res) => {
  try {
    const { id } = req.params;
    const { etudiantId } = req.body;
    
    const message = await Message.findById(id);
    if (!message) {
      return res.status(404).json({ error: 'Message non trouvé' });
    }
    
    if (!message.luPar.includes(etudiantId)) {
      message.luPar.push(etudiantId);
      await message.save();
    }
    
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la mise à jour' });
  }
});

// DELETE - Supprimer un message
router.delete('/:id', async (req, res) => {
  try {
    await Message.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la suppression' });
  }
});

module.exports = router;
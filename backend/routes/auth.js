const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const router = express.Router();

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email et mot de passe requis' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: 'Email ou mot de passe incorrect' });
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return res.status(401).json({ error: 'Email ou mot de passe incorrect' });
    }

    // Vérifier le rôle
    if (role && user.role !== role) {
      return res.status(403).json({ 
        error: `Ce compte est un compte ${user.role}. Veuillez vous connecter avec le bon rôle.` 
      });
    }

    const token = jwt.sign(
      { 
        userId: user._id,
        email: user.email,
        role: user.role,
        nom: user.nom,
        prenom: user.prenom,
        classeId: user.classeId
      },
      process.env.JWT_SECRET || 'fallback_secret',
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
        token,
      user: {
        id: user._id,
        _id: user._id,
        nom: user.nom,
        prenom: user.prenom,
        email: user.email,
        role: user.role,
        classeId: user.classeId ? user.classeId.toString() : null,
        photo: user.photo || ''
      }
    });
  } catch (error) {
    console.error('Erreur login:', error);
    res.status(500).json({ error: 'Erreur lors de la connexion' });
  }
});

// Register
router.post('/register', async (req, res) => {
  try {
    const { nom, prenom, email, password, role, classeId } = req.body;

    if (!nom || !prenom || !email || !password || !role) {
      return res.status(400).json({ error: 'Tous les champs sont requis' });
    }

    if (!['admin', 'enseignant', 'etudiant'].includes(role)) {
      return res.status(400).json({ error: 'Rôle invalide' });
    }

    if (role === 'etudiant' && !classeId) {
      return res.status(400).json({ error: 'La classe est requise pour un étudiant' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'Cet email est déjà utilisé' });
    }

    if (role === 'etudiant') {
      const Classe = require('../models/Classe');
      const classeExists = await Classe.findById(classeId);
      if (!classeExists) {
        return res.status(400).json({ error: 'La classe spécifiée n\'existe pas' });
      }
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const userData = {
      nom,
      prenom,
      email,
      password: hashedPassword,
      role,
    };

    if (role === 'etudiant') {
      userData.classeId = classeId;
    }

    const user = await User.create(userData);

    // Ajouter l'étudiant à la classe
    if (role === 'etudiant' && classeId) {
      try {
        const Classe = require('../models/Classe');
        const classe = await Classe.findById(classeId);
        const isAlreadyInClass = classe.etudiants?.some(
          (etudiant) => etudiant.email === email
        );

        if (!isAlreadyInClass) {
          await Classe.findByIdAndUpdate(classeId, {
            $push: {
              etudiants: { nom, prenom, email }
            }
          });
        }
      } catch (error) {
        await User.findByIdAndDelete(user._id);
        return res.status(500).json({ error: 'Erreur lors de l\'association à la classe' });
      }
    }

    res.status(201).json({
      success: true,
      user: {
        id: user._id,
        nom: user.nom,
        prenom: user.prenom,
        email: user.email,
        role: user.role,
      },
      message: role === 'etudiant' ? '✅ Étudiant créé et ajouté à la classe !' : '✅ Compte créé avec succès !'
    });
  } catch (error) {
    console.error('Erreur inscription:', error);
    res.status(500).json({ error: 'Erreur lors de l\'inscription' });
  }
});

module.exports = router;
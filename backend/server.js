const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Servir les fichiers statiques (photos uploadées)
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

// Connexion MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/gestion_absence')
  .then(() => console.log('✅ MongoDB connecté'))
  .catch(err => console.error('❌ Erreur MongoDB:', err));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/classes', require('./routes/classes'));
app.use('/api/matieres', require('./routes/matieres'));
app.use('/api/seances', require('./routes/seances'));
app.use('/api/emploi-du-temps', require('./routes/emploiDuTemps'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/upload', require('./routes/upload')); // Route pour l'upload des photos
app.use('/api/messages', require('./routes/messages'));



const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Serveur démarré sur http://localhost:${PORT}`);
});
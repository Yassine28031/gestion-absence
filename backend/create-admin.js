const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

mongoose.connect('mongodb://localhost:27017/gestion_absence');

const UserSchema = new mongoose.Schema({
  nom: String,
  prenom: String,
  email: String,
  password: String,
  role: String,
  createdAt: Date
});

const User = mongoose.model('User', UserSchema);

async function createAdmin() {
  try {
    // Vérifier si l'admin existe déjà
    const existing = await User.findOne({ email: 'admin@test.com' });
    if (existing) {
      console.log('⚠️ Admin existe déjà !');
      mongoose.disconnect();
      return;
    }
    
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    await User.create({
      nom: 'Admin',
      prenom: 'Super',
      email: 'admin@test.com',
      password: hashedPassword,
      role: 'admin',
      createdAt: new Date()
    });
    
    console.log('✅ Admin créé avec succès !');
    console.log('📧 Email: admin@test.com');
    console.log('🔑 Mot de passe: admin123');
    mongoose.disconnect();
  } catch (error) {
    console.error('❌ Erreur:', error);
  }
}

createAdmin();
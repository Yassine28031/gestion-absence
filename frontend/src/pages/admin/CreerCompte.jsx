import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';

export default function CreerComptePage() {
  const navigate = useNavigate();
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    email: '',
    password: '',
    role: 'etudiant',
    classeId: '',
  });

  // Charger la liste des classes
  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/classes');
      const data = await res.json();
      setClasses(data);
    } catch (error) {
      console.error('Erreur chargement classes:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const res = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage({ 
          type: 'success', 
          text: `✅ Compte ${formData.role} créé avec succès !` 
        });
        // Réinitialiser le formulaire
        setFormData({
          nom: '',
          prenom: '',
          email: '',
          password: '',
          role: 'etudiant',
          classeId: '',
        });
        // Recharger les classes si besoin
        fetchClasses();
      } else {
        setMessage({ type: 'error', text: data.error || 'Erreur lors de la création' });
      }
    } catch (error) {
      console.error('Erreur:', error);
      setMessage({ type: 'error', text: 'Erreur de connexion au serveur' });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-2xl mx-auto">
        {/* En-tête avec retour */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <Link to="/dashboard/admin" className="text-blue-600 hover:text-blue-800">
              ← Retour au dashboard
            </Link>
            <button
              onClick={handleLogout}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm"
            >
              Déconnexion
            </button>
          </div>
          <h1 className="text-2xl font-bold">Créer un nouveau compte</h1>
          <p className="text-gray-600">
            Remplissez le formulaire pour créer un compte étudiant ou enseignant
          </p>
        </div>

        {/* Message de succès/erreur */}
        {message.text && (
          <div className={`p-4 rounded mb-4 ${
            message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
          }`}>
            {message.text}
          </div>
        )}

        {/* Formulaire */}
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-lg p-6">
          {/* Nom et Prénom */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nom
              </label>
              <input
                type="text"
                required
                value={formData.nom}
                onChange={(e) => setFormData({...formData, nom: e.target.value})}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                placeholder="Ex: Dupont"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Prénom
              </label>
              <input
                type="text"
                required
                value={formData.prenom}
                onChange={(e) => setFormData({...formData, prenom: e.target.value})}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                placeholder="Ex: Jean"
              />
            </div>
          </div>

          {/* Email */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
              placeholder="exemple@email.com"
            />
          </div>

          {/* Mot de passe */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mot de passe
            </label>
            <input
              type="password"
              required
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
              placeholder="••••••••"
            />
          </div>

          {/* Rôle */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Rôle
            </label>
            <select
              value={formData.role}
              onChange={(e) => setFormData({...formData, role: e.target.value, classeId: ''})}
              className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
            >
              <option value="etudiant">Étudiant</option>
              <option value="enseignant">Enseignant</option>
            </select>
          </div>

          {/* Classe (visible seulement pour les étudiants) */}
          {formData.role === 'etudiant' && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Classe
              </label>
              <select
                value={formData.classeId}
                onChange={(e) => setFormData({...formData, classeId: e.target.value})}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Sélectionner une classe</option>
                {classes.map((classe) => (
                  <option key={classe._id} value={classe._id}>
                    {classe.nom} - {classe.filiere} ({classe.niveau})
                  </option>
                ))}
              </select>
              {classes.length === 0 && (
                <p className="text-sm text-yellow-600 mt-1">
                  ⚠️ Aucune classe disponible. Créez d'abord des classes.
                </p>
              )}
            </div>
          )}

          {/* Bouton de soumission */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
          >
            {loading ? 'Création en cours...' : 'Créer le compte'}
          </button>
        </form>

        {/* Aide */}
        <div className="mt-4 p-4 bg-blue-50 rounded-lg text-sm text-blue-800">
          <p className="font-bold mb-1">📌 Note :</p>
          <p>Les mots de passe sont automatiquement hashés pour la sécurité.</p>
          <p>Les étudiants doivent être associés à une classe existante.</p>
        </div>
      </div>
    </div>
  );
}
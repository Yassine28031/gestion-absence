import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

export default function AdminProfilPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    email: '',
  });
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      navigate('/login');
      return;
    }
    const connectedUser = JSON.parse(userData);
    if (connectedUser.role !== 'admin') {
      navigate(`/dashboard/${connectedUser.role}`);
      return;
    }
    setUser(connectedUser);
    setFormData({
      nom: connectedUser.nom || '',
      prenom: connectedUser.prenom || '',
      email: connectedUser.email || '',
    });
    setLoading(false);
  }, [navigate]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: '', text: '' });
    
    try {
      const userId = user._id || user.id;
      const res = await fetch(`http://localhost:5000/api/users/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      
      const data = await res.json();
      
      if (res.ok) {
        const updatedUser = { ...user, ...formData };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        setUser(updatedUser);
        setEditing(false);
        setMessage({ type: 'success', text: '✅ Profil mis à jour avec succès !' });
        setTimeout(() => setMessage({ type: '', text: '' }), 3000);
      } else {
        setMessage({ type: 'error', text: data.error || 'Erreur lors de la mise à jour' });
      }
    } catch (error) {
      console.error('Erreur:', error);
      setMessage({ type: 'error', text: 'Erreur de connexion au serveur' });
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-blue-800 text-white p-4 shadow-md">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold">👤 Mon Profil</h1>
          <div className="flex items-center space-x-4">
            <span className="text-sm">{user?.prenom} {user?.nom}</span>
            <Link to="/dashboard/admin" className="text-white hover:text-blue-200">← Retour</Link>
            <button onClick={handleLogout} className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg text-sm">
              Déconnexion
            </button>
          </div>
        </div>
      </nav>

      <div className="container mx-auto p-6 max-w-2xl">
        {message.text && (
          <div className={`mb-4 p-4 rounded ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            {message.text}
          </div>
        )}

        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-blue-700 to-blue-800 p-6 text-white">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold">Mon profil</h2>
                <p className="text-blue-200 mt-1">Gérez vos informations personnelles</p>
              </div>
              {!editing && (
                <button
                  onClick={() => setEditing(true)}
                  className="bg-white text-blue-700 px-4 py-2 rounded-lg font-medium hover:bg-blue-50 transition"
                >
                  ✏️ Modifier
                </button>
              )}
            </div>
          </div>

          <div className="p-6">
            {!editing ? (
              <div className="space-y-4">
                <div className="border-b pb-3">
                  <label className="text-sm text-gray-500 font-medium">Nom complet</label>
                  <p className="text-lg font-semibold text-gray-800 mt-1">
                    {user?.prenom} {user?.nom}
                  </p>
                </div>
                
                <div className="border-b pb-3">
                  <label className="text-sm text-gray-500 font-medium">Email</label>
                  <p className="text-lg text-gray-800 mt-1">{user?.email}</p>
                </div>
                
                <div className="border-b pb-3">
                  <label className="text-sm text-gray-500 font-medium">Rôle</label>
                  <p className="text-lg text-gray-800 mt-1 capitalize">
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">
                      Administrateur
                    </span>
                  </p>
                </div>
                
                <div>
                  <label className="text-sm text-gray-500 font-medium">ID Administrateur</label>
                  <p className="text-sm text-gray-600 mt-1 font-mono">{user?.id || user?._id}</p>
                </div>
              </div>
            ) : (
              <form onSubmit={handleUpdate} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nom</label>
                  <input
                    type="text"
                    required
                    value={formData.nom}
                    onChange={(e) => setFormData({...formData, nom: e.target.value})}
                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Prénom</label>
                  <input
                    type="text"
                    required
                    value={formData.prenom}
                    onChange={(e) => setFormData({...formData, prenom: e.target.value})}
                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    disabled={saving}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
                  >
                    {saving ? 'Enregistrement...' : '💾 Enregistrer'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEditing(false);
                      setFormData({
                        nom: user.nom,
                        prenom: user.prenom,
                        email: user.email,
                      });
                      setMessage({ type: '', text: '' });
                    }}
                    className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition"
                  >
                    ❌ Annuler
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

        <div className="mt-6 bg-amber-50 rounded-lg p-4 border border-amber-200">
          <p className="text-sm text-amber-800">
            📌 <span className="font-semibold">Information :</span> Pour modifier votre mot de passe, veuillez contacter le support technique.
          </p>
        </div>
      </div>
    </div>
  );
}
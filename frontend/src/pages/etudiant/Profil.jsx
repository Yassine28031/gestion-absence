import { useEffect, useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';

export default function EtudiantProfil() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    email: '',
    photo: '',
  });
  const [message, setMessage] = useState({ type: '', text: '' });
  const fileInputRef = useRef(null);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      navigate('/login');
      return;
    }
    const connectedUser = JSON.parse(userData);
    if (connectedUser.role !== 'etudiant') {
      navigate(`/dashboard/${connectedUser.role}`);
      return;
    }
    setUser(connectedUser);
    setFormData({
      nom: connectedUser.nom || '',
      prenom: connectedUser.prenom || '',
      email: connectedUser.email || '',
      photo: connectedUser.photo || '',
    });
    setLoading(false);
  }, [navigate]);

  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (!file.type.startsWith('image/')) {
      setMessage({ type: 'error', text: 'Veuillez sélectionner une image' });
      return;
    }
    
    if (file.size > 2 * 1024 * 1024) {
      setMessage({ type: 'error', text: 'L\'image ne doit pas dépasser 2MB' });
      return;
    }
    
    setUploading(true);
    
    try {
      const formDataUpload = new FormData();
      formDataUpload.append('photo', file);
      
      const res = await fetch('http://localhost:5000/api/upload/photo', {
        method: 'POST',
        body: formDataUpload,
      });
      
      const data = await res.json();
      
      if (data.success) {
        setFormData({ ...formData, photo: data.photoUrl });
        setMessage({ type: 'success', text: 'Photo téléchargée avec succès !' });
        setTimeout(() => setMessage({ type: '', text: '' }), 3000);
      } else {
        setMessage({ type: 'error', text: data.error || 'Erreur lors de l\'upload' });
      }
    } catch (error) {
      console.error('Erreur upload:', error);
      setMessage({ type: 'error', text: 'Erreur lors de l\'upload' });
    } finally {
      setUploading(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);
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
        setMessage({ type: 'success', text: '✅ Profil mis à jour !' });
        setTimeout(() => setMessage({ type: '', text: '' }), 3000);
      } else {
        setMessage({ type: 'error', text: data.error || 'Erreur lors de la mise à jour' });
      }
    } catch (error) {
      console.error('Erreur mise à jour:', error);
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
      <nav className="bg-green-600 text-white p-4 shadow-md">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold">👤 Mon Profil</h1>
          <div className="flex items-center space-x-4">
            <Link to="/dashboard/etudiant" className="text-white hover:text-green-200">← Retour</Link>
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
          <div className="bg-gradient-to-r from-green-500 to-green-600 p-6 text-white">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold">Mon profil</h2>
                <p className="text-green-100 mt-1">Gérez vos informations</p>
              </div>
              {!editing && (
                <button onClick={() => setEditing(true)} className="bg-white text-green-600 px-4 py-2 rounded-lg font-medium hover:bg-green-50 transition">
                  ✏️ Modifier
                </button>
              )}
            </div>
          </div>

          <div className="p-6">
            {/* Photo de profil */}
            <div className="flex flex-col items-center mb-6">
              <div className="relative">
                {formData.photo ? (
                  <img
                    src={`http://localhost:5000${formData.photo}`}
                    alt="Photo"
                    className="w-32 h-32 rounded-full object-cover border-4 border-green-500"
                  />
                ) : (
                  <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center border-4 border-green-500">
                    <span className="text-4xl text-gray-400">👤</span>
                  </div>
                )}
                {editing && (
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="absolute bottom-0 right-0 bg-green-600 text-white p-2 rounded-full hover:bg-green-700 transition"
                  >
                    {uploading ? '⏳' : '📷'}
                  </button>
                )}
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handlePhotoUpload}
                  accept="image/*"
                  className="hidden"
                />
              </div>
              {editing && (
                <p className="text-xs text-gray-500 mt-2">Cliquez sur l'icône pour changer la photo (max 2MB)</p>
              )}
            </div>

            {!editing ? (
              <div className="space-y-4">
                <div className="border-b pb-3">
                  <label className="text-sm text-gray-500">Nom complet</label>
                  <p className="text-lg font-semibold mt-1">{user?.prenom} {user?.nom}</p>
                </div>
                <div className="border-b pb-3">
                  <label className="text-sm text-gray-500">Email</label>
                  <p className="text-lg mt-1">{user?.email}</p>
                </div>
                <div className="border-b pb-3">
                  <label className="text-sm text-gray-500">Rôle</label>
                  <p className="text-lg mt-1 capitalize">{user?.role}</p>
                </div>
              </div>
            ) : (
              <form onSubmit={handleUpdate} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Nom</label>
                  <input
                    type="text"
                    required
                    value={formData.nom}
                    onChange={(e) => setFormData({...formData, nom: e.target.value})}
                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Prénom</label>
                  <input
                    type="text"
                    required
                    value={formData.prenom}
                    onChange={(e) => setFormData({...formData, prenom: e.target.value})}
                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Email</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    disabled={saving}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition disabled:opacity-50"
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
                        photo: user.photo || '',
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

        <div className="mt-6 bg-blue-50 rounded-lg p-4">
          <p className="text-sm text-blue-800">
            📌 <span className="font-semibold">Information :</span> Pour modifier votre mot de passe, veuillez contacter l'administrateur.
          </p>
        </div>
      </div>
    </div>
  );
}
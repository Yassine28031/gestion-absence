import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';

export default function GestionMatieres() {
  const navigate = useNavigate();
  const [matieres, setMatieres] = useState([]);
  const [enseignants, setEnseignants] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    nom: '',
    enseignant: '',
    classe: '',
  });
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    try {
      const [matRes, userRes, classeRes] = await Promise.all([
        fetch('http://localhost:5000/api/matieres'),
        fetch('http://localhost:5000/api/users?role=enseignant'),
        fetch('http://localhost:5000/api/classes'),
      ]);
      const [mats, users, cls] = await Promise.all([
        matRes.json(),
        userRes.json(),
        classeRes.json(),
      ]);
      setMatieres(mats);
      setEnseignants(users);
      setClasses(cls);
    } catch (error) {
      setMessage({ type: 'error', text: 'Erreur lors du chargement' });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:5000/api/matieres', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        setMessage({ type: 'success', text: '✅ Matière créée !' });
        setShowForm(false);
        setFormData({ nom: '', enseignant: '', classe: '' });
        fetchAll();
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Erreur lors de la création' });
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Supprimer cette matière ?')) return;
    try {
      const res = await fetch(`http://localhost:5000/api/matieres/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setMessage({ type: 'success', text: '✅ Matière supprimée !' });
        fetchAll();
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Erreur lors de la suppression' });
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
          <h1 className="text-xl font-bold">Gestion des Matières</h1>
          <div className="flex items-center space-x-4">
            <Link to="/dashboard/admin" className="text-white hover:text-blue-200">← Retour</Link>
            <button onClick={handleLogout} className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg text-sm">
              Déconnexion
            </button>
          </div>
        </div>
      </nav>

      <div className="container mx-auto p-6">
        {message.text && (
          <div className={`mb-4 p-4 rounded ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            {message.text}
          </div>
        )}

        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 text-white px-4 py-2 rounded mb-4 hover:bg-blue-700"
        >
          {showForm ? 'Annuler' : '+ Ajouter une matière'}
        </button>

        {showForm && (
          <form onSubmit={handleSubmit} className="mb-6 p-6 border rounded bg-white shadow">
            <h2 className="text-lg font-bold mb-4 text-blue-800">Nouvelle matière</h2>
            <div className="grid grid-cols-1 gap-4">
              <input
                type="text"
                value={formData.nom}
                onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                className="p-2 border rounded"
                placeholder="Nom de la matière (ex: Mathématiques)"
                required
              />
              <select
                value={formData.enseignant}
                onChange={(e) => setFormData({ ...formData, enseignant: e.target.value })}
                className="p-2 border rounded"
                required
              >
                <option value="">-- Choisir un enseignant --</option>
                {enseignants.map((ens) => (
                  <option key={ens._id} value={ens._id}>
                    {ens.nom} {ens.prenom} ({ens.email})
                  </option>
                ))}
              </select>
              <select
                value={formData.classe}
                onChange={(e) => setFormData({ ...formData, classe: e.target.value })}
                className="p-2 border rounded"
                required
              >
                <option value="">-- Choisir une classe --</option>
                {classes.map((cls) => (
                  <option key={cls._id} value={cls._id}>
                    {cls.nom} - {cls.niveau} {cls.filiere}
                  </option>
                ))}
              </select>
            </div>
            <button type="submit" className="mt-4 bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700">
              ✅ Créer la matière
            </button>
          </form>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {matieres.length === 0 ? (
            <p className="text-gray-500 col-span-3">Aucune matière créée pour l'instant.</p>
          ) : (
            matieres.map((mat) => (
              <div key={mat._id} className="bg-white p-4 rounded shadow border">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-blue-800 text-lg">{mat.nom}</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      👨‍🏫 {mat.enseignant?.nom} {mat.enseignant?.prenom}
                    </p>
                    <p className="text-sm text-gray-600">
                      🎓 {mat.classe?.nom} — {mat.classe?.niveau}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDelete(mat._id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
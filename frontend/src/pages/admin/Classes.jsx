import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';

export default function GestionClasses() {
  const navigate = useNavigate();
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [selectedClasse, setSelectedClasse] = useState(null);
  const [formData, setFormData] = useState({
    nom: '',
    niveau: 'L1',
    filiere: '',
    anneeScolaire: '2025-2026',
  });
  const [etudiants, setEtudiants] = useState(Array.from({ length: 20 }, () => ({ nom: '', prenom: '', email: '' })));
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchClasses();
    const interval = setInterval(fetchClasses, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchClasses = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/classes');
      const data = await res.json();
      setClasses(data);
    } catch (error) {
      setMessage({ type: 'error', text: 'Erreur lors du chargement' });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    setMessage({ type: 'info', text: '🔄 Actualisation...' });
    await fetchClasses();
    setMessage({ type: 'success', text: '✅ Données actualisées !' });
    setTimeout(() => setMessage({ type: '', text: '' }), 2000);
  };

  const handleDeleteStudent = async (classeId, studentIndex, studentName) => {
    if (!confirm(`Supprimer l'étudiant "${studentName}" ?`)) return;
    try {
      const res = await fetch(`http://localhost:5000/api/classes/${classeId}/remove-student`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentIndex }),
      });
      if (res.ok) {
        setMessage({ type: 'success', text: `✅ Étudiant supprimé !` });
        fetchClasses();
        if (selectedClasse && selectedClasse._id === classeId) {
          const updated = await fetch(`http://localhost:5000/api/classes/${classeId}`).then(r => r.json());
          setSelectedClasse(updated);
        }
        setTimeout(() => setMessage({ type: '', text: '' }), 3000);
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Erreur lors de la suppression' });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const etudiantsFiltres = etudiants.filter(et => et.nom.trim() !== '' || et.prenom.trim() !== '');
    try {
      const res = await fetch('http://localhost:5000/api/classes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, etudiants: etudiantsFiltres }),
      });
      if (res.ok) {
        setMessage({ type: 'success', text: '✅ Classe créée !' });
        setShowForm(false);
        setFormData({ nom: '', niveau: 'L1', filiere: '', anneeScolaire: '2025-2026' });
        setEtudiants(Array.from({ length: 20 }, () => ({ nom: '', prenom: '', email: '' })));
        fetchClasses();
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Erreur lors de la création' });
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Supprimer cette classe ?')) return;
    try {
      const res = await fetch(`http://localhost:5000/api/classes/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setMessage({ type: 'success', text: '✅ Classe supprimée !' });
        if (selectedClasse?._id === id) setSelectedClasse(null);
        fetchClasses();
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

  if (loading && classes.length === 0) {
    return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-blue-800 text-white p-4 shadow-md">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold">Gestion des Classes</h1>
          <div className="flex items-center space-x-4">
            <button onClick={handleRefresh} disabled={refreshing} className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg text-sm disabled:opacity-50">
              {refreshing ? '↻ Actualisation...' : '↻ Rafraîchir'}
            </button>
            <Link to="/dashboard/admin" className="text-white hover:text-blue-200">← Retour</Link>
            <button onClick={handleLogout} className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg text-sm">Déconnexion</button>
          </div>
        </div>
      </nav>

      <div className="container mx-auto p-6">
        {message.text && (
          <div className={`mb-4 p-4 rounded ${message.type === 'success' ? 'bg-green-100 text-green-700' : message.type === 'info' ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-700'}`}>
            {message.text}
          </div>
        )}

        <button onClick={() => { setShowForm(!showForm); setSelectedClasse(null); }} className="bg-blue-600 text-white px-4 py-2 rounded mb-4">
          {showForm ? 'Annuler' : '+ Ajouter une classe'}
        </button>

        {showForm && (
          <form onSubmit={handleSubmit} className="mb-6 p-6 border rounded bg-white shadow">
            <h2 className="text-lg font-bold mb-4">Informations de la classe</h2>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <input type="text" value={formData.nom} onChange={(e) => setFormData({...formData, nom: e.target.value})} className="p-2 border rounded" placeholder="Nom" required />
              <select value={formData.niveau} onChange={(e) => setFormData({...formData, niveau: e.target.value})} className="p-2 border rounded">
                <option value="L1">L1</option>
                <option value="L2">L2</option>
                <option value="L3">L3</option>
              </select>
              <input type="text" value={formData.filiere} onChange={(e) => setFormData({...formData, filiere: e.target.value})} className="p-2 border rounded" placeholder="Filière" required />
              <input type="text" value={formData.anneeScolaire} onChange={(e) => setFormData({...formData, anneeScolaire: e.target.value})} className="p-2 border rounded" placeholder="Année scolaire" />
            </div>
            <h2 className="text-lg font-bold mb-3">Liste des étudiants</h2>
            <div className="overflow-auto max-h-96 border rounded">
              <table className="w-full text-sm">
                <thead className="bg-blue-50 sticky top-0">
                  <tr><th>#</th><th>Nom</th><th>Prénom</th><th>Email</th></tr>
                </thead>
                <tbody>
                  {etudiants.map((et, index) => (
                    <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="p-2">{index+1}</td>
                      <td className="p-2"><input type="text" value={et.nom} onChange={(e) => {
                        const updated = [...etudiants];
                        updated[index].nom = e.target.value;
                        setEtudiants(updated);
                      }} className="w-full p-1 border rounded text-sm" placeholder="Nom" /></td>
                      <td className="p-2"><input type="text" value={et.prenom} onChange={(e) => {
                        const updated = [...etudiants];
                        updated[index].prenom = e.target.value;
                        setEtudiants(updated);
                      }} className="w-full p-1 border rounded text-sm" placeholder="Prénom" /></td>
                      <td className="p-2"><input type="email" value={et.email} onChange={(e) => {
                        const updated = [...etudiants];
                        updated[index].email = e.target.value;
                        setEtudiants(updated);
                      }} className="w-full p-1 border rounded text-sm" placeholder="Email" /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <button type="submit" className="mt-4 bg-green-600 text-white px-6 py-2 rounded">✅ Créer la classe</button>
          </form>
        )}

        <div className="grid grid-cols-3 gap-4">
          {classes.map((classe) => (
            <div key={classe._id} onClick={() => setSelectedClasse(selectedClasse?._id === classe._id ? null : classe)} className={`p-4 border rounded shadow bg-white cursor-pointer ${selectedClasse?._id === classe._id ? 'border-blue-500 ring-2 ring-blue-300' : ''}`}>
              <div className="flex justify-between">
                <div>
                  <h3 className="font-bold text-blue-800">{classe.nom}</h3>
                  <p className="text-sm">{classe.niveau} - {classe.filiere}</p>
                  <p className="text-xs text-blue-600">👨‍🎓 {classe.etudiants?.length || 0} étudiant(s)</p>
                </div>
                <button onClick={(e) => { e.stopPropagation(); handleDelete(classe._id); }} className="text-red-600">🗑️</button>
              </div>
            </div>
          ))}
        </div>

        {selectedClasse && (
          <div className="mt-6 bg-white rounded shadow p-6">
            <div className="flex justify-between mb-4">
              <h2 className="text-xl font-bold text-blue-800">📋 Étudiants — {selectedClasse.nom}</h2>
              <button onClick={() => setSelectedClasse(null)} className="text-gray-400">✕</button>
            </div>
            {!selectedClasse.etudiants?.length ? (
              <p className="text-gray-500">Aucun étudiant</p>
            ) : (
              <table className="w-full text-sm border rounded">
                <thead className="bg-blue-50">
                  <tr><th>#</th><th>Nom</th><th>Prénom</th><th>Email</th><th>Action</th></tr>
                </thead>
                <tbody>
                  {selectedClasse.etudiants.map((et, index) => (
                    <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="p-3">{index+1}</td>
                      <td className="p-3 font-medium">{et.nom}</td>
                      <td className="p-3">{et.prenom}</td>
                      <td className="p-3">{et.email || '—'}</td>
                      <td className="p-3 text-center">
                        <button onClick={() => handleDeleteStudent(selectedClasse._id, index, `${et.prenom} ${et.nom}`)} className="bg-red-500 text-white px-2 py-1 rounded text-xs">🗑️</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
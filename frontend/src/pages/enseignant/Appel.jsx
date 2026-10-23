import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';

export default function AppelPage() {
  const navigate = useNavigate();
  const [matieres, setMatieres] = useState([]);
  const [selectedMatiere, setSelectedMatiere] = useState(null);
  const [etudiants, setEtudiants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [user, setUser] = useState(null);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      navigate('/login');
      return;
    }
    const u = JSON.parse(userData);
    if (u.role !== 'enseignant') {
      navigate(`/dashboard/${u.role}`);
      return;
    }
    setUser(u);
    fetchMatieres(u._id || u.id);
  }, []);

  const fetchMatieres = async (enseignantId) => {
    try {
      const res = await fetch(`http://localhost:5000/api/matieres?enseignant=${enseignantId}`);
      const data = await res.json();
      setMatieres(Array.isArray(data) ? data : []);
    } catch (error) {
      setMessage({ type: 'error', text: 'Erreur lors du chargement des matières' });
    } finally {
      setLoading(false);
    }
  };

  const handleSelectMatiere = async (matiere) => {
    setSelectedMatiere(matiere);
    const res = await fetch(`http://localhost:5000/api/classes/${matiere.classe._id}`);
    const data = await res.json();
    const liste = (data.etudiants || []).map((et) => ({
      nom: et.nom,
      prenom: et.prenom,
      present: true,
    }));
    setEtudiants(liste);
    setMessage({ type: '', text: '' });
  };

  const togglePresence = (index) => {
    const updated = [...etudiants];
    updated[index].present = !updated[index].present;
    setEtudiants(updated);
  };

  const handleSauvegarder = async () => {
    if (!selectedMatiere || !user) return;
    setSaving(true);
    try {
      const absencesData = etudiants.map(et => ({
        etudiantNom: et.nom,
        etudiantPrenom: et.prenom,
        present: et.present
      }));

      const res = await fetch('http://localhost:5000/api/seances', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          matiere: selectedMatiere._id,
          classe: selectedMatiere.classe._id,
          enseignant: user._id || user.id,
          date: new Date(),
          absences: absencesData,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage({ type: 'success', text: '✅ Appel sauvegardé avec succès !' });
        setTimeout(() => {
          setSelectedMatiere(null);
          setEtudiants([]);
        }, 2000);
      } else {
        setMessage({ type: 'error', text: data.error || 'Erreur lors de la sauvegarde' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Erreur lors de la sauvegarde' });
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const absentsCount = etudiants.filter(e => !e.present).length;
  const presentsCount = etudiants.filter(e => e.present).length;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-green-800 text-white p-4 shadow-md">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold">📋 Faire l'appel</h1>
          <div className="flex items-center space-x-4">
            <Link to="/dashboard/enseignant" className="text-white hover:text-green-200">← Retour</Link>
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

        {!selectedMatiere ? (
          <>
            <h2 className="text-xl font-bold text-gray-700 mb-4">Choisissez une matière pour faire l'appel :</h2>
            {matieres.length === 0 ? (
              <p className="text-gray-500">Aucune matière affectée pour l'instant.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {matieres.map((mat) => (
                  <div
                    key={mat._id}
                    onClick={() => handleSelectMatiere(mat)}
                    className="bg-white p-5 rounded shadow border cursor-pointer hover:shadow-lg hover:border-green-400 transition"
                  >
                    <h3 className="font-bold text-green-800 text-lg">{mat.nom}</h3>
                    <p className="text-sm text-gray-600 mt-1">🎓 {mat.classe?.nom} — {mat.classe?.niveau}</p>
                    <p className="text-xs text-green-600 mt-2">Cliquez pour faire l'appel →</p>
                  </div>
                ))}
              </div>
            )}
          </>
        ) : (
          <>
            <div className="flex justify-between items-center mb-4">
              <div>
                <h2 className="text-xl font-bold text-gray-700">
                  Appel — {selectedMatiere.nom} | {selectedMatiere.classe?.nom}
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  ✅ Présents : <span className="text-green-600 font-bold">{presentsCount}</span> &nbsp;|&nbsp;
                  ❌ Absents : <span className="text-red-600 font-bold">{absentsCount}</span>
                </p>
              </div>
              <button
                onClick={() => { setSelectedMatiere(null); setEtudiants([]); }}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕ Annuler
              </button>
            </div>

            <div className="bg-white rounded shadow overflow-hidden mb-4">
              <table className="w-full text-sm">
                <thead className="bg-green-50">
                  <tr>
                    <th className="p-3 text-left">#</th>
                    <th className="p-3 text-left">Nom</th>
                    <th className="p-3 text-left">Prénom</th>
                    <th className="p-3 text-center">Présence</th>
                  </tr>
                </thead>
                <tbody>
                  {etudiants.map((et, index) => (
                    <tr
                      key={index}
                      className={`border-t cursor-pointer transition ${et.present ? 'bg-white hover:bg-green-50' : 'bg-red-50 hover:bg-red-100'}`}
                      onClick={() => togglePresence(index)}
                    >
                      <td className="p-3 text-gray-400">{index + 1}</td>
                      <td className="p-3 font-medium">{et.nom}</td>
                      <td className="p-3">{et.prenom}</td>
                      <td className="p-3 text-center">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${et.present ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                          {et.present ? '✅ Présent' : '❌ Absent'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <button
              onClick={handleSauvegarder}
              disabled={saving}
              className="bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 font-bold disabled:opacity-50"
            >
              {saving ? 'Sauvegarde...' : '💾 Sauvegarder l\'appel'}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
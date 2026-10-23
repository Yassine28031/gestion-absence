import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

export default function EnseignantHistorique() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [seances, setSeances] = useState([]);
  const [filteredSeances, setFilteredSeances] = useState([]);
  const [classes, setClasses] = useState([]);
  const [matieres, setMatieres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedClasse, setSelectedClasse] = useState('');
  const [selectedMatiere, setSelectedMatiere] = useState('');
  const [dateDebut, setDateDebut] = useState('');
  const [dateFin, setDateFin] = useState('');
  const [selectedSeance, setSelectedSeance] = useState(null);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      navigate('/login');
      return;
    }
    const connectedUser = JSON.parse(userData);
    if (connectedUser.role !== 'enseignant') {
      navigate(`/dashboard/${connectedUser.role}`);
      return;
    }
    setUser(connectedUser);
    fetchData(connectedUser);
  }, []);

  const fetchData = async (user) => {
    try {
      const seancesRes = await fetch(`http://localhost:5000/api/seances?enseignant=${user._id || user.id}`);
      const seancesData = await seancesRes.json();
      setSeances(seancesData);
      setFilteredSeances(seancesData);

      const classesRes = await fetch('http://localhost:5000/api/classes');
      const classesData = await classesRes.json();
      setClasses(classesData);

      const matieresRes = await fetch(`http://localhost:5000/api/matieres?enseignant=${user._id || user.id}`);
      const matieresData = await matieresRes.json();
      setMatieres(matieresData);
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...seances];
    if (selectedClasse) filtered = filtered.filter(s => s.classe._id === selectedClasse);
    if (selectedMatiere) filtered = filtered.filter(s => s.matiere._id === selectedMatiere);
    if (dateDebut) filtered = filtered.filter(s => new Date(s.date) >= new Date(dateDebut));
    if (dateFin) filtered = filtered.filter(s => new Date(s.date) <= new Date(dateFin));
    setFilteredSeances(filtered);
  };

  const resetFilters = () => {
    setSelectedClasse('');
    setSelectedMatiere('');
    setDateDebut('');
    setDateFin('');
    setFilteredSeances(seances);
  };

  const getNbAbsents = (seance) => seance.absences?.filter(a => !a.present).length || 0;
  const getNbPresent = (seance) => seance.absences?.filter(a => a.present).length || 0;

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
      <nav className="bg-blue-600 text-white p-4 shadow-md">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold">📚 Historique des appels</h1>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              {user?.photo ? (
                <img src={user.photo} alt="Photo" className="w-8 h-8 rounded-full object-cover border-2 border-white" />
              ) : (
                <div className="w-8 h-8 rounded-full bg-white text-blue-600 flex items-center justify-center">
                  <span className="text-sm font-bold">{user?.prenom?.charAt(0)}{user?.nom?.charAt(0)}</span>
                </div>
              )}
              <span className="text-sm">{user?.prenom} {user?.nom}</span>
            </div>
            <Link to="/dashboard/enseignant" className="text-white hover:text-blue-200">← Retour</Link>
            <button onClick={handleLogout} className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg text-sm">
              Déconnexion
            </button>
          </div>
        </div>
      </nav>

      <div className="container mx-auto p-6">
        {/* Filtres */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-lg font-bold text-gray-800 mb-4">🔍 Filtrer les appels</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Classe</label>
              <select value={selectedClasse} onChange={(e) => setSelectedClasse(e.target.value)} className="w-full p-2 border rounded">
                <option value="">Toutes les classes</option>
                {classes.map((classe) => (
                  <option key={classe._id} value={classe._id}>{classe.nom} - {classe.filiere}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Matière</label>
              <select value={selectedMatiere} onChange={(e) => setSelectedMatiere(e.target.value)} className="w-full p-2 border rounded">
                <option value="">Toutes les matières</option>
                {matieres.map((matiere) => (
                  <option key={matiere._id} value={matiere._id}>{matiere.nom}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date début</label>
              <input type="date" value={dateDebut} onChange={(e) => setDateDebut(e.target.value)} className="w-full p-2 border rounded" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date fin</label>
              <input type="date" value={dateFin} onChange={(e) => setDateFin(e.target.value)} className="w-full p-2 border rounded" />
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            <button onClick={applyFilters} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">🔍 Appliquer</button>
            <button onClick={resetFilters} className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600">🗑️ Réinitialiser</button>
          </div>
        </div>

        {/* Liste des séances */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="bg-gray-50 px-6 py-4 border-b">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-bold">📋 Séances ({filteredSeances.length})</h2>
            </div>
          </div>

          {filteredSeances.length === 0 ? (
            <div className="p-8 text-center text-gray-500">📭 Aucune séance trouvée</div>
          ) : (
            <div className="divide-y">
              {filteredSeances.map((seance) => (
                <div key={seance._id} className="p-4 hover:bg-gray-50">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex gap-2 mb-2">
                        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">📅 {new Date(seance.date).toLocaleDateString('fr-FR')}</span>
                        <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm">🕐 {new Date(seance.date).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      <h3 className="text-lg font-bold">{seance.matiere?.nom}</h3>
                      <p className="text-gray-600 text-sm">🎓 Classe : {seance.classe?.nom}</p>
                      <div className="flex gap-3 mt-2">
                        <span className="text-sm text-green-600">✅ Présents: {getNbPresent(seance)}</span>
                        <span className="text-sm text-red-600">❌ Absents: {getNbAbsents(seance)}</span>
                      </div>
                    </div>
                    <button onClick={() => setSelectedSeance(selectedSeance?._id === seance._id ? null : seance)} className="text-blue-600 text-sm">
                      {selectedSeance?._id === seance._id ? '▲ Masquer' : '▼ Voir détails'}
                    </button>
                  </div>

                  {selectedSeance?._id === seance._id && (
                    <div className="mt-4 border-t pt-4">
                      <h4 className="font-semibold mb-2">Étudiants absents :</h4>
                      {seance.absences?.filter(a => !a.present).length === 0 ? (
                        <p className="text-gray-500 text-sm">Aucun absent</p>
                      ) : (
                        <div className="flex flex-wrap gap-2">
                          {seance.absences?.filter(a => !a.present).map((absence, idx) => (
                            <span key={idx} className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm">
                              {absence.etudiantPrenom} {absence.etudiantNom}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Statistiques */}
        <div className="mt-6 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg shadow-lg p-6 text-white">
          <h3 className="text-lg font-bold mb-3">📊 Statistiques</h3>
          <div className="grid grid-cols-4 gap-4">
            <div><p className="text-2xl font-bold">{seances.length}</p><p className="text-sm">Total séances</p></div>
            <div><p className="text-2xl font-bold">{filteredSeances.length}</p><p className="text-sm">Séances filtrées</p></div>
            <div><p className="text-2xl font-bold">{filteredSeances.reduce((sum, s) => sum + getNbAbsents(s), 0)}</p><p className="text-sm">Total absents</p></div>
            <div><p className="text-2xl font-bold">{filteredSeances.length > 0 ? Math.round(filteredSeances.reduce((sum, s) => sum + getNbAbsents(s), 0) / filteredSeances.length) : 0}</p><p className="text-sm">Moyenne/séance</p></div>
          </div>
        </div>
      </div>
    </div>
  );
}
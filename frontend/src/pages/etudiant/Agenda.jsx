import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const JOURS = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];

export default function EtudiantAgenda() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [seances, setSeances] = useState([]);
  const [selectedJour, setSelectedJour] = useState(JOURS[0]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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
    fetchAgenda(connectedUser);
  }, []);

  const fetchAgenda = async (user) => {
    try {
      if (!user.classeId) {
        setError('Vous n\'êtes pas associé à une classe');
        setLoading(false);
        return;
      }
      
      const res = await fetch(`http://localhost:5000/api/emploi-du-temps?classe=${user.classeId}`);
      const data = await res.json();
      setSeances(data.seances || []);
    } catch (error) {
      setError('Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  };

  const getSeancesByJour = (jour) => {
    return seances.filter(s => s.jour === jour).sort((a, b) => a.heureDebut.localeCompare(b.heureDebut));
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
          <h1 className="text-xl font-bold">📅 Mon Agenda</h1>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              {user?.photo ? <img src={user.photo} alt="Photo" className="w-8 h-8 rounded-full object-cover border-2 border-white" /> : <div className="w-8 h-8 rounded-full bg-white text-green-600 flex items-center justify-center"><span className="text-sm font-bold">{user?.prenom?.charAt(0)}{user?.nom?.charAt(0)}</span></div>}
              <span className="text-sm">{user?.prenom} {user?.nom}</span>
            </div>
            <Link to="/dashboard/etudiant" className="text-white hover:text-green-200">← Retour</Link>
            <button onClick={handleLogout} className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg text-sm">Déconnexion</button>
          </div>
        </div>
      </nav>

      <div className="container mx-auto p-6">
        {error && <div className="bg-red-100 text-red-700 p-4 rounded mb-6">{error}</div>}

        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold mb-4">📚 Mon emploi du temps</h2>
          <p className="text-gray-500 mb-6">Classe : {seances[0]?.classe?.nom || 'Non définie'}</p>

          <div className="flex flex-wrap gap-2 mb-6">
            {JOURS.map((jour) => {
              const count = getSeancesByJour(jour).length;
              return (
                <button key={jour} onClick={() => setSelectedJour(jour)} className={`px-4 py-2 rounded-lg font-medium transition ${selectedJour === jour ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
                  {jour}{count > 0 && <span className={`ml-2 text-xs px-2 py-0.5 rounded-full ${selectedJour === jour ? 'bg-green-400' : 'bg-gray-300'}`}>{count}</span>}
                </button>
              );
            })}
          </div>

          <div className="bg-gray-50 rounded-lg overflow-hidden">
            <div className="bg-gradient-to-r from-green-500 to-green-600 p-4 text-white">
              <h3 className="text-lg font-bold">{selectedJour}</h3>
              <p className="text-sm">{getSeancesByJour(selectedJour).length} cours programmé(s)</p>
            </div>
            
            {getSeancesByJour(selectedJour).length === 0 ? (
              <div className="p-8 text-center text-gray-500">📭 Aucun cours programmé ce jour</div>
            ) : (
              <div className="divide-y">
                {getSeancesByJour(selectedJour).map((seance, index) => (
                  <div key={index} className="p-4 hover:bg-gray-100">
                    <div className="flex flex-wrap gap-2 mb-2">
                      <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-semibold">🕐 {seance.heureDebut} - {seance.heureFin}</span>
                      <span className="bg-gray-200 text-gray-700 px-3 py-1 rounded-full text-sm">🏫 Salle {seance.salle}</span>
                    </div>
                    <h4 className="text-lg font-bold">{seance.matiere?.nom}</h4>
                    <p className="text-gray-600 text-sm mt-1">👨‍🏫 {seance.enseignant?.prenom} {seance.enseignant?.nom}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mt-6 bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-6 text-white">
            <h3 className="text-lg font-bold mb-3">📊 Résumé de la semaine</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div><p className="text-2xl font-bold">{seances.length}</p><p className="text-sm">Total cours</p></div>
              <div><p className="text-2xl font-bold">{JOURS.filter(j => getSeancesByJour(j).length > 0).length}</p><p className="text-sm">Jours avec cours</p></div>
              <div><p className="text-2xl font-bold">{new Set(seances.map(s => s.matiere?.nom)).size}</p><p className="text-sm">Matières</p></div>
              <div><p className="text-2xl font-bold">{new Set(seances.map(s => s.enseignant?.nom)).size}</p><p className="text-sm">Enseignants</p></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
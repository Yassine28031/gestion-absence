import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const JOURS_ORDER = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];

export default function EnseignantEmploiDuTemps() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [emploi, setEmploi] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedJour, setSelectedJour] = useState('Lundi');

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
    fetchEmploi(connectedUser);
  }, []);

  const fetchEmploi = async (user) => {
    try {
      const res = await fetch(`http://localhost:5000/api/emploi-du-temps?enseignant=${user._id || user.id}`);
      const data = await res.json();
      setEmploi(data);
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  const getSeancesByJour = (jour) => {
    if (!emploi || !emploi.seances) return [];
    return emploi.seances
      .filter((seance) => seance.jour === jour)
      .sort((a, b) => a.heureDebut.localeCompare(b.heureDebut));
  };

  const getUniqueClasses = () => {
    if (!emploi?.seances) return 0;
    const classes = new Set();
    emploi.seances.forEach(seance => {
      if (seance.classe?.nom) {
        classes.add(seance.classe.nom);
      }
    });
    return classes.size;
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
      <nav className="bg-blue-600 text-white p-4 shadow-md">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold">📅 Mon Agenda</h1>
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
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Mon emploi du temps</h2>

        <div className="flex flex-wrap gap-2 mb-6">
          {JOURS_ORDER.map((jour) => {
            const count = getSeancesByJour(jour).length;
            return (
              <button
                key={jour}
                onClick={() => setSelectedJour(jour)}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  selectedJour === jour
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                {jour}
                {count > 0 && (
                  <span className={`ml-2 text-xs px-2 py-0.5 rounded-full ${
                    selectedJour === jour ? 'bg-blue-400' : 'bg-gray-200'
                  }`}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="bg-blue-600 text-white p-4">
            <h3 className="text-lg font-bold">{selectedJour}</h3>
          </div>
          
          {getSeancesByJour(selectedJour).length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              📭 Aucun cours programmé ce jour
            </div>
          ) : (
            <div className="divide-y">
              {getSeancesByJour(selectedJour).map((seance, index) => (
                <div key={index} className="p-4 hover:bg-gray-50 transition">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-semibold">
                          {seance.heureDebut} - {seance.heureFin}
                        </span>
                        <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">
                          🏫 Salle {seance.salle}
                        </span>
                      </div>
                      <h4 className="text-lg font-bold text-gray-800">{seance.matiere?.nom}</h4>
                      <p className="text-gray-600 text-sm mt-1">
                        🎓 Classe : {seance.classe?.nom} - {seance.classe?.filiere} ({seance.classe?.niveau})
                      </p>
                    </div>
                    <button
                      onClick={() => navigate(`/dashboard/enseignant/appel?matiere=${seance.matiere._id}&classe=${seance.classe._id}`)}
                      className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
                    >
                      📋 Faire l'appel
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mt-6 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg shadow-lg p-6 text-white">
          <h3 className="text-lg font-bold mb-3">📊 Résumé de la semaine</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <p className="text-2xl font-bold">{emploi?.seances?.length || 0}</p>
              <p className="text-sm opacity-90">Total cours</p>
            </div>
            <div>
              <p className="text-2xl font-bold">
                {JOURS_ORDER.filter(j => getSeancesByJour(j).length > 0).length}
              </p>
              <p className="text-sm opacity-90">Jours avec cours</p>
            </div>
            <div>
              <p className="text-2xl font-bold">{getUniqueClasses()}</p>
              <p className="text-sm opacity-90">Classes différentes</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
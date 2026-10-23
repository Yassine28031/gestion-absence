import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const TOTAL_SEANCES_FIXE = 8;

export default function EtudiantAbsences() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [matieres, setMatieres] = useState([]);
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
    fetchAbsences(connectedUser);
  }, []);

  const fetchAbsences = async (user) => {
    try {
      if (!user.classeId) {
        setError('Vous n\'êtes pas associé à une classe.');
        setLoading(false);
        return;
      }

      const matieresRes = await fetch(`http://localhost:5000/api/matieres?classe=${user.classeId}`);
      const matieresData = await matieresRes.json();

      if (!matieresData || matieresData.length === 0) {
        setError('Aucune matière trouvée pour votre classe.');
        setLoading(false);
        return;
      }

      const seancesRes = await fetch(`http://localhost:5000/api/seances?classe=${user.classeId}`);
      const seancesData = await seancesRes.json();

      const stats = matieresData.map((matiere) => {
        const seancesMatiere = seancesData.filter(
          (seance) => seance.matiere?._id === matiere._id
        );
        
        let absencesCount = 0;
        
        for (const seance of seancesMatiere) {
          const absence = seance.absences?.find(
            (a) => a.etudiantNom === user.nom && a.etudiantPrenom === user.prenom
          );
          if (absence && absence.present === false) absencesCount++;
        }
        
        const tauxAbsence = TOTAL_SEANCES_FIXE > 0 
          ? Math.round((absencesCount / TOTAL_SEANCES_FIXE) * 100) 
          : 0;
        
        return {
          matiereId: matiere._id,
          matiereNom: matiere.nom,
          totalSeancesMax: TOTAL_SEANCES_FIXE,
          absencesCount: absencesCount,
          tauxAbsence: tauxAbsence
        };
      });
      
      setMatieres(stats);
    } catch (error) {
      setError('Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  const getTauxColor = (taux) => {
    if (taux === 0) return 'bg-green-100 text-green-700';
    if (taux < 20) return 'bg-yellow-100 text-yellow-700';
    if (taux < 50) return 'bg-orange-100 text-orange-700';
    return 'bg-red-100 text-red-700';
  };

  const getStatut = (absences, total) => {
    const taux = (absences / total) * 100;
    if (taux === 0) return { text: '✅ Bon élève', color: 'bg-green-100 text-green-700' };
    if (taux < 20) return { text: '⚠️ Attention', color: 'bg-yellow-100 text-yellow-700' };
    if (taux < 50) return { text: '⚠️ Alerte', color: 'bg-orange-100 text-orange-700' };
    return { text: '❌ Critique', color: 'bg-red-100 text-red-700' };
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
          <h1 className="text-xl font-bold">📋 Mes Absences</h1>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              {user?.photo ? (
                <img src={user.photo} alt="Photo" className="w-8 h-8 rounded-full object-cover border-2 border-white" />
              ) : (
                <div className="w-8 h-8 rounded-full bg-white text-green-600 flex items-center justify-center">
                  <span className="text-sm font-bold">{user?.prenom?.charAt(0)}{user?.nom?.charAt(0)}</span>
                </div>
              )}
              <span className="text-sm">{user?.prenom} {user?.nom}</span>
            </div>
            <Link to="/dashboard/etudiant" className="text-white hover:text-green-200">← Retour</Link>
            <button onClick={handleLogout} className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg text-sm">
              Déconnexion
            </button>
          </div>
        </div>
      </nav>

      <div className="container mx-auto p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Tableau des présences et absences</h2>

        {error && (
          <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-6 rounded">
            <p className="font-bold">⚠️ Attention</p>
            <p>{error}</p>
          </div>
        )}

        {matieres.length === 0 && !error ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-gray-500">Aucune absence enregistrée pour le moment.</p>
          </div>
        ) : (
          <>
            <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-8">
              <table className="w-full">
                <thead className="bg-blue-600 text-white">
                  <tr>
                    <th className="p-4 text-left">Matière</th>
                    <th className="p-4 text-center">Absences</th>
                    <th className="p-4 text-center">Total séances</th>
                    <th className="p-4 text-center">Taux</th>
                    <th className="p-4 text-center">Statut</th>
                  </tr>
                </thead>
                <tbody>
                  {matieres.map((matiere, index) => {
                    const statut = getStatut(matiere.absencesCount, matiere.totalSeancesMax);
                    return (
                      <tr key={matiere.matiereId} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                        <td className="p-4 font-semibold">{matiere.matiereNom}</td>
                        <td className="p-4 text-center">
                          <span className={`text-xl font-bold ${matiere.absencesCount > 0 ? 'text-red-600' : 'text-green-600'}`}>
                            {matiere.absencesCount}
                          </span>
                          <span className="text-gray-400">/{matiere.totalSeancesMax}</span>
                        </td>
                        <td className="p-4 text-center">{matiere.totalSeancesMax}</td>
                        <td className="p-4 text-center">
                          <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getTauxColor(matiere.tauxAbsence)}`}>
                            {matiere.tauxAbsence}%
                          </span>
                        </td>
                        <td className="p-4 text-center">
                          <span className={`px-3 py-1 rounded-full text-sm font-semibold ${statut.color}`}>
                            {statut.text}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
              <h3 className="text-lg font-bold mb-4">📊 Progression des absences</h3>
              {matieres.map((matiere) => {
                const pourcentage = (matiere.absencesCount / matiere.totalSeancesMax) * 100;
                return (
                  <div key={matiere.matiereId} className="mb-4">
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium">{matiere.matiereNom}</span>
                      <span className="text-sm text-gray-500">
                        {matiere.absencesCount}/{matiere.totalSeancesMax} ({matiere.tauxAbsence}%)
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div className={`h-2.5 rounded-full ${pourcentage === 0 ? 'bg-green-500' : pourcentage < 20 ? 'bg-yellow-500' : pourcentage < 50 ? 'bg-orange-500' : 'bg-red-500'}`} style={{ width: `${pourcentage}%` }}></div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg shadow-lg p-6 text-white">
              <h3 className="text-lg font-bold mb-3">📊 Résumé général</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div><p className="text-2xl font-bold">{matieres.length}</p><p className="text-sm">Matières</p></div>
                <div><p className="text-2xl font-bold">{matieres.reduce((sum, m) => sum + m.absencesCount, 0)}</p><p className="text-sm">Total absences</p></div>
                <div><p className="text-2xl font-bold">{matieres.length * TOTAL_SEANCES_FIXE}</p><p className="text-sm">Total séances max</p></div>
                <div><p className="text-2xl font-bold">{Math.round(matieres.reduce((sum, m) => sum + m.tauxAbsence, 0) / matieres.length)}%</p><p className="text-sm">Taux moyen</p></div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
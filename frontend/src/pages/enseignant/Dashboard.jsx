import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function EnseignantDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

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
    setLoading(false);
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-blue-600 text-white p-4 shadow-md">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold">Dashboard Enseignant</h1>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              {user?.photo ? (
                <img src={`http://localhost:5000${user.photo}`} alt="Photo" className="w-8 h-8 rounded-full object-cover border-2 border-white" />
              ) : (
                <div className="w-8 h-8 rounded-full bg-white text-blue-600 flex items-center justify-center">
                  <span className="text-sm font-bold">{user?.prenom?.charAt(0)}{user?.nom?.charAt(0)}</span>
                </div>
              )}
              <span className="text-sm">{user?.prenom} {user?.nom}</span>
            </div>
            <button
              onClick={handleLogout}
              className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg text-sm font-medium"
            >
              Déconnexion
            </button>
          </div>
        </div>
      </nav>

      <div className="container mx-auto p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">
          Tableau de bord
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          
          {/* Faire l'appel */}
          <div
            onClick={() => navigate('/dashboard/enseignant/appel')}
            className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition cursor-pointer border-2 border-transparent hover:border-blue-500"
          >
            <div className="text-5xl mb-4">📋</div>
            <h3 className="text-xl font-bold mb-2">Faire l'appel</h3>
            <p className="text-gray-600">Choisissez une matière et une classe</p>
            <p className="text-gray-600 text-sm mt-2">→ Marquez les présents/absents</p>
            <div className="mt-4 text-blue-600 font-semibold">Accéder →</div>
          </div>

          {/* Mon agenda */}
          <div
            onClick={() => navigate('/dashboard/enseignant/emploi-du-temps')}
            className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition cursor-pointer border-2 border-transparent hover:border-blue-500"
          >
            <div className="text-5xl mb-4">📅</div>
            <h3 className="text-xl font-bold mb-2">Mon agenda</h3>
            <p className="text-gray-600">Voir tous vos cours de la semaine</p>
            <p className="text-gray-600 text-sm mt-2">→ Par jour et par classe</p>
            <div className="mt-4 text-blue-600 font-semibold">Accéder →</div>
          </div>

          {/* Historique des appels */}
          <div
            onClick={() => navigate('/dashboard/enseignant/historique')}
            className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition cursor-pointer border-2 border-transparent hover:border-blue-500"
          >
            <div className="text-5xl mb-4">📚</div>
            <h3 className="text-xl font-bold mb-2">Historique</h3>
            <p className="text-gray-600">Consulter vos appels passés</p>
            <p className="text-gray-600 text-sm mt-2">→ Filtrer par date, matière, classe</p>
            <div className="mt-4 text-blue-600 font-semibold">Accéder →</div>
          </div>

          {/* Discussions */}
          <div
            onClick={() => navigate('/dashboard/enseignant/messages')}
            className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition cursor-pointer border-2 border-transparent hover:border-blue-500"
          >
            <div className="text-5xl mb-4">💬</div>
            <h3 className="text-xl font-bold mb-2">Discussions</h3>
            <p className="text-gray-600">Envoyer des messages aux étudiants</p>
            <p className="text-gray-600 text-sm mt-2">→ Par classe</p>
            <div className="mt-4 text-blue-600 font-semibold">Accéder →</div>
          </div>

          {/* Mon profil */}
          <div
            onClick={() => navigate('/dashboard/enseignant/profil')}
            className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition cursor-pointer border-2 border-transparent hover:border-blue-500"
          >
            <div className="text-5xl mb-4">👤</div>
            <h3 className="text-xl font-bold mb-2">Mon profil</h3>
            <p className="text-gray-600">Gérer vos informations personnelles</p>
            <p className="text-gray-600 text-sm mt-2">→ Modifier nom, prénom, email</p>
            <div className="mt-4 text-blue-600 font-semibold">Accéder →</div>
          </div>

        </div>

        <div className="mt-8 p-6 bg-white rounded-lg shadow-lg">
          <div className="flex items-center space-x-4">
            {user?.photo ? (
              <img src={`http://localhost:5000${user.photo}`} alt="Photo" className="w-16 h-16 rounded-full object-cover border-2 border-blue-500" />
            ) : (
              <div className="w-16 h-16 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
                <span className="text-2xl font-bold">{user?.prenom?.charAt(0)}{user?.nom?.charAt(0)}</span>
              </div>
            )}
            <div>
              <h3 className="text-lg font-bold mb-1">Bienvenue, {user?.prenom} {user?.nom} !</h3>
              <p className="text-gray-600">Utilisez les cartes ci-dessus pour gérer vos cours.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
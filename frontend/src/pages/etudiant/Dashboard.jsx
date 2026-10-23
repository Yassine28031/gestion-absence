import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function EtudiantDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState(0);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [classeNom, setClasseNom] = useState('');

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
    fetchNotifications(connectedUser);
    fetchUnreadMessages(connectedUser);
    fetchClasseNom(connectedUser);
    setLoading(false);
  }, [navigate]);

  const fetchNotifications = async (user) => {
    try {
      const res = await fetch(`http://localhost:5000/api/seances?classe=${user.classeId}`);
      const data = await res.json();
      
      let absenceCount = 0;
      data.forEach((seance) => {
        const absence = seance.absences?.find(
          (a) => a.etudiantNom === user.nom && a.etudiantPrenom === user.prenom && !a.present
        );
        if (absence) absenceCount++;
      });
      
      setNotifications(absenceCount);
    } catch (error) {
      console.error('Erreur chargement notifications:', error);
    }
  };

  const fetchUnreadMessages = async (user) => {
    try {
      if (!user.classeId) return;
      const res = await fetch(`http://localhost:5000/api/messages/classe/${user.classeId}`);
      const data = await res.json();
      const unread = data.filter(msg => !msg.luPar?.includes(user._id || user.id)).length;
      setUnreadMessages(unread);
    } catch (error) {
      console.error('Erreur chargement messages:', error);
    }
  };

  const fetchClasseNom = async (user) => {
    try {
      if (!user.classeId) return;
      const res = await fetch(`http://localhost:5000/api/classes/${user.classeId}`);
      const data = await res.json();
      setClasseNom(data.nom || '');
    } catch (error) {
      console.error('Erreur chargement classe:', error);
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
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Barre de navigation avec photo de profil */}
      <nav className="bg-green-600 text-white p-4 shadow-md">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold">Dashboard Étudiant</h1>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              {user?.photo ? (
                <img
                  src={`http://localhost:5000${user.photo}`}
                  alt="Photo de profil"
                  className="w-8 h-8 rounded-full object-cover border-2 border-white"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-white text-green-600 flex items-center justify-center">
                  <span className="text-sm font-bold">
                    {user?.prenom?.charAt(0)}{user?.nom?.charAt(0)}
                  </span>
                </div>
              )}
              <span className="text-sm font-medium">
                {user?.prenom} {user?.nom}
              </span>
            </div>
            <button
              onClick={handleLogout}
              className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              Déconnexion
            </button>
          </div>
        </div>
      </nav>

      {/* Contenu principal */}
      <div className="container mx-auto p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">
          Tableau de bord
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          
          {/* Mes absences */}
          <div 
            onClick={() => navigate('/dashboard/etudiant/absences')}
            className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition cursor-pointer border-2 border-transparent hover:border-green-500"
          >
            <div className="text-4xl mb-4">📋</div>
            <h3 className="text-xl font-bold mb-2">Mes absences</h3>
            <p className="text-gray-600">Consulter votre historique</p>
            <div className="mt-4 text-green-600 font-semibold">Accéder →</div>
          </div>

          {/* Mon agenda */}
          <div 
            onClick={() => navigate('/dashboard/etudiant/agenda')}
            className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition cursor-pointer border-2 border-transparent hover:border-green-500"
          >
            <div className="text-4xl mb-4">📅</div>
            <h3 className="text-xl font-bold mb-2">Mon agenda</h3>
            <p className="text-gray-600">Voir mon emploi du temps</p>
            <div className="mt-4 text-green-600 font-semibold">Accéder →</div>
          </div>

          {/* Notifications */}
          <div 
            onClick={() => navigate('/dashboard/etudiant/notifications')}
            className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition cursor-pointer border-2 border-transparent hover:border-green-500 relative"
          >
            <div className="text-4xl mb-4">🔔</div>
            <h3 className="text-xl font-bold mb-2">Notifications</h3>
            <p className="text-gray-600">Voir vos notifications</p>
            {notifications > 0 && (
              <div className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
                {notifications}
              </div>
            )}
            <div className="mt-4 text-green-600 font-semibold">Accéder →</div>
          </div>

          {/* Discussions */}
          <div 
            onClick={() => navigate('/dashboard/etudiant/discussions')}
            className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition cursor-pointer border-2 border-transparent hover:border-green-500 relative"
          >
            <div className="text-4xl mb-4">💬</div>
            <h3 className="text-xl font-bold mb-2">Discussions</h3>
            <p className="text-gray-600">Messages des enseignants</p>
            {unreadMessages > 0 && (
              <div className="absolute top-2 right-2 bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
                {unreadMessages}
              </div>
            )}
            <div className="mt-4 text-green-600 font-semibold">Accéder →</div>
          </div>

          {/* Mon profil */}
          <div 
            onClick={() => navigate('/dashboard/etudiant/profil')}
            className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition cursor-pointer border-2 border-transparent hover:border-green-500"
          >
            <div className="text-4xl mb-4">👤</div>
            <h3 className="text-xl font-bold mb-2">Mon profil</h3>
            <p className="text-gray-600">Gérer vos informations</p>
            <div className="mt-4 text-green-600 font-semibold">Accéder →</div>
          </div>
        </div>
            
        {/* Message de bienvenue avec photo et classe */}
        <div className="mt-8 bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center space-x-4">
            {user?.photo ? (
              <img
                src={`http://localhost:5000${user.photo}`}
                alt="Photo de profil"
                className="w-16 h-16 rounded-full object-cover border-2 border-green-500"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-green-100 text-green-600 flex items-center justify-center">
                <span className="text-2xl font-bold">
                  {user?.prenom?.charAt(0)}{user?.nom?.charAt(0)}
                </span>
              </div>
            )}
            <div>
              <p className="text-gray-700">
                Bienvenue <span className="font-bold text-green-600">{user?.prenom} {user?.nom}</span> !
              </p>
              <p className="text-sm text-gray-500 mt-1">
                🎓 Classe : <span className="font-semibold text-green-600">{classeNom || 'Non définie'}</span>
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Vous êtes connecté en tant qu'étudiant.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
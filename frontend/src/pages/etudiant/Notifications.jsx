import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

export default function EtudiantNotifications() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

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
  }, []);

  const fetchNotifications = async (user) => {
    try {
      const res = await fetch(`http://localhost:5000/api/seances?classe=${user.classeId}`);
      const data = await res.json();
      
      const notifs = [];
      data.forEach((seance) => {
        const absence = seance.absences?.find(a => a.etudiantNom === user.nom && a.etudiantPrenom === user.prenom && !a.present);
        if (absence) {
          notifs.push({
            id: seance._id,
            message: `Absence au cours de ${seance.matiere?.nom} du ${new Date(seance.date).toLocaleDateString('fr-FR')}`,
            date: seance.date,
            type: 'absence',
            lu: false,
            matiere: seance.matiere?.nom
          });
        }
      });
      
      setNotifications(notifs);
      setUnreadCount(notifs.length);
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
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
          <h1 className="text-xl font-bold">🔔 Notifications {unreadCount > 0 && <span className="ml-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">{unreadCount} nouvelle(s)</span>}</h1>
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
        <h2 className="text-2xl font-bold mb-6">Vos notifications</h2>
        
        {notifications.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <div className="text-4xl mb-4">✅</div>
            <p className="text-gray-500">Aucune nouvelle notification</p>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map((notif) => (
              <div key={notif.id} className="bg-white rounded-lg shadow p-4 border-l-4 border-l-red-500">
                <div className="flex items-start">
                  <div className="text-2xl mr-3">⚠️</div>
                  <div className="flex-1">
                    <p className="text-gray-800 font-medium">{notif.message}</p>
                    <p className="text-xs text-gray-400 mt-2">{new Date(notif.date).toLocaleDateString('fr-FR')}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {notifications.length > 0 && (
          <div className="mt-6 text-center">
            <Link to="/dashboard/etudiant/absences" className="text-blue-600 hover:text-blue-800 font-medium">📊 Voir le détail de mes absences →</Link>
          </div>
        )}
      </div>
    </div>
  );
}
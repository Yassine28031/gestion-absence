import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({
    etudiants: 0,
    enseignants: 0,
    classes: 0
  });

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      navigate('/login');
      return;
    }
    const connectedUser = JSON.parse(userData);
    if (connectedUser.role !== 'admin') {
      navigate(`/dashboard/${connectedUser.role}`);
      return;
    }
    setUser(connectedUser);
    fetchStats();
  }, [navigate]);

  const fetchStats = async () => {
    try {
      const [classesRes, usersRes] = await Promise.all([
        fetch('http://localhost:5000/api/classes'),
        fetch('http://localhost:5000/api/users'),
      ]);
      const classesData = await classesRes.json();
      const usersData = await usersRes.json();

      const etudiants = usersData.filter((u) => u.role === 'etudiant').length;
      const enseignants = usersData.filter((u) => u.role === 'enseignant').length;

      setStats({
        classes: classesData.length,
        etudiants,
        enseignants,
      });
    } catch (error) {
      console.error('Erreur chargement stats:', error);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchStats();
    setTimeout(() => setRefreshing(false), 1000);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-blue-800 text-white p-4 shadow-md">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold">Dashboard Administrateur</h1>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              {user?.photo ? (
                <img src={user.photo} alt="Photo" className="w-8 h-8 rounded-full object-cover border-2 border-white" />
              ) : (
                <div className="w-8 h-8 rounded-full bg-white text-blue-800 flex items-center justify-center">
                  <span className="text-sm font-bold">{user?.prenom?.charAt(0)}{user?.nom?.charAt(0)}</span>
                </div>
              )}
              <span className="text-sm">{user?.prenom} {user?.nom}</span>
            </div>
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="bg-green-600 hover:bg-green-700 px-3 py-2 rounded-lg text-sm font-medium disabled:opacity-50"
            >
              {refreshing ? '↻ Rafraîchissement...' : '↻ Rafraîchir'}
            </button>
            <button onClick={handleLogout} className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg text-sm font-medium">
              Déconnexion
            </button>
          </div>
        </div>
      </nav>

      <div className="container mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Tableau de bord</h2>
          <p className="text-sm text-gray-500">Dernière mise à jour: {new Date().toLocaleTimeString()}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Créer des comptes */}
          <Link to="/dashboard/admin/creer-compte" className="block">
            <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition cursor-pointer border-2 border-transparent hover:border-blue-500">
              <div className="text-4xl mb-4">👥</div>
              <h3 className="text-xl font-bold mb-2">Créer des comptes</h3>
              <p className="text-gray-600">Créer des comptes pour les étudiants et les enseignants</p>
              <div className="mt-4 text-blue-600 font-semibold">Accéder →</div>
            </div>
          </Link>

          {/* Gestion des enseignants */}
          <Link to="/dashboard/admin/enseignants" className="block">
            <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition cursor-pointer border-2 border-transparent hover:border-blue-500">
              <div className="text-4xl mb-4">👨‍🏫</div>
              <h3 className="text-xl font-bold mb-2">Gestion des enseignants</h3>
              <p className="text-gray-600">Voir et gérer tous les enseignants</p>
              <div className="mt-4 text-blue-600 font-semibold">Accéder →</div>
            </div>
          </Link>

          {/* Gestion des classes */}
          <Link to="/dashboard/admin/classes" className="block">
            <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition cursor-pointer border-2 border-transparent hover:border-blue-500">
              <div className="text-4xl mb-4">📚</div>
              <h3 className="text-xl font-bold mb-2">Gestion des classes</h3>
              <p className="text-gray-600">Créer et gérer les classes avec leurs étudiants</p>
              <div className="mt-4 text-blue-600 font-semibold">Accéder →</div>
            </div>
          </Link>

          {/* Gestion des matières */}
          <Link to="/dashboard/admin/matieres" className="block">
            <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition cursor-pointer border-2 border-transparent hover:border-blue-500">
              <div className="text-4xl mb-4">📝</div>
              <h3 className="text-xl font-bold mb-2">Gestion des matières</h3>
              <p className="text-gray-600">Affecter des matières aux enseignants et aux classes</p>
              <div className="mt-4 text-blue-600 font-semibold">Accéder →</div>
            </div>
          </Link>

          {/* Emploi du temps */}
          <Link to="/dashboard/admin/emploi-du-temps" className="block">
            <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition cursor-pointer border-2 border-transparent hover:border-blue-500">
              <div className="text-4xl mb-4">📅</div>
              <h3 className="text-xl font-bold mb-2">Emploi du temps</h3>
              <p className="text-gray-600">Créer et gérer les emplois du temps des classes</p>
              <div className="mt-4 text-blue-600 font-semibold">Accéder →</div>
            </div>
          </Link>

          {/* Mon profil */}
          <Link to="/dashboard/admin/profil" className="block">
            <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition cursor-pointer border-2 border-transparent hover:border-blue-500">
              <div className="text-4xl mb-4">👤</div>
              <h3 className="text-xl font-bold mb-2">Mon profil</h3>
              <p className="text-gray-600">Gérer vos informations personnelles</p>
              <div className="mt-4 text-blue-600 font-semibold">Accéder →</div>
            </div>
          </Link>

          {/* Statistiques */}
          <div className="bg-white rounded-lg shadow-lg p-6 border-2 border-transparent">
            <div className="text-4xl mb-4">📊</div>
            <h3 className="text-xl font-bold mb-2">Statistiques</h3>
            <p className="text-gray-600 mb-2">Vue d'ensemble de l'établissement</p>
            <div className="mt-2 space-y-1">
              <p className="text-sm">👨‍🎓 Étudiants : <span className="font-bold text-blue-600">{stats.etudiants}</span></p>
              <p className="text-sm">👨‍🏫 Enseignants : <span className="font-bold text-blue-600">{stats.enseignants}</span></p>
              <p className="text-sm">📚 Classes : <span className="font-bold text-blue-600">{stats.classes}</span></p>
            </div>
          </div>
        </div>

        <div className="mt-8 p-6 bg-white rounded-lg shadow-lg">
          <div className="flex items-center space-x-4">
            {user?.photo ? (
              <img src={user.photo} alt="Photo" className="w-16 h-16 rounded-full object-cover border-2 border-blue-500" />
            ) : (
              <div className="w-16 h-16 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
                <span className="text-2xl font-bold">{user?.prenom?.charAt(0)}{user?.nom?.charAt(0)}</span>
              </div>
            )}
            <div>
              <h3 className="text-lg font-bold mb-1">Bienvenue, {user?.prenom} {user?.nom} !</h3>
              <p className="text-gray-600">Utilisez les cartes ci-dessus pour gérer votre établissement.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
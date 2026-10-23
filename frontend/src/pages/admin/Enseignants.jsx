import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';

export default function AdminEnseignantsPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [enseignants, setEnseignants] = useState([]);
  const [filteredEnseignants, setFilteredEnseignants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEnseignant, setSelectedEnseignant] = useState(null);
  const [matieresEnseignant, setMatieresEnseignant] = useState([]);
  const [classes, setClasses] = useState([]);
  const [message, setMessage] = useState({ type: '', text: '' });

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
    fetchData();
  }, [navigate]);

  const fetchData = async () => {
    try {
      const [usersRes, classesRes] = await Promise.all([
        fetch('http://localhost:5000/api/users?role=enseignant'),
        fetch('http://localhost:5000/api/classes')
      ]);
      
      const usersData = await usersRes.json();
      const classesData = await classesRes.json();
      
      setEnseignants(usersData);
      setFilteredEnseignants(usersData);
      setClasses(classesData);
    } catch (error) {
      console.error('Erreur:', error);
      setMessage({ type: 'error', text: 'Erreur lors du chargement' });
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (term) => {
    setSearchTerm(term);
    if (term === '') {
      setFilteredEnseignants(enseignants);
    } else {
      const filtered = enseignants.filter(ens => 
        ens.nom.toLowerCase().includes(term.toLowerCase()) ||
        ens.prenom.toLowerCase().includes(term.toLowerCase()) ||
        ens.email.toLowerCase().includes(term.toLowerCase())
      );
      setFilteredEnseignants(filtered);
    }
  };

  const voirDetailsEnseignant = async (enseignant) => {
    setSelectedEnseignant(enseignant);
    try {
      const res = await fetch(`http://localhost:5000/api/matieres?enseignant=${enseignant._id}`);
      const data = await res.json();
      setMatieresEnseignant(data);
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const supprimerEnseignant = async (id, nom) => {
    if (!confirm(`Supprimer définitivement l'enseignant "${nom}" ?`)) return;
    
    try {
      const res = await fetch(`http://localhost:5000/api/users/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setMessage({ type: 'success', text: `✅ Enseignant "${nom}" supprimé avec succès !` });
        fetchData();
        if (selectedEnseignant?._id === id) setSelectedEnseignant(null);
        setTimeout(() => setMessage({ type: '', text: '' }), 3000);
      } else {
        setMessage({ type: 'error', text: 'Erreur lors de la suppression' });
      }
    } catch (error) {
      console.error('Erreur:', error);
      setMessage({ type: 'error', text: 'Erreur lors de la suppression' });
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
      <nav className="bg-blue-800 text-white p-4 shadow-md">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold">👨‍🏫 Gestion des Enseignants</h1>
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
            <Link to="/dashboard/admin" className="text-white hover:text-blue-200">← Retour</Link>
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

        {/* Barre de recherche */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex flex-wrap justify-between items-center gap-4">
            <div className="flex-1 min-w-[200px]">
              <input
                type="text"
                placeholder="🔍 Rechercher un enseignant (nom, prénom, email)..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">{enseignants.length}</p>
                <p className="text-xs text-gray-500">Total enseignants</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">{filteredEnseignants.length}</p>
                <p className="text-xs text-gray-500">Résultats</p>
              </div>
            </div>
          </div>
        </div>

        {/* Liste des enseignants */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="bg-gray-50 px-6 py-4 border-b">
            <h2 className="text-lg font-bold text-gray-800">📋 Liste des enseignants</h2>
          </div>

          {filteredEnseignants.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              📭 Aucun enseignant trouvé
              {searchTerm && <p className="text-sm mt-2">Essayez une autre recherche</p>}
            </div>
          ) : (
            <div className="divide-y">
              {filteredEnseignants.map((enseignant) => (
                <div key={enseignant._id} className="p-4 hover:bg-gray-50 transition">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        {enseignant.photo ? (
                          <img src={enseignant.photo} alt="Photo" className="w-10 h-10 rounded-full object-cover" />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
                            <span className="font-bold">{enseignant.prenom?.charAt(0)}{enseignant.nom?.charAt(0)}</span>
                          </div>
                        )}
                        <div>
                          <h3 className="font-bold text-gray-800">
                            {enseignant.prenom} {enseignant.nom}
                          </h3>
                          <p className="text-sm text-gray-500">{enseignant.email}</p>
                        </div>
                      </div>
                      <p className="text-xs text-gray-400 mt-2">
                        Créé le : {new Date(enseignant.createdAt).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => voirDetailsEnseignant(enseignant)}
                        className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600"
                      >
                        📖 Voir détails
                      </button>
                      <button
                        onClick={() => supprimerEnseignant(enseignant._id, `${enseignant.prenom} ${enseignant.nom}`)}
                        className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600"
                      >
                        🗑️ Supprimer
                      </button>
                    </div>
                  </div>

                  {/* Détails de l'enseignant */}
                  {selectedEnseignant?._id === enseignant._id && (
                    <div className="mt-4 pt-4 border-t">
                      <h4 className="font-semibold text-gray-700 mb-2">
                        📚 Matières enseignées ({matieresEnseignant.length})
                      </h4>
                      {matieresEnseignant.length === 0 ? (
                        <p className="text-gray-500 text-sm">Aucune matière affectée pour le moment</p>
                      ) : (
                        <div className="flex flex-wrap gap-2">
                          {matieresEnseignant.map((matiere) => (
                            <span key={matiere._id} className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm">
                              {matiere.nom} - {matiere.classe?.nom}
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
          <h3 className="text-lg font-bold mb-3">📊 Résumé</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-2xl font-bold">{enseignants.length}</p>
              <p className="text-sm opacity-90">Total enseignants</p>
            </div>
            <div>
              <p className="text-2xl font-bold">
                {enseignants.filter(e => new Date(e.createdAt).getMonth() === new Date().getMonth()).length}
              </p>
              <p className="text-sm opacity-90">Créés ce mois</p>
            </div>
            <div>
              <p className="text-2xl font-bold">
                {enseignants.filter(e => new Date(e.createdAt).getDate() === new Date().getDate()).length}
              </p>
              <p className="text-sm opacity-90">Créés aujourd'hui</p>
            </div>
            <div>
              <p className="text-2xl font-bold">{classes.length}</p>
              <p className="text-sm opacity-90">Classes totales</p>
            </div>
          </div>
        </div>

        {/* Lien pour créer un enseignant */}
        <div className="mt-6 text-center">
          <Link
            to="/dashboard/admin/creer-compte"
            className="inline-block bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition"
          >
            + Créer un nouvel enseignant
          </Link>
        </div>
      </div>
    </div>
  );
}
import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

export default function EnseignantMessages() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [classes, setClasses] = useState([]);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    titre: '',
    contenu: '',
    classeId: '',
    classeNom: ''
  });
  const [message, setMessage] = useState({ type: '', text: '' });

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
  }, [navigate]);

  const fetchData = async (user) => {
    try {
      // Récupérer UNIQUEMENT les classes où l'enseignant donne des cours
      const [classesRes, messagesRes] = await Promise.all([
        fetch(`http://localhost:5000/api/classes/enseignant/${user._id || user.id}`),
        fetch(`http://localhost:5000/api/messages/enseignant/${user._id || user.id}`)
      ]);
      
      const classesData = await classesRes.json();
      const messagesData = await messagesRes.json();
      
      setClasses(classesData);
      setMessages(messagesData);
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.classeId) {
      setMessage({ type: 'error', text: 'Veuillez sélectionner une classe' });
      return;
    }
    
    const classe = classes.find(c => c._id === formData.classeId);
    
    try {
      const res = await fetch('http://localhost:5000/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          titre: formData.titre,
          contenu: formData.contenu,
          enseignantId: user._id || user.id,
          enseignantNom: `${user.prenom} ${user.nom}`,
          classeId: formData.classeId,
          classeNom: classe?.nom || ''
        })
      });
      
      if (res.ok) {
        setMessage({ type: 'success', text: '✅ Message envoyé à la classe !' });
        setShowForm(false);
        setFormData({ titre: '', contenu: '', classeId: '', classeNom: '' });
        fetchData(user);
        setTimeout(() => setMessage({ type: '', text: '' }), 3000);
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Erreur lors de l\'envoi' });
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Supprimer ce message ?')) return;
    try {
      await fetch(`http://localhost:5000/api/messages/${id}`, { method: 'DELETE' });
      fetchData(user);
    } catch (error) {
      console.error('Erreur:', error);
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
      <nav className="bg-blue-600 text-white p-4 shadow-md">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold">💬 Discussions</h1>
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
            <Link to="/dashboard/enseignant" className="text-white hover:text-blue-200">← Retour</Link>
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

        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">💬 Messages envoyés</h2>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            {showForm ? 'Annuler' : '+ Nouveau message'}
          </button>
        </div>

        {/* Formulaire d'envoi */}
        {showForm && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <h3 className="text-lg font-bold mb-4">Nouveau message</h3>
            
            {/* Message d'information si aucune classe */}
            {classes.length === 0 && (
              <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 mb-4 text-yellow-700">
                ⚠️ Vous n'êtes pas encore affecté à des classes. 
                Contactez l'administrateur pour créer des matières.
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Choisir une classe</label>
                <select
                  value={formData.classeId}
                  onChange={(e) => setFormData({...formData, classeId: e.target.value})}
                  className="w-full p-2 border rounded-lg"
                  required
                  disabled={classes.length === 0}
                >
                  <option value="">-- Sélectionner une classe --</option>
                  {classes.map((classe) => (
                    <option key={classe._id} value={classe._id}>
                      {classe.nom} - {classe.filiere} ({classe.niveau})
                    </option>
                  ))}
                </select>
                {classes.length === 0 && (
                  <p className="text-xs text-yellow-600 mt-1">
                    Aucune classe trouvée. Vous devez d'abord être affecté à des matières.
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Titre</label>
                <input
                  type="text"
                  value={formData.titre}
                  onChange={(e) => setFormData({...formData, titre: e.target.value})}
                  className="w-full p-2 border rounded-lg"
                  placeholder="Ex: Information importante"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Message</label>
                <textarea
                  value={formData.contenu}
                  onChange={(e) => setFormData({...formData, contenu: e.target.value})}
                  className="w-full p-2 border rounded-lg"
                  rows="4"
                  placeholder="Votre message..."
                  required
                />
              </div>
              <button 
                type="submit" 
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50"
                disabled={classes.length === 0}
              >
                📤 Envoyer
              </button>
            </form>
          </div>
        )}

        {/* Liste des messages */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {messages.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              📭 Aucun message envoyé
            </div>
          ) : (
            <div className="divide-y">
              {messages.map((msg) => (
                <div key={msg._id} className="p-4 hover:bg-gray-50 transition">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                          {new Date(msg.date).toLocaleDateString('fr-FR')}
                        </span>
                        <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">
                          🎓 Classe: {msg.classeNom}
                        </span>
                      </div>
                      <h3 className="text-lg font-bold text-gray-800">{msg.titre}</h3>
                      <p className="text-gray-600 mt-1">{msg.contenu}</p>
                      <p className="text-xs text-gray-400 mt-2">
                        📖 Lu par {msg.luPar?.length || 0} étudiant(s)
                      </p>
                    </div>
                    <button
                      onClick={() => handleDelete(msg._id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
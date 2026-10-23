import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

export default function EtudiantDiscussions() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [messages, setMessages] = useState([]);
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
    fetchMessages(connectedUser);
  }, [navigate]);

  const fetchMessages = async (user) => {
    try {
      if (!user.classeId) {
        setLoading(false);
        return;
      }
      
      const res = await fetch(`http://localhost:5000/api/messages/classe/${user.classeId}`);
      const data = await res.json();
      setMessages(data);
      
      // Compter les messages non lus
      const unread = data.filter(msg => !msg.luPar?.includes(user._id || user.id)).length;
      setUnreadCount(unread);
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  const marquerCommeLu = async (messageId) => {
    try {
      await fetch(`http://localhost:5000/api/messages/${messageId}/lire`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ etudiantId: user._id || user.id })
      });
      
      // Mettre à jour l'état local
      setMessages(messages.map(msg => 
        msg._id === messageId 
          ? { ...msg, luPar: [...(msg.luPar || []), user._id || user.id] }
          : msg
      ));
      setUnreadCount(Math.max(0, unreadCount - 1));
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
      <nav className="bg-green-600 text-white p-4 shadow-md">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold">
            💬 Discussions
            {unreadCount > 0 && (
              <span className="ml-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                {unreadCount} nouveau(x)
              </span>
            )}
          </h1>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              {user?.photo ? (
                <img src={`http://localhost:5000${user.photo}`} alt="Photo" className="w-8 h-8 rounded-full object-cover border-2 border-white" />
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
        <h2 className="text-2xl font-bold text-gray-800 mb-6">
          📬 Messages de vos enseignants
        </h2>

        {messages.length === 0 ? (
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="text-5xl mb-4">📭</div>
            <p className="text-gray-500">Aucun message pour le moment</p>
            <p className="text-sm text-gray-400 mt-2">
              Les messages de vos enseignants apparaîtront ici
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((msg) => {
              const isLu = msg.luPar?.includes(user?._id || user?.id);
              return (
                <div
                  key={msg._id}
                  onClick={() => !isLu && marquerCommeLu(msg._id)}
                  className={`bg-white rounded-lg shadow-lg p-6 cursor-pointer transition hover:shadow-xl ${
                    !isLu ? 'border-l-4 border-l-blue-500 bg-blue-50' : ''
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                          {new Date(msg.date).toLocaleDateString('fr-FR')}
                        </span>
                        <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-xs">
                          👨‍🏫 {msg.enseignantNom}
                        </span>
                        {!isLu && (
                          <span className="bg-red-500 text-white px-2 py-1 rounded text-xs">
                            Nouveau
                          </span>
                        )}
                      </div>
                      <h3 className="text-xl font-bold text-gray-800">{msg.titre}</h3>
                      <p className="text-gray-600 mt-2 whitespace-pre-wrap">{msg.contenu}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
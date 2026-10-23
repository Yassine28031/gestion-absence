import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

export default function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [selectedRole, setSelectedRole] = useState('etudiant');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await api.post('/auth/login', { ...formData, role: selectedRole });
      
      if (res.data.success) {
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('user', JSON.stringify(res.data.user));
        navigate(`/dashboard/${res.data.user.role}`);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Erreur de connexion');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 w-full h-full overflow-hidden bg-gradient-to-br from-blue-900 to-purple-900">
      {/* Conteneur centré */}
      <div className="w-full h-full flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-xl p-8">
          <div className="mb-4">
            <button
              onClick={() => navigate('/')}
              className="text-gray-500 hover:text-blue-600 transition flex items-center gap-2"
            >
              ← Retour à l'accueil
            </button>
          </div>

          <h2 className="text-3xl font-bold text-center mb-2 text-gray-800">Connexion</h2>
          <p className="text-center text-gray-500 mb-6">Accédez à votre espace personnel</p>
          
          {error && (
            <div className="bg-red-50 text-red-700 p-3 rounded-lg mb-4 border border-red-200">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Je me connecte en tant que :
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedRole('etudiant')}
                  className={`py-2 px-3 rounded-lg text-sm font-medium transition ${
                    selectedRole === 'etudiant'
                      ? 'bg-green-600 text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  🎓 Étudiant
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedRole('enseignant')}
                  className={`py-2 px-3 rounded-lg text-sm font-medium transition ${
                    selectedRole === 'enseignant'
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  👨‍🏫 Enseignant
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedRole('admin')}
                  className={`py-2 px-3 rounded-lg text-sm font-medium transition ${
                    selectedRole === 'admin'
                      ? 'bg-red-600 text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  👑 Admin
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                placeholder="exemple@email.com"
                required
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mot de passe</label>
              <input
                type="password"
                placeholder="••••••••"
                required
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition font-medium"
            >
              {loading ? 'Connexion en cours...' : 'Se connecter'}
            </button>
          </form>

          <div className="mt-6 p-4 bg-amber-50 rounded-lg border border-amber-200">
            <div className="flex items-start">
              <div className="text-amber-500 text-xl mr-3">📌</div>
              <div>
                <p className="font-semibold text-amber-800 mb-1">Information importante</p>
                <p className="text-sm text-amber-700">
                  Les identifiants de connexion (email et mot de passe) vous sont fournis par l'administration.
                </p>
                <p className="text-sm text-amber-600 mt-2">
                  Si vous n'avez pas encore reçu vos identifiants, veuillez contacter le service administratif.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-4 text-center">
            <p className="text-xs text-gray-500">
              Besoin d'aide ? Contactez l'administration à{' '}
              <a href="mailto:admin@votre-ecole.fr" className="text-blue-600 hover:underline">
                admin@votre-ecole.fr
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
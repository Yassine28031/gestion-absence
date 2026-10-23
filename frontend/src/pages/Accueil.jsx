import { useNavigate } from 'react-router-dom';

export default function Accueil() {
  const navigate = useNavigate();

  return (
    <div className="fixed inset-0 w-full h-full overflow-hidden">
      {/* Vidéo en arrière-plan */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute top-0 left-0 w-full h-full object-cover z-0"
      >
        <source src="/videos/background.mp4" type="video/mp4" />
      </video>

      {/* Overlay sombre */}
      <div className="absolute inset-0 bg-black/50 z-10"></div>

      {/* Contenu */}
      <div className="relative z-20 w-full h-full flex flex-col">
        {/* Navigation */}
        <nav className="w-full px-6 py-4 flex justify-between items-center">
          <div className="text-white text-2xl font-bold">
             Gestion d'Absence
          </div>
          <button
            onClick={() => navigate('/login')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition"
          >
             Connexion
          </button>
        </nav>

        {/* Contenu centré */}
        <div className="flex-1 flex items-center justify-center text-center px-4">
          <div className="max-w-4xl">
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">
              Gérez les absences
              <span className="text-blue-400"> simplement</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-200 mb-8 max-w-2xl mx-auto">
              Une solution complète pour les établissements scolaires. 
              Suivez les présences, gérez les classes et communiquez facilement.
            </p>
            <button
              onClick={() => navigate('/login')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg text-lg font-semibold transition transform hover:scale-105"
            >
               Commencer maintenant
            </button>
          </div>
        </div>

        {/* Footer */}
        <footer className="w-full bg-black/30 py-4 text-center text-gray-300 text-sm">
          <p>&copy; 2025 Gestion d'Absence - Tous droits réservés</p>
        </footer>
      </div>
    </div>
  );
}
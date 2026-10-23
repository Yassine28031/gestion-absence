import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const JOURS = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
const HEURES = [
  '08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30',
  '16:00', '16:30', '17:00', '17:30', '18:00'
];

export default function AdminEmploiDuTempsPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [classes, setClasses] = useState([]);
  const [matieres, setMatieres] = useState([]);
  const [enseignants, setEnseignants] = useState([]);
  const [selectedClasse, setSelectedClasse] = useState('');
  const [seances, setSeances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
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
      const [classesRes, matieresRes, usersRes] = await Promise.all([
        fetch('http://localhost:5000/api/classes'),
        fetch('http://localhost:5000/api/matieres'),
        fetch('http://localhost:5000/api/users?role=enseignant')
      ]);
      
      const classesData = await classesRes.json();
      const matieresData = await matieresRes.json();
      const usersData = await usersRes.json();
      
      setClasses(classesData);
      setMatieres(matieresData);
      setEnseignants(usersData);
    } catch (error) {
      setMessage({ type: 'error', text: 'Erreur lors du chargement' });
    } finally {
      setLoading(false);
    }
  };

  const loadEmploiDuTemps = async (classeId) => {
    try {
      const res = await fetch(`http://localhost:5000/api/emploi-du-temps?classe=${classeId}`);
      const data = await res.json();
      if (data && data.seances && data.seances.length > 0) {
        setSeances(data.seances);
      } else {
        setSeances([]);
      }
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const handleClasseChange = (classeId) => {
    setSelectedClasse(classeId);
    if (classeId) {
      loadEmploiDuTemps(classeId);
    } else {
      setSeances([]);
    }
  };

  const ajouterSeance = () => {
    if (!selectedClasse) {
      setMessage({ type: 'error', text: 'Veuillez d\'abord sélectionner une classe' });
      return;
    }
    setSeances([
      ...seances,
      {
        jour: 'Lundi',
        heureDebut: '08:00',
        heureFin: '10:00',
        matiere: '',
        enseignant: '',
        salle: '',
        classe: selectedClasse
      }
    ]);
  };

  const supprimerSeance = (index) => {
    const newSeances = [...seances];
    newSeances.splice(index, 1);
    setSeances(newSeances);
  };

  const updateSeance = (index, field, value) => {
    const newSeances = [...seances];
    newSeances[index][field] = value;
    setSeances(newSeances);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedClasse) {
      setMessage({ type: 'error', text: 'Veuillez sélectionner une classe' });
      return;
    }
    
    if (seances.length === 0) {
      setMessage({ type: 'error', text: 'Veuillez ajouter au moins une séance' });
      return;
    }
    
    for (let i = 0; i < seances.length; i++) {
      const s = seances[i];
      if (!s.jour || !s.heureDebut || !s.heureFin || !s.matiere || !s.enseignant || !s.salle) {
        setMessage({ type: 'error', text: `Séance ${i + 1}: Veuillez remplir tous les champs` });
        return;
      }
    }
    
    const seancesAEnvoyer = seances.map(seance => ({
      jour: seance.jour,
      heureDebut: seance.heureDebut,
      heureFin: seance.heureFin,
      matiere: seance.matiere,
      enseignant: seance.enseignant,
      salle: seance.salle,
      classe: selectedClasse
    }));
    
    setSaving(true);
    try {
      const res = await fetch('http://localhost:5000/api/emploi-du-temps', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          classe: selectedClasse,
          semaine: new Date().toISOString().split('T')[0],
          seances: seancesAEnvoyer
        })
      });
      
      const data = await res.json();
      
      if (res.ok) {
        setMessage({ type: 'success', text: '✅ Emploi du temps sauvegardé avec succès !' });
        setTimeout(() => setMessage({ type: '', text: '' }), 3000);
      } else {
        setMessage({ type: 'error', text: data.error || 'Erreur lors de la sauvegarde' });
      }
    } catch (error) {
      console.error('Erreur:', error);
      setMessage({ type: 'error', text: 'Erreur lors de la sauvegarde' });
    } finally {
      setSaving(false);
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
          <h1 className="text-xl font-bold">📅 Gestion Emploi du Temps</h1>
          <div className="flex items-center space-x-4">
            <span className="text-sm">{user?.prenom} {user?.nom}</span>
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

        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Créer l'emploi du temps</h2>
          
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Sélectionner une classe</label>
            <select
              value={selectedClasse}
              onChange={(e) => handleClasseChange(e.target.value)}
              className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
            >
              <option value="">-- Choisir une classe --</option>
              {classes.map((classe) => (
                <option key={classe._id} value={classe._id}>
                  {classe.nom} - {classe.filiere} ({classe.niveau})
                </option>
              ))}
            </select>
          </div>

          {selectedClasse && (
            <form onSubmit={handleSubmit}>
              <div className="mb-4 flex justify-between items-center">
                <h3 className="text-lg font-bold text-gray-700">Séances de cours</h3>
                <button
                  type="button"
                  onClick={ajouterSeance}
                  className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
                >
                  + Ajouter une séance
                </button>
              </div>

              {seances.length === 0 ? (
                <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                  <p className="text-gray-500">Aucune séance pour le moment</p>
                  <p className="text-sm text-gray-400 mt-1">Cliquez sur "Ajouter une séance" pour commencer</p>
                </div>
              ) : (
                <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                  {seances.map((seance, index) => (
                    <div key={index} className="border rounded-lg p-4 bg-gray-50 shadow-sm">
                      <div className="flex justify-between items-center mb-3">
                        <h4 className="font-semibold text-gray-700">Séance #{index + 1}</h4>
                        <button
                          type="button"
                          onClick={() => supprimerSeance(index)}
                          className="text-red-500 hover:text-red-700 text-sm"
                        >
                          🗑️ Supprimer
                        </button>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-7 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">Jour</label>
                          <select
                            value={seance.jour}
                            onChange={(e) => updateSeance(index, 'jour', e.target.value)}
                            className="w-full p-2 border rounded text-sm"
                          >
                            {JOURS.map((jour) => (
                              <option key={jour} value={jour}>{jour}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">Heure début</label>
                          <select
                            value={seance.heureDebut}
                            onChange={(e) => updateSeance(index, 'heureDebut', e.target.value)}
                            className="w-full p-2 border rounded text-sm"
                          >
                            {HEURES.map((heure) => (
                              <option key={heure} value={heure}>{heure}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">Heure fin</label>
                          <select
                            value={seance.heureFin}
                            onChange={(e) => updateSeance(index, 'heureFin', e.target.value)}
                            className="w-full p-2 border rounded text-sm"
                          >
                            {HEURES.map((heure) => (
                              <option key={heure} value={heure}>{heure}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">Matière</label>
                          <select
                            value={seance.matiere}
                            onChange={(e) => updateSeance(index, 'matiere', e.target.value)}
                            className="w-full p-2 border rounded text-sm"
                            required
                          >
                            <option value="">-- Choisir --</option>
                            {matieres.map((matiere) => (
                              <option key={matiere._id} value={matiere._id}>{matiere.nom}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">Enseignant</label>
                          <select
                            value={seance.enseignant}
                            onChange={(e) => updateSeance(index, 'enseignant', e.target.value)}
                            className="w-full p-2 border rounded text-sm"
                            required
                          >
                            <option value="">-- Choisir --</option>
                            {enseignants.map((ens) => (
                              <option key={ens._id} value={ens._id}>{ens.prenom} {ens.nom}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">Salle</label>
                          <input
                            type="text"
                            value={seance.salle}
                            onChange={(e) => updateSeance(index, 'salle', e.target.value)}
                            className="w-full p-2 border rounded text-sm"
                            placeholder="Ex: A101"
                            required
                          />
                        </div>
                        <div className="flex items-end">
                          <div className="w-full h-10 text-xs text-green-600 font-medium flex items-center">
                            ✓ Classe: {classes.find(c => c._id === selectedClasse)?.nom || selectedClasse}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {seances.length > 0 && (
                <div className="mt-6">
                  <button
                    type="submit"
                    disabled={saving}
                    className="w-full md:w-auto bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition font-medium"
                  >
                    {saving ? 'Sauvegarde en cours...' : '💾 Sauvegarder l\'emploi du temps'}
                  </button>
                </div>
              )}
            </form>
          )}
        </div>

        <div className="mt-6 bg-blue-50 rounded-lg p-4 border border-blue-200">
          <p className="text-sm text-blue-800">
            📌 <span className="font-semibold">Information :</span> L'emploi du temps sera automatiquement visible par :
          </p>
          <ul className="text-sm text-blue-700 mt-2 ml-4 list-disc">
            <li>Les étudiants de la classe sélectionnée (dans leur espace "Mes cours")</li>
            <li>Les enseignants concernés (dans leur espace "Mon emploi du temps")</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
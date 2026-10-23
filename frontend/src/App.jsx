import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Accueil from './pages/Accueil';
import Login from './pages/Login';

// Admin
import AdminDashboard from './pages/admin/Dashboard';
import AdminCreerCompte from './pages/admin/CreerCompte';
import AdminClasses from './pages/admin/Classes';
import AdminMatieres from './pages/admin/Matieres';
import AdminEmploiDuTemps from './pages/admin/EmploiDuTemps';
import AdminEnseignants from './pages/admin/Enseignants';
import AdminProfil from './pages/admin/Profil';

// Enseignant
import EnseignantDashboard from './pages/enseignant/Dashboard';
import EnseignantAppel from './pages/enseignant/Appel';
import EnseignantHistorique from './pages/enseignant/Historique';
import EnseignantEmploiDuTemps from './pages/enseignant/EmploiDuTemps';
import EnseignantProfil from './pages/enseignant/Profil';
import EnseignantMessages from './pages/enseignant/Messages'; // AJOUTÉ

// Etudiant
import EtudiantDashboard from './pages/etudiant/Dashboard';
import EtudiantAbsences from './pages/etudiant/Absences';
import EtudiantAgenda from './pages/etudiant/Agenda';
import EtudiantNotifications from './pages/etudiant/Notifications';
import EtudiantProfil from './pages/etudiant/Profil';
import EtudiantDiscussions from './pages/etudiant/Discussions'; // AJOUTÉ

const PrivateRoute = ({ children, allowedRoles }) => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const token = localStorage.getItem('token');
  
  if (!token) return <Navigate to="/login" />;
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to={`/dashboard/${user.role}`} />;
  }
  return children;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Page d'accueil */}
        <Route path="/" element={<Accueil />} />
        
        {/* Page de connexion */}
        <Route path="/login" element={<Login />} />
        
        {/* Routes Admin */}
        <Route path="/dashboard/admin" element={
          <PrivateRoute allowedRoles={['admin']}>
            <AdminDashboard />
          </PrivateRoute>
        } />
        <Route path="/dashboard/admin/creer-compte" element={
          <PrivateRoute allowedRoles={['admin']}>
            <AdminCreerCompte />
          </PrivateRoute>
        } />
        <Route path="/dashboard/admin/classes" element={
          <PrivateRoute allowedRoles={['admin']}>
            <AdminClasses />
          </PrivateRoute>
        } />
        <Route path="/dashboard/admin/matieres" element={
          <PrivateRoute allowedRoles={['admin']}>
            <AdminMatieres />
          </PrivateRoute>
        } />
        <Route path="/dashboard/admin/emploi-du-temps" element={
          <PrivateRoute allowedRoles={['admin']}>
            <AdminEmploiDuTemps />
          </PrivateRoute>
        } />
        <Route path="/dashboard/admin/enseignants" element={
          <PrivateRoute allowedRoles={['admin']}>
            <AdminEnseignants />
          </PrivateRoute>
        } />
        <Route path="/dashboard/admin/profil" element={
          <PrivateRoute allowedRoles={['admin']}>
            <AdminProfil />
          </PrivateRoute>
        } />
        
        {/* Routes Enseignant */}
        <Route path="/dashboard/enseignant" element={
          <PrivateRoute allowedRoles={['enseignant']}>
            <EnseignantDashboard />
          </PrivateRoute>
        } />
        <Route path="/dashboard/enseignant/appel" element={
          <PrivateRoute allowedRoles={['enseignant']}>
            <EnseignantAppel />
          </PrivateRoute>
        } />
        <Route path="/dashboard/enseignant/historique" element={
          <PrivateRoute allowedRoles={['enseignant']}>
            <EnseignantHistorique />
          </PrivateRoute>
        } />
        <Route path="/dashboard/enseignant/emploi-du-temps" element={
          <PrivateRoute allowedRoles={['enseignant']}>
            <EnseignantEmploiDuTemps />
          </PrivateRoute>
        } />
        <Route path="/dashboard/enseignant/profil" element={
          <PrivateRoute allowedRoles={['enseignant']}>
            <EnseignantProfil />
          </PrivateRoute>
        } />
        <Route path="/dashboard/enseignant/messages" element={
          <PrivateRoute allowedRoles={['enseignant']}>
            <EnseignantMessages />
          </PrivateRoute>
        } />
        
        {/* Routes Etudiant */}
        <Route path="/dashboard/etudiant" element={
          <PrivateRoute allowedRoles={['etudiant']}>
            <EtudiantDashboard />
          </PrivateRoute>
        } />
        <Route path="/dashboard/etudiant/absences" element={
          <PrivateRoute allowedRoles={['etudiant']}>
            <EtudiantAbsences />
          </PrivateRoute>
        } />
        <Route path="/dashboard/etudiant/agenda" element={
          <PrivateRoute allowedRoles={['etudiant']}>
            <EtudiantAgenda />
          </PrivateRoute>
        } />
        <Route path="/dashboard/etudiant/notifications" element={
          <PrivateRoute allowedRoles={['etudiant']}>
            <EtudiantNotifications />
          </PrivateRoute>
        } />
        <Route path="/dashboard/etudiant/profil" element={
          <PrivateRoute allowedRoles={['etudiant']}>
            <EtudiantProfil />
          </PrivateRoute>
        } />
        <Route path="/dashboard/etudiant/discussions" element={
          <PrivateRoute allowedRoles={['etudiant']}>
            <EtudiantDiscussions />
          </PrivateRoute>
        } />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
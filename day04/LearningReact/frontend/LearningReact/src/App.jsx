import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import Hero from './hero.jsx';
import SetmoreHealth from './SetmoreHealth';
import PatientInformation from './PatientInformation';
import Navbar from './Navbar.jsx';
import AcceptMedicalFees from './AcceptMedicalFees.jsx';
import FeaturesGrid from './FeaturesGrid.jsx';
import Footer from './Footer.jsx';
import ProfilePage from './ProfilePage.jsx';
import SignupPage from './SignupPage.jsx';
import LoginPage from './LoginPage.jsx';
import DoctorApp from './DoctorApp.jsx';
import DoctorSignup from './DoctorSignup.jsx';
import DoctorSearch from './DoctorSearch.jsx'
 

export default function App() {
  const [view, setView] = useState('landing');
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);

  // Persistent Login Check on load
  useEffect(() => {
    const token = localStorage.getItem('token');
    const doctorData = localStorage.getItem('doctorInfo');
    const patientData = localStorage.getItem('patientInfo');

    if (token) {
      if (doctorData) {
        setUser(JSON.parse(doctorData));
        setRole('doctor');
      } else if (patientData) {
        setUser(JSON.parse(patientData));
        setRole('patient');
      }
    }
  }, []);

  // Sync scroll on view change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [view]);

  // Navigation handlers
  const showSignup = () => setView('signup');
  const showLogin = () => setView('login');
  const showHome = () => setView('landing');
  const showDashboard = () => setView('dashboard'); // New handler for doctor dashboard
  const openDoctorSignup = () => setView('doctorSignup');
   const openDoctorSearch = () => setView('doctorSearch');

  // Unified Success Handler
  const handleAuthSuccess = (userData, userRole) => {
    setUser(userData);
    setRole(userRole);
    // If a doctor logs in, send them to the dashboard, otherwise home
    setView(userRole === 'doctor' ? 'dashboard' : 'landing'); 
  };

  const handleLogout = () => {
    localStorage.clear();
    setUser(null);
    setRole(null);
    setView('landing');
  };

  return (
    <Router>
      <Navbar 
        user={user} 
        onLogin={showLogin} 
        onStart={showSignup} 
        onLogOut={handleLogout} 
        onNavigateToProfile={() => setView('profile')} 
        onNavigateHome={showHome}
        onNavigateToDashboard={showDashboard} // Ensure Navbar supports this if needed
      />

      {/* VIEW CONTROLLER */}
      {view === 'signup' && (
        <SignupPage 
          onLogin={showLogin} 
          onCancel={showHome} 
          onDoctorSignup={openDoctorSignup} 
          onSignupSuccess={handleAuthSuccess}
        />
      )}

      {view === 'doctorSignup' && (
        <DoctorSignup 
          onCancel={showSignup} 
          onSignupSuccess={(data) => handleAuthSuccess(data, 'doctor')} 
        />
      )}

      {view === 'login' && (
        <LoginPage 
          onCancel={showHome} 
          onSignup={showSignup}
          onLoginSuccess={handleAuthSuccess} 
        />
      )}

      {view === 'profile' && user && (
        <ProfilePage user={user} role={role} />
      )}

      {/* Doctor Dashboard View */}
      {view === 'dashboard' && role === 'doctor' && (
        <DoctorApp doctorData={user} onLogout={handleLogout} />
      )}

      {/* Marketing Landing View */}
      {view === 'landing' && (
        <>
          <Hero />
          <SetmoreHealth onSignup={user ? showHome : showSignup}/>
          <PatientInformation />
          <AcceptMedicalFees />
          <FeaturesGrid />
          <DoctorSearch/>
         
        </>
      )}
      
      <Footer />
    </Router>
  );
}
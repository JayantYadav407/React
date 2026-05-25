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
import DoctorSearch from './DoctorSearch.jsx';


export default function App() {
  const [view, setView] = useState(() => localStorage.getItem('lastView') || 'landing');
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);


  useEffect(() => {
    const token = localStorage.getItem('token');
    const doctorData = localStorage.getItem('doctorInfo');
    const patientData = localStorage.getItem('patientInfo');


    if (token) {
      if (doctorData) {
        try {
          setUser(JSON.parse(doctorData));
          setRole('doctor');
        } catch (e) { console.error('Failed to parse doctorInfo:', e); }
      } else if (patientData) {
        try {
          setUser(JSON.parse(patientData));
          setRole('patient');
        } catch (e) { console.error('Failed to parse patientInfo:', e); }
      }
    }
  }, []);


  useEffect(() => {
    const safeViews = new Set(['landing', 'signup', 'login', 'profile', 'dashboard', 'doctorSignup', 'doctorSearch']);
    if (safeViews.has(view)) localStorage.setItem('lastView', view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [view]);


  const showSignup = () => setView('signup');
  const showLogin = () => setView('login');
  const showHome = () => setView('landing');
  const showDashboard = () => setView('dashboard');
  const openDoctorSearch = () => setView('doctorSearch');


  const handleAuthSuccess = (userData, userRole) => {
    setUser(userData);
    setRole(userRole);
    setView(userRole === 'doctor' ? 'dashboard' : 'profile');
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
        role={role}
        onLogin={showLogin}
        onStart={showSignup}
        onLogOut={handleLogout}
        onNavigateToProfile={() => setView(role === 'doctor' ? 'dashboard' : 'profile')}
        onNavigateHome={showHome}
        onNavigateToDashboard={showDashboard}
      />


      {view === 'signup' && <SignupPage onLogin={showLogin} onCancel={showHome} onDoctorSignup={() => setView('doctorSignup')} onSignupSuccess={handleAuthSuccess} />}
      {view === 'doctorSignup' && <DoctorSignup onCancel={showSignup} onSignupSuccess={(data) => handleAuthSuccess(data, 'doctor')} />}
      {view === 'login' && <LoginPage onCancel={showHome} onSignup={showSignup} onLoginSuccess={handleAuthSuccess} />}
      
      {/* ✅ Pass onBackToDashboard function to ProfilePage */}
      {view === 'profile' && user && <ProfilePage user={user} role={role} onBackToDashboard={openDoctorSearch} />}
      
      {view === 'dashboard' && role === 'doctor' && <DoctorApp doctorData={user} onLogout={handleLogout} />}
      {view === 'doctorSearch' && <DoctorSearch />}


      {view === 'landing' && (
        <>
          <Hero />
          <SetmoreHealth user={user} onLogin={showLogin} onNavigateSearch={openDoctorSearch} />
          <PatientInformation />
          <AcceptMedicalFees />
          <FeaturesGrid />
        </>
      )}


      <Footer />
    </Router>
  );
}
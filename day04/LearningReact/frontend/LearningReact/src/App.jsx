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

export default function App() {
  const [view, setView] = useState('landing');
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null); // Track if 'doctor' or 'patient'

  // Persistent Login Check
  useEffect(() => {
    const doctorData = localStorage.getItem('doctorInfo');
    const patientData = localStorage.getItem('patientInfo');
    const token = localStorage.getItem('token');

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

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [view]);

  // Navigation handlers
  const showSignup = () => setView('signup');
  const showLogin = () => setView('login');
  const showHome = () => setView('landing');
  const openDoctorSignup = () => setView('doctorSignup'); // Updated handler

  const handleAuthSuccess = (userData, userRole) => {
    setUser(userData);
    setRole(userRole || 'patient');
    setView('landing'); 
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('patientInfo');
    localStorage.removeItem('doctorInfo');
    setUser(null);
    setRole(null);
    setView('landing');
  };

  // 🌟 VIEW: Signup
  if (view === 'signup') {
    return (
      <Router>
        <SignupPage 
          onLogin={showLogin} 
          onCancel={showHome} 
          onDoctorSignup={openDoctorSignup} // FIX: Passing function, not Component
          onSignupSuccess={handleAuthSuccess}
        />
      </Router>
    );
  }

  // 🌟 VIEW: Doctor Signup
  if (view === 'doctorSignup') {
    return (
      <Router>
        <DoctorSignup 
          onCancel={showSignup} 
          onSignupSuccess={(data) => handleAuthSuccess(data, 'doctor')} 
        />
      </Router>
    );
  }
  
  // 🌟 VIEW: Login
  if (view === 'login') {
    return (
      <Router>
        <LoginPage 
          onCancel={showHome} 
          onSignup={showSignup}
          onLoginSuccess={handleAuthSuccess} 
        />
      </Router>
    );
  }

  // 🌟 VIEW: Profile
  if (view === 'profile') {
    return (
      <Router>
        <Navbar 
          user={user} 
          onLogin={showLogin} 
          onStart={showSignup} 
          onLogOut={handleLogout}
          onNavigateToProfile={() => setView('profile')}
          onNavigateHome={showHome}
        />
        <ProfilePage user={user} role={role} />
        <Footer />
      </Router>
    );
  }

  // 🌟 VIEW: Landing / Main Dashboards
  return (
    <Router>
      <Navbar 
        user={user} 
        onLogin={showLogin} 
        onStart={showSignup} 
        onLogOut={handleLogout} 
        onNavigateToProfile={() => setView('profile')} 
        onNavigateHome={showHome}
      />
      
      {/* If logged in as doctor, show Doctor Dashboard. Otherwise show Landing page */}
      {role === 'doctor' ? (
        <DoctorApp doctorData={user} />
      ) : (
        <>
          <Hero />
          <SetmoreHealth onSignup={user ? showHome : showSignup}/>
          <PatientInformation />
          <AcceptMedicalFees />
          <FeaturesGrid />
        </>
      )}
      
      <Footer />
    </Router>
  );
}
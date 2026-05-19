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

export default function App() {
  const [view, setView] = useState('landing');
  // State to track the currently logged-in user
  const [user, setUser] = useState(null);

  // Check for an active session when the app loads (Persistent Login)
  useEffect(() => {
    const savedUser = localStorage.getItem('patientInfo');
    const token = localStorage.getItem('token');
    if (savedUser && token) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  // Smooth scroll handler on view changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [view]);

  // Navigation handlers
  const showSignup = () => setView('signup');
  const showLogin = () => setView('login');
  const showHome = () => setView('landing');

  // Triggered when a user successfully logs in or finishes signing up
  const handleAuthSuccess = (userData) => {
    setUser(userData); // Set the global user state (e.g., { name: 'Jayant Yadav', email: '...' })
    setView('landing'); // Take them back to the main dashboard/landing page
  };

  // Triggered when clicking 'Log Out' in the navbar dropdown
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('patientInfo');
    setUser(null);
    setView('landing');
  };

  // 🌟 Condition 1: Signup View
  if (view === 'signup') {
    return (
      <Router>
        <SignupPage 
          onLogin={showLogin} 
          onCancel={showHome} 
          onSignupSuccess={handleAuthSuccess} // If your signup completes a login automatically
        />
      </Router>
    );
  }
  
  // 🌟 Condition 2: Login View
  if (view === 'login') {
    return (
      <Router>
        <LoginPage 
          onCancel={showHome} 
          onSignup={showSignup}
          onLoginSuccess={handleAuthSuccess} // Catches backend response data on successful password check
        />
      </Router>
    );
  }
  // 🌟 Condition 2.5: Profile View
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
      {/* Swap this placeholder with your actual Profile Page component */}
     {/* { <div className="max-w-[1400px] mx-auto px-6 py-20 text-center">
        <h1 className="text-3xl font-bold text-[#1d2d35]">Welcome to your Profile, {user?.name}</h1>
        <button onClick={showHome} className="mt-4 bg-[#1d2d35] text-white px-4 py-2 rounded">
          Back to Home
        </button>

      </div>} */}
      <ProfilePage/>
      <Footer />
    </Router>
  );
}

  // 🌟 Condition 3: Default Landing Page + Active Session
 // 🌟 Condition 3: Default Landing Page + Active Session
        return (
          <Router>
            {/* Corrected prop names to match Navbar's internal onClick handlers */}
            <Navbar 
              user={user} 
              onLogin={showLogin} 
              onStart={showSignup} 
              onLogOut={handleLogout} // Changed from onLogout to onLogOut
              onNavigateToProfile={() => setView('profile')} // Added this so the profile button works
              onNavigateHome={showHome}
            />
            <Hero />
            <SetmoreHealth onSignup={user ? showHome : showSignup}/>
            <PatientInformation />
            <AcceptMedicalFees />
            <FeaturesGrid />
            <Footer />
          </Router>
        );
}
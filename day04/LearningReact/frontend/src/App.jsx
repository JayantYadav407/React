import React from 'react';
import { useState } from 'react';
import { Star } from 'lucide-react';
import Hero from './hero.jsx';
import SetmoreHealth from './SetmoreHealth'
import PatientInformation from './PatientInformation'
import Navbar from './Navbar.jsx'
import AcceptMedicalFees from './AcceptMedicalFees.jsx'
import FeaturesGrid from './FeaturesGrid.jsx'
import Footer from './Footer.jsx'

import SignupPage from './SignupPage.jsx'
import LoginPage from './LoginPage.jsx';

export default function App() {
  const [view, setView] = useState('landing');
  window.scrollTo(0, 0);
  // Logic to switch views
  const showSignup = () => setView('signup');
  const showLogin = () => setView('login');
  const showHome = () => setView('landing');
  if (view === 'signup') return <SignupPage onLogin={showLogin} onCancel={showHome} />;
  
  if (view === 'login') {
    // You can replace this with a real <LoginPage /> component later
    return (
     <LoginPage onCancel={showHome} onSignup={showSignup}/>
    );
  }

  return (
    <>
      <Navbar onLogin={showLogin}
        onStart={showSignup} />
      <Hero />
      <SetmoreHealth onSignup={showSignup}/>
      <PatientInformation />
      <AcceptMedicalFees />
      <FeaturesGrid />
      <Footer />

    </>
  );
}
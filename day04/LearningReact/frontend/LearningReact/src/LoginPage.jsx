import React, { useState } from 'react';
import { Mail, Lock } from 'lucide-react';

const LoginPage = ({ onCancel, onSignup, onLoginSuccess }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Invalid email or password.');
      }

      // 1. Save token securely
      localStorage.setItem('token', data.token);
      
      // 2. Identify Role and Profile Data (Detecting if Doctor or Patient)
      const userRole = data.role || 'patient'; 
      const p = userRole === 'doctor' ? data.doctor : (data.patient || data.user || {});
      
      const realName = p.fullName || p.name || 'User Account';
      const realEmail = p.email || formData.email;
      const realAvatar = p.avatarUrl || p.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150';

      // 3. Save to Local Storage based on Role
      if (userRole === 'doctor') {
        localStorage.setItem('doctorInfo', JSON.stringify({ 
          ...p, // Save all doctor-specific fields (fees, specialization, etc.)
          name: realName, 
          email: realEmail,
          avatar: realAvatar,
          role: 'doctor'
        }));
      } else {
        localStorage.setItem('patientInfo', JSON.stringify({ 
          name: realName, 
          email: realEmail,
          avatar: realAvatar,
          avatarUrl: realAvatar,
          role: 'patient'
        }));
      }

      // 4. Fire local window notifications so UI refreshes immediately
      window.dispatchEvent(new Event("storage"));
      window.dispatchEvent(new Event("local-storage"));
      
      // 5. Trigger Success Callback to switch dashboards in App.jsx
      if (onLoginSuccess) {
        onLoginSuccess(p, userRole);
      } else {
        onCancel(); 
      }
      
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white font-sans text-[#1d2d35]">
      
      {/* HEADER */}
      <header className="flex justify-between items-center px-6 py-4 md:px-20 max-w-7xl mx-auto">
        <div className="flex items-center gap-1 cursor-pointer" onClick={onCancel}>
          <span className="text-2xl font-bold tracking-tighter">SetMore</span>
          <div className="flex flex-col -space-y-1">
            <div className="w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-b-[5px] border-b-[#00b67a]"></div>
            <div className="w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[5px] border-t-[#00b67a]"></div>
          </div>
        </div>
        <button 
          onClick={onSignup} 
          className="border border-gray-300 px-6 py-2 rounded font-medium text-[#1d2d35] hover:bg-gray-50 transition-colors text-sm"
        >
          Sign Up
        </button>
      </header>

      {/* HERO & LOGIN CARD SECTION */}
      <section className="relative px-6 py-12 md:px-20 md:py-20 max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-12">
        
        {/* Left Side Content */}
        <div className="flex-1 space-y-8">
          <h1 className="text-5xl md:text-6xl font-bold leading-tight tracking-tight">
            Welcome back to <br /> your health hub
          </h1>
          <p className="text-xl text-gray-500 max-w-md leading-relaxed">
            Sign into your portal to see upcoming bookings, track medical histories, and consult with specialists.
          </p>
          <div className="relative pt-4">
            <img 
              src="https://images.unsplash.com/photo-1527613426441-4da17471b66d?auto=format&fit=crop&q=80&w=600" 
              alt="Medical Professionals" 
              className="rounded-2xl shadow-xl w-full max-w-lg object-cover h-[280px]"
            />
          </div>
        </div>

        {/* Right Side Card */}
        <div className="w-full lg:w-[480px] bg-white rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.08)] p-8 md:p-10 border border-gray-100">
          <h3 className="text-xl font-bold text-[#1d2d35] mb-6">Login into SetMore Portal</h3>

          {error && (
            <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 text-sm text-red-700 rounded-r-xl">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <Mail className="absolute left-3.5 top-[18px] h-4 w-4 text-gray-400" />
              <input
                name="email"
                type="email"
                required
                placeholder="Email Address"
                value={formData.email}
                onChange={handleChange}
                className="w-full pl-10 pr-3 py-3.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#00b67a]"
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-3.5 top-[18px] h-4 w-4 text-gray-400" />
              <input
                name="password"
                type="password"
                required
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                className="w-full pl-10 pr-3 py-3.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#00b67a]"
              />
            </div>

            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-[#00b67a] text-white py-3.5 rounded-xl font-semibold text-sm hover:bg-[#009664] transition-colors shadow-sm disabled:opacity-50 mt-4 flex justify-center items-center gap-2"
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Don't have a verified profile yet?
              <button 
                onClick={onSignup} 
                className="ml-1 text-blue-600 hover:underline font-medium focus:outline-none"
              >
                Sign Up
              </button>
            </p>
          </div>
        </div>
      </section>

    </div>
  );
};

export default LoginPage;
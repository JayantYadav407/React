import React, { useState } from 'react';
import { Mail, Lock, User, Phone, MapPin, Activity, Calendar } from 'lucide-react';

const SignupPage = () => {
  const [isSignup, setIsSignup] = useState(true); // Toggle between signup and login view
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    age: '',
    gender: 'Male',
    bloodGroup: 'O+',
    physicalAddress: '',
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

    // Hit the correct endpoint depending on the current active form view
    const endpoint = isSignup ? '/api/auth/signup' : '/api/auth/login';

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Something went wrong');
      }

      // Success! Store the JSON Web Token in LocalStorage for session persistence
      localStorage.setItem('token', data.token);
      localStorage.setItem('patientInfo', JSON.stringify({ name: data.name, email: data.email }));
      
      alert(`${isSignup ? 'Registration' : 'Login'} successful!`);
      // Redirect your user to the dashboard using window.scrollTo(0,0) as planned
      window.scrollTo(0, 0);
      
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
        
        {/* Header/Branding */}
        <div className="text-center">
          <div className="flex justify-center text-[#00b67a] mb-2">
            <Calendar size={40} className="stroke-[2.5]" />
          </div>
          <h2 className="text-3xl font-bold text-[#1d2d35]">
            {isSignup ? 'Create your Account' : 'Welcome Back'}
          </h2>
          <p className="mt-2 text-sm text-gray-500">
            {isSignup ? 'Register to find doctors near you' : 'Sign in to manage your appointments'}
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 text-sm text-red-700 rounded-r-md">
            {error}
          </div>
        )}

        {/* Form */}
        <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
          {isSignup && (
            <>
              {/* Name Field */}
              <div className="relative">
                <User className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                <input
                  name="name"
                  type="text"
                  required
                  placeholder="Full Name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-[#00b67a]"
                />
              </div>

              {/* Phone & Age Row */}
              <div className="grid grid-cols-2 gap-4">
                <div className="relative">
                  <Phone className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                  <input
                    name="phone"
                    type="tel"
                    required
                    placeholder="Phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-[#00b67a]"
                  />
                </div>
                <div className="relative">
                  <input
                    name="age"
                    type="number"
                    required
                    placeholder="Age"
                    value={formData.age}
                    onChange={handleChange}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-[#00b67a]"
                  />
                </div>
              </div>

              {/* Gender & Blood Group Row */}
              <div className="grid grid-cols-2 gap-4">
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl bg-white focus:outline-none focus:border-[#00b67a]"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>

                <select
                  name="bloodGroup"
                  value={formData.bloodGroup}
                  onChange={handleChange}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl bg-white focus:outline-none focus:border-[#00b67a]"
                >
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                </select>
              </div>

              {/* Physical Address Field */}
              <div className="relative">
                <MapPin className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                <input
                  name="physicalAddress"
                  type="text"
                  required
                  placeholder="Your Physical Address (e.g. Civil Lines, Kanpur)"
                  value={formData.physicalAddress}
                  onChange={handleChange}
                  className="w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-[#00b67a]"
                />
              </div>
            </>
          )}

          {/* Core Credentials (Needed for BOTH login and signup) */}
          <div className="relative">
            <Mail className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
            <input
              name="email"
              type="email"
              required
              placeholder="Email Address"
              value={formData.email}
              onChange={handleChange}
              className="w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-[#00b67a]"
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
            <input
              name="password"
              type="password"
              required
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              className="w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-[#00b67a]"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 rounded-xl font-semibold text-white bg-[#00b67a] hover:bg-[#009664] transition duration-200 disabled:opacity-50 mt-4 shadow-sm"
          >
            {loading ? 'Processing...' : isSignup ? 'Sign Up' : 'Log In'}
          </button>
        </form>

        {/* View Switcher toggle link */}
        <div className="text-center mt-6">
          <button
            onClick={() => {
              setIsSignup(!isSignup);
              setError('');
            }}
            className="text-sm font-medium text-[#1d2d35] hover:text-[#00b67a] underline decoration-gray-300 hover:decoration-[#00b67a]"
          >
            {isSignup ? 'Already have an account? Log In' : "Don't have an account yet? Sign Up"}
          </button>
        </div>

      </div>
    </div>
  );
};

export default SignupPage;
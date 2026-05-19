import React, { useState } from 'react';
import { Award, Video, CreditCard, Bell, ChevronRight, Mail, Lock, User, Phone, MapPin, Activity } from 'lucide-react';

const SignupPage = ({ onCancel, onLogin,onDoctorSignup}) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    dob: '', // Age is computed dynamically from this value
    gender: 'Male',
    bloodGroup: 'O+',
    physicalAddress: '',
    chronicIllnesses: '',
    allergies: '',
    pastSurgeries: '',
    currentMedications: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Reusable input change handler
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ 
      ...formData, 
      [name]: name === 'email' ? value.toLowerCase().trim() : value 
    });
  };

  // Utility logic to compute exact integer age on-the-fly from DOB
  const calculateAge = (dobString) => {
    if (!dobString) return 0;
    const today = new Date();
    const birthDate = new Date(dobString);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDifference = today.getMonth() - birthDate.getMonth();
    
    // Adjust if the birthday hasn't occurred yet in the current calendar year
    if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  // Comprehensive Client-side Form Validation
  const validateForm = () => {
    if (!formData.name.trim()) return 'Please enter your full name.';
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) return 'Please provide a valid email address.';

    const phoneDigits = formData.phone.replace(/\D/g, '');
    if (phoneDigits.length < 10) return 'Please provide a valid phone number (minimum 10 digits).';

    if (!formData.dob) return 'Please enter your Date of Birth.';
    
    // Check for logical DOB boundaries
    const computedAge = calculateAge(formData.dob);
    if (computedAge < 0 || computedAge > 120) return 'Please enter a valid Date of Birth.';

    if (formData.password.length < 6) return 'Password must be at least 6 characters long.';
    if (!formData.physicalAddress.trim()) return 'Physical address is required.';

    return null;
  };

  // Form Submission Handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setLoading(true);

    // Compute age directly before assigning it to the payload
    const finalCalculatedAge = calculateAge(formData.dob);

    const payload = {
      name: formData.name,
      email: formData.email.toLowerCase().trim(),
      password: formData.password,
      phone: formData.phone,
      age: finalCalculatedAge, // Backend still gets the calculated integer age structure
      dob: formData.dob,
      gender: formData.gender,
      bloodGroup: formData.bloodGroup,
      physicalAddress: formData.physicalAddress,
      medicalHistory: {
        chronicIllnesses: formData.chronicIllnesses.split(',').map(item => item.trim()).filter(Boolean),
        allergies: formData.allergies.split(',').map(item => item.trim()).filter(Boolean),
        pastSurgeries: formData.pastSurgeries.split(',').map(item => item.trim()).filter(Boolean),
        currentMedications: formData.currentMedications.split(',').map(item => item.trim()).filter(Boolean),
      }
    };

    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Registration processing failed.');
      }

      localStorage.setItem('token', data.token);
      localStorage.setItem('patientInfo', JSON.stringify({ name: data.name || payload.name, email: payload.email }));
      
      // Sync navbar updates cleanly across contexts
      window.dispatchEvent(new Event('local-storage'));
      window.dispatchEvent(new Event('storage'));
      
      alert('Registration successful!');
      window.scrollTo(0, 0);
      onCancel();
      
    } catch (err) {
      setError(err.message);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white font-sans text-[#1d2d35]">
      
      {/* 1. NAVIGATION HEADER */}
      <header className="flex justify-between items-center px-6 py-4 md:px-20 max-w-7xl mx-auto">
      <div className="flex items-center gap-1 cursor-pointer" onClick={onCancel}>
        <span className="text-2xl font-bold tracking-tighter text-[#1d2d35]">heirs</span>
        <div className="flex flex-col -space-y-1">
          <div className="w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-b-[5px] border-b-[#00b67a]"></div>
          <div className="w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[5px] border-t-[#00b67a]"></div>
        </div>
      </div>

      <div className="flex items-center gap-4 md:gap-8">
        {/* Contact Number - Hidden on small screens to save space */}
        <span className="hidden lg:block text-sm font-medium text-gray-400">
          +1 (800) 749-4920
        </span>

        <div className="flex items-center gap-3">
          {/* Patient Login - Standard Style */}
          <button 
            onClick={onLogin} 
            className="text-sm font-semibold text-[#1d2d35] hover:text-[#00b67a] transition-colors px-2 py-2"
          >
            Login
          </button>

          {/* Doctor Login - Outlined/Action Style */}
          <button 
            onClick={onDoctorSignup} // Ensure this handler is passed as a prop
            className="flex items-center gap-2 border-2 border-[#1d2d35] px-5 py-2 rounded-lg font-bold text-[#1d2d35] hover:bg-[#1d2d35] hover:text-white transition-all text-sm"
          >
            <span>For Doctors</span>
          </button>
        </div>
      </div>
    </header>

      {/* 2. HERO & AUTH CARD SECTION */}
      <section className="relative px-6 py-12 md:px-20 md:py-20 max-w-7xl mx-auto flex flex-col lg:flex-row items-start gap-12">
        
        {/* HERO CALLOUTS */}
        <div className="flex-1 space-y-8 lg:sticky lg:top-8">
          <h1 className="text-5xl md:text-6xl font-bold leading-tight tracking-tight">
            Create your own <br /> booking calendar
          </h1>
          <p className="text-xl text-gray-500 max-w-md leading-relaxed">
            Schedule appointments, manage your profile and find top-rated doctors nearby instantly using geospatial coordinates.
          </p>
          
          <div className="relative pt-4">
            <img 
              src="https://images.unsplash.com/photo-1527613426441-4da17471b66d?auto=format&fit=crop&q=80&w=600" 
              alt="Medical Professionals" 
              className="rounded-2xl shadow-xl w-full max-w-lg object-cover h-[280px]"
            />
          </div>
        </div>

        {/* REGISTRATION CARD */}
        <div className="w-full lg:w-[480px] bg-white rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.08)] p-8 md:p-10 border border-gray-100 transition-all duration-300">
          <h3 className="text-xl font-bold text-[#1d2d35] mb-6">
            Get your FREE account
          </h3>

          {error && (
            <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 text-sm text-red-700 rounded-r-xl">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name */}
            <div className="relative">
              <User className="absolute left-3.5 top-3.5 h-4 w-4 text-gray-400" />
              <input
                name="name"
                type="text"
                required
                placeholder="Full Name"
                value={formData.name}
                onChange={handleChange}
                className="w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#00b67a]"
              />
            </div>

            {/* Contact Phone Field */}
            <div className="relative">
              <Phone className="absolute left-3.5 top-3.5 h-4 w-4 text-gray-400" />
              <input
                name="phone"
                type="tel"
                required
                placeholder="Phone (e.g., +91 9876543210)"
                value={formData.phone}
                onChange={handleChange}
                className="w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#00b67a]"
              />
            </div>

            {/* Date of Birth Field (Now Span Full Width) */}
            <div className="relative flex flex-col gap-1">
              <label className="text-xs font-semibold text-gray-400 px-1">Date of Birth</label>
              <input
                name="dob"
                type="date"
                required
                value={formData.dob}
                onChange={handleChange}
                className="w-full px-3 py-3 border border-gray-200 rounded-xl text-sm text-gray-700 focus:outline-none focus:border-[#00b67a] bg-white"
              />
            </div>

            {/* Gender & Medical Blood Group Selection */}
            <div className="grid grid-cols-2 gap-4">
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className="w-full px-3 py-3 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:border-[#00b67a]"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>

              <select
                name="bloodGroup"
                value={formData.bloodGroup}
                onChange={handleChange}
                className="w-full px-3 py-3 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:border-[#00b67a]"
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

            {/* Local Physical Address */}
            <div className="relative">
              <MapPin className="absolute left-3.5 top-3.5 h-4 w-4 text-gray-400" />
              <input
                name="physicalAddress"
                type="text"
                required
                placeholder="Physical Address (e.g., Civil Lines, Kanpur)"
                value={formData.physicalAddress}
                onChange={handleChange}
                className="w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#00b67a]"
              />
            </div>

            {/* --- PAST MEDICAL HISTORY SECTION --- */}
            <div className="pt-2 border-t border-gray-100">
              <div className="flex items-center gap-1.5 mb-3 text-xs font-bold uppercase tracking-wider text-gray-400">
                <Activity size={14} className="text-[#00b67a]" />
                <span>Past Medical History (Optional)</span>
              </div>
              
              <div className="space-y-3">
                <input
                  name="chronicIllnesses"
                  type="text"
                  placeholder="Chronic Illnesses (separated by commas: Diabetes, Asthma)"
                  value={formData.chronicIllnesses}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-[#00b67a]"
                />
                <input
                  name="allergies"
                  type="text"
                  placeholder="Allergies (separated by commas: Penicillin, Peanuts)"
                  value={formData.allergies}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-[#00b67a]"
                />
                <input
                  name="currentMedications"
                  type="text"
                  placeholder="Current Medications (e.g., Metformin, Albuterol)"
                  value={formData.currentMedications}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-[#00b67a]"
                />
                <input
                  name="pastSurgeries"
                  type="text"
                  placeholder="Past Surgeries (e.g., Appendectomy)"
                  value={formData.pastSurgeries}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-[#00b67a]"
                />
              </div>
              <p className="text-[10px] text-gray-400 mt-1.5 px-1">Separate multi-items with a comma (,)</p>
            </div>

            {/* Email & Password Registration Fields */}
            <div className="relative pt-2">
              <div className="border-t border-gray-100 my-2 pt-2"></div>
              <Mail className="absolute left-3.5 top-5 h-4 w-4 text-gray-400" />
              <input
                name="email"
                type="email"
                required
                placeholder="Email Address"
                value={formData.email}
                onChange={handleChange}
                className="w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#00b67a]"
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-gray-400" />
              <input
                name="password"
                type="password"
                required
                placeholder="Password (Min 6 characters)"
                value={formData.password}
                onChange={handleChange}
                className="w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#00b67a]"
              />
            </div>

            {/* Submission CTA */}
            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-[#00b67a] text-white py-3 rounded-xl font-semibold text-sm hover:bg-[#009664] transition-colors shadow-sm disabled:opacity-50 mt-2 flex justify-center items-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span>Processing...</span>
                </>
              ) : 'Create Account'}
            </button>
          </form>

          {/* Form Switch Link Toggle */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Already have an account?
              <button 
                onClick={onLogin} 
                className="ml-1 text-blue-600 hover:underline font-medium focus:outline-none"
              >
                Login
              </button>
            </p>
          </div>

          <p className="mt-8 text-[10px] text-gray-400 text-center leading-relaxed">
            By signing up, you agree to our <span className="underline cursor-pointer">Terms of Use</span> & <span className="underline cursor-pointer">Privacy Policy</span>.
          </p>
        </div>
      </section>

      {/* 3. APP FEATURES GRID */}
      <section className="bg-gray-50 py-24 px-6 md:px-20 border-t border-gray-100">
        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12">
          <div className="space-y-4">
            <Award className="text-[#1d2d35]" size={32} strokeWidth={1.5} />
            <h4 className="text-xl font-bold">Geospatial Search</h4>
            <p className="text-gray-500 text-sm leading-relaxed">
              Find practitioners using real spatial coordinates derived instantly from your provided local address text.
            </p>
          </div>

          <div className="space-y-4">
            <Video className="text-[#1d2d35]" size={32} strokeWidth={1.5} />
            <h4 className="text-xl font-bold">Virtual Consultations</h4>
            <p className="text-gray-500 text-sm leading-relaxed">
              Book digital slots and launch video meetings via Telehealth directly from your dashboard schedule.
            </p>
          </div>

          <div className="space-y-4">
            <CreditCard className="text-[#1d2d35]" size={32} strokeWidth={1.5} />
            <h4 className="text-xl font-bold">Integrated Billing</h4>
            <p className="text-gray-500 text-sm leading-relaxed">
              Process copays or secure slot reservations ahead of face-to-face clinical appointments smoothly.
            </p>
          </div>

          <div className="space-y-4">
            <Bell className="text-[#1d2d35]" size={32} strokeWidth={1.5} />
            <h4 className="text-xl font-bold">Instant Reminders</h4>
            <p className="text-gray-500 text-sm leading-relaxed">
              Eliminate no-shows with automated calendar notifications dispatched dynamically right to your device.
            </p>
          </div>
        </div>
      </section>

      {/* 4. BRAND FOOTER */}
      <footer className="bg-[#1d2d35] text-white py-12 px-12 md:px-20">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-1">
            <span className="text-2xl font-bold tracking-tighter">setmore</span>
            <div className="flex flex-col -space-y-1">
              <div className="w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-b-[5px] border-b-white/80"></div>
              <div className="w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[5px] border-t-white/80"></div>
            </div>
          </div>
          
          <div className="flex items-center gap-2 group cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <span className="text-sm font-medium text-gray-300">Grow your network with <span className="text-white font-bold">Setmore Health</span></span>
            <ChevronRight size={16} className="text-gray-400 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </footer>

    </div>
  );
};

export default SignupPage;
import React, { useState } from 'react';
import { 
  Stethoscope, MapPin, DollarSign, Award, 
  ArrowRight, ArrowLeft, Mail, Lock, User, 
  Globe, AlertCircle, Check 
} from 'lucide-react';

const DoctorSignup = ({ onCancel, onSignupSuccess }) => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    fullName: '', 
    email: '', 
    password: '',
    specialization: '', 
    proficiency: '',
    hospitalName: '', 
    city: '', 
    regularFee: '', 
    emergencyFee: ''
  });

  const nextStep = () => setStep(step + 1);
  const prevStep = () => setStep(step - 1);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // POSTing to your specific Doctor registration endpoint
      const response = await fetch('http://localhost:5000/api/auth/doctor/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, role: 'doctor' }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Registration failed. Please check your details.');
      }

      // 1. Securely store the token
      localStorage.setItem('token', data.token);

      // 2. Store specific Doctor Info (keeping it separate from patientInfo)
      localStorage.setItem('doctorInfo', JSON.stringify({
        ...data.doctor,
        role: 'doctor'
      }));

      // 3. Trigger events for Navbar/App state updates
      window.dispatchEvent(new Event("storage"));
      window.dispatchEvent(new Event("local-storage"));

      // 4. Smooth Transition: Log them in and show DoctorDashboard automatically
      if (onSignupSuccess) {
        onSignupSuccess(data.doctor, 'doctor');
      }
    } catch (err) {
      setError(err.message);
      // If error occurs in step 3, they stay on step 3 to see the message
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 font-sans">
      <div className="max-w-4xl w-full bg-white rounded-[40px] shadow-2xl shadow-slate-200/50 overflow-hidden flex flex-col md:flex-row border border-slate-100">
        
        {/* Left Side: Branding/Info */}
        <div className="md:w-2/5 bg-indigo-600 p-12 text-white flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-8 cursor-pointer" onClick={onCancel}>
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-indigo-600 font-black">H+</div>
              <span className="text-2xl font-black tracking-tight">HEIRS</span>
            </div>
            <h2 className="text-3xl font-bold leading-tight mb-4">Join our network of specialist doctors.</h2>
            <p className="text-indigo-100 text-sm leading-relaxed">Setup your digital clinic in minutes and start managing appointments seamlessly.</p>
          </div>
          
          <div className="space-y-6">
            <Feature icon={<Award size={18}/>} text="Verified Professional Badge" />
            <Feature icon={<DollarSign size={18}/>} text="Set your own consultation fees" />
            <Feature icon={<MapPin size={18}/>} text="List multiple hospital locations" />
          </div>
        </div>

        {/* Right Side: Form */}
        <div className="md:w-3/5 p-12">
          <div className="flex justify-between items-center mb-10">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Step {step} of 3</span>
            <div className="flex gap-1">
              {[1, 2, 3].map(i => (
                <div key={i} className={`h-1 w-6 rounded-full ${step >= i ? 'bg-indigo-600' : 'bg-slate-100'}`} />
              ))}
            </div>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-rose-50 border-l-4 border-rose-500 text-rose-700 text-sm rounded-r-xl">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {step === 1 && (
              <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                <header>
                  <h3 className="text-2xl font-black text-slate-900">Personal Details</h3>
                  <p className="text-slate-500 text-sm">Let's start with your basic account info.</p>
                </header>
                <InputField label="Full Name" name="fullName" icon={<User size={18}/>} placeholder="Dr. Jayant Yadav" value={formData.fullName} onChange={handleChange} required />
                <InputField label="Email Address" name="email" type="email" icon={<Mail size={18}/>} placeholder="jayant@hospital.com" value={formData.email} onChange={handleChange} required />
                <InputField label="Password" name="password" type="password" icon={<Lock size={18}/>} placeholder="••••••••" value={formData.password} onChange={handleChange} required />
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                <header>
                  <h3 className="text-2xl font-black text-slate-900">Medical Proficiency</h3>
                  <p className="text-slate-500 text-sm">Tell us about your expertise and location.</p>
                </header>
                <InputField label="Specialization" name="specialization" icon={<Stethoscope size={18}/>} placeholder="e.g. Cardiologist" value={formData.specialization} onChange={handleChange} required />
                <div className="grid grid-cols-2 gap-4">
                  <InputField label="Hospital Name" name="hospitalName" icon={<MapPin size={18}/>} placeholder="City Medical" value={formData.hospitalName} onChange={handleChange} required />
                  <InputField label="City" name="city" icon={<Globe size={18}/>} placeholder="Kanpur" value={formData.city} onChange={handleChange} required />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-2 ml-1">Short Proficiency Bio</label>
                  <textarea name="proficiency" className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-sm focus:ring-2 focus:ring-indigo-600 focus:bg-white transition-all outline-none" rows="3" placeholder="Describe your field of work..." value={formData.proficiency} onChange={handleChange} required></textarea>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                <header>
                  <h3 className="text-2xl font-black text-slate-900">Set Your Fees</h3>
                  <p className="text-slate-500 text-sm">Define your consultation charges for patients.</p>
                </header>
                <div className="p-6 bg-indigo-50 border border-indigo-100 rounded-[32px] space-y-6">
                  <InputField label="Regular Consultation Fee (₹)" name="regularFee" icon={<DollarSign size={18}/>} placeholder="500" value={formData.regularFee} onChange={handleChange} required />
                  <InputField label="Emergency Charge (₹)" name="emergencyFee" icon={<AlertCircle size={18} className="text-rose-500"/>} placeholder="1500" value={formData.emergencyFee} onChange={handleChange} required />
                </div>
                <p className="text-[10px] text-slate-400 text-center px-4 uppercase font-bold tracking-wider">
                  Secure Professional Registration
                </p>
              </div>
            )}

            <div className="flex gap-4 mt-10">
              {step > 1 && (
                <button type="button" onClick={prevStep} className="flex-1 py-4 rounded-2xl border border-slate-200 text-slate-600 font-bold flex items-center justify-center gap-2 hover:bg-slate-50 transition-all">
                  <ArrowLeft size={18}/> Back
                </button>
              )}
              {step < 3 ? (
                <button type="button" onClick={nextStep} className="flex-[2] py-4 rounded-2xl bg-indigo-600 text-white font-bold flex items-center justify-center gap-2 hover:bg-indigo-700 shadow-xl shadow-indigo-100 transition-all">
                  Next Step <ArrowRight size={18}/>
                </button>
              ) : (
                <button 
                  type="submit" 
                  disabled={loading}
                  className="flex-[2] py-4 rounded-2xl bg-slate-900 text-white font-bold flex items-center justify-center gap-2 hover:bg-black shadow-xl shadow-slate-200 transition-all disabled:opacity-70"
                >
                  {loading ? 'Processing...' : 'Complete Registration'} <Check size={18}/>
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

const Feature = ({ icon, text }) => (
  <div className="flex items-center gap-3">
    <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center">{icon}</div>
    <span className="text-sm font-medium">{text}</span>
  </div>
);

const InputField = ({ label, icon, ...props }) => (
  <div>
    <label className="block text-xs font-bold text-slate-400 uppercase mb-2 ml-1">{label}</label>
    <div className="relative">
      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">{icon}</div>
      <input 
        className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 pl-12 pr-4 text-sm focus:ring-2 focus:ring-indigo-600 focus:bg-white transition-all outline-none" 
        {...props} 
      />
    </div>
  </div>
);

export default DoctorSignup;
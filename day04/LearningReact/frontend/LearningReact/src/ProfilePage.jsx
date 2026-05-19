import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, MapPin, ShieldAlert, Heart, Calendar, FileText, Camera, Save, ArrowLeft } from 'lucide-react';
// Check your lucide-react imports at the top of ProfilePage.jsx
import {Settings,LogOut, Activity // 🌟 ADD THIS LINE
} from 'lucide-react';

const ProfilePage = ({ onBackToDashboard }) => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Main functional state matching backend structures
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    phone: '',
    age: '',
    gender: 'Male',
    bloodGroup: 'O+',
    physicalAddress: '',
    avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150',
    medicalHistory: {
      chronicIllnesses: [],
      allergies: [],
      pastSurgeries: [],
      currentMedications: []
    }
  });

  // String forms for the medical input fields to allow text edits
  const [medStrings, setMedStrings] = useState({
    chronicIllnesses: '',
    allergies: '',
    pastSurgeries: '',
    currentMedications: ''
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/user/profile', {
                            method: 'GET',
                            headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json'
                            }
                        })
                        .then((res) => {
                            // 🌟 STEP 1: Catch server errors BEFORE calling .json()
                            if (!res.ok) {
                            throw new Error(`Server responded with status: ${res.status}`);
                            }
                            return res.json();
                        })
                        .then((data) => {
                            // 🌟 STEP 2: Verify data exists before assigning it to your state
                            if (data) {
                            setProfileData(data);
                            }
                        })
                        .catch((err) => {
                            // 🌟 STEP 3: Handle the error cleanly so the UI doesn't freeze
                            console.error("Profile Fetch Error handled gracefully:", err.message);
                            
                            // SAFE FALLBACK: Use your cached local patient info while fixing the server route
                            const cachedUser = localStorage.getItem('patientInfo');
                            if (cachedUser) {
                            setProfileData(JSON.parse(cachedUser));
                            }
                        });
      const data = await response.json();

      if (!response.ok) throw new Error(data.message || 'Failed to sync profile data.');

      setProfileData(data);
      setMedStrings({
        chronicIllnesses: data.medicalHistory?.chronicIllnesses?.join(', ') || '',
        allergies: data.medicalHistory?.allergies?.join(', ') || '',
        pastSurgeries: data.medicalHistory?.pastSurgeries?.join(', ') || '',
        currentMedications: data.medicalHistory?.currentMedications?.join(', ') || ''
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setProfileData({ ...profileData, [e.target.name]: e.target.value });
  };

  const handleMedChange = (e) => {
    setMedStrings({ ...medStrings, [e.target.name]: e.target.value });
  };

  // Profile Image uploading preview simulator
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const localUrl = URL.createObjectURL(file);
      setProfileData({ ...profileData, avatarUrl: localUrl });
      // Note: For real backend deployment, append 'file' to a FormData object payload
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccessMsg('');

    const structuredPayload = {
      ...profileData,
      medicalHistory: {
        chronicIllnesses: medStrings.chronicIllnesses.split(',').map(s => s.trim()).filter(Boolean),
        allergies: medStrings.allergies.split(',').map(s => s.trim()).filter(Boolean),
        pastSurgeries: medStrings.pastSurgeries.split(',').map(s => s.trim()).filter(Boolean),
        currentMedications: medStrings.currentMedications.split(',').map(s => s.trim()).filter(Boolean)
      }
    };

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/user/profile/update', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(structuredPayload)
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to update changes.');

      // Update local storage in case name changed
      localStorage.setItem('patientInfo', JSON.stringify({ name: data.name, email: data.email }));
      setSuccessMsg('Your profile has been successfully saved!');
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#00b67a]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] text-[#1d2d35] font-sans pb-16">
      {/* Top Banner and Navigation Back */}
      <div className="bg-white border-b border-gray-200 py-4 px-6 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <button onClick={onBackToDashboard} className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-800 transition-colors">
            <ArrowLeft size={16} />
            <span>Back to Dashboard</span>
          </button>
          <h1 className="text-lg font-bold">Manage Account Profile</h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 mt-8">
        {error && <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 text-sm text-red-700 rounded-r-xl">{error}</div>}
        {successMsg && <div className="mb-6 bg-emerald-50 border-l-4 border-emerald-500 p-4 text-sm text-emerald-700 rounded-r-xl">{successMsg}</div>}

        <form onSubmit={handleSaveProfile} className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* LEFT PANEL - PROFILE AVATAR MANAGEMENT */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm flex flex-col items-center h-fit">
            <div className="relative group cursor-pointer">
              <img 
                src={profileData.avatarUrl} 
                alt="Patient Avatar" 
                className="w-32 h-32 rounded-full object-cover border-4 border-gray-50 shadow-inner"
              />
              <label className="absolute bottom-0 right-0 bg-[#00b67a] hover:bg-[#009664] text-white p-2.5 rounded-full cursor-pointer shadow-md transition-colors">
                <Camera size={16} />
                <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
              </label>
            </div>

            <h3 className="font-bold text-lg mt-4 text-center">{profileData.name || 'Patient Guest'}</h3>
            <p className="text-xs text-gray-400 mt-1">{profileData.email}</p>

            <div className="w-full border-t border-gray-100 my-6"></div>
            
            {/* Quick Metrics display */}
            <div className="grid grid-cols-2 gap-4 w-full text-center">
              <div className="bg-slate-50 p-3 rounded-xl">
                <span className="text-[10px] uppercase font-bold text-gray-400 block tracking-wider">Blood Type</span>
                <span className="text-lg font-extrabold text-red-500">{profileData.bloodGroup}</span>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl">
                <span className="text-[10px] uppercase font-bold text-gray-400 block tracking-wider">Age Bracket</span>
                <span className="text-lg font-extrabold text-[#1d2d35]">{profileData.age} Yrs</span>
              </div>
            </div>
          </div>

          {/* RIGHT PANEL - DETAILED FORMS SECTION */}
          <div className="md:col-span-2 space-y-6">
            
            {/* CARD 1: Core Personal Metrics */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6 md:p-8 shadow-sm space-y-4">
              <h2 className="text-base font-bold flex items-center gap-2 border-b border-gray-50 pb-3">
                <User size={18} className="text-[#00b67a]" />
                <span>Personal Particulars</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <input name="name" type="text" required value={profileData.name} onChange={handleInputChange} className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#00b67a]" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Phone Line</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <input name="phone" type="tel" required value={profileData.phone} onChange={handleInputChange} className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#00b67a]" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Age (Years)</label>
                  <input name="age" type="number" required value={profileData.age} onChange={handleInputChange} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#00b67a]" />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Gender Option</label>
                  <select name="gender" value={profileData.gender} onChange={handleInputChange} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:border-[#00b67a]">
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Residential Physical Address</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <input name="physicalAddress" type="text" required value={profileData.physicalAddress} onChange={handleInputChange} className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#00b67a]" />
                </div>
              </div>
            </div>

            {/* CARD 2: Comprehensive Patient Medical Records */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6 md:p-8 shadow-sm space-y-4">
              <h2 className="text-base font-bold flex items-center gap-2 border-b border-gray-50 pb-3">
                <Heart size={18} className="text-red-500" />
                <span>Clinical History & System Parameters</span>
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                    <ShieldAlert size={14} className="text-amber-500" />
                    <span>Allergies Matrix</span>
                  </label>
                  <input name="allergies" type="text" placeholder="e.g., Penicillin, Peanuts" value={medStrings.allergies} onChange={handleMedChange} className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#00b67a]" />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                    <Activity size={14} className="text-blue-500" />
                    <span>Chronic Illness Manifestations</span>
                  </label>
                  <input name="chronicIllnesses" type="text" placeholder="e.g., Asthma, Hypertension" value={medStrings.chronicIllnesses} onChange={handleMedChange} className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#00b67a]" />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                    <FileText size={14} className="text-indigo-500" />
                    <span>Active/Current Medications</span>
                  </label>
                  <input name="currentMedications" type="text" placeholder="e.g., Albuterol, Metformin" value={medStrings.currentMedications} onChange={handleMedChange} className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#00b67a]" />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                    <Calendar size={14} className="text-purple-500" />
                    <span>Past Surgical Procedures</span>
                  </label>
                  <input name="pastSurgeries" type="text" placeholder="e.g., Appendectomy" value={medStrings.pastSurgeries} onChange={handleMedChange} className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#00b67a]" />
                </div>
              </div>
              <p className="text-[11px] text-gray-400 italic">Please make sure arrays are split cleanly by entering items separated by commas (,).</p>
            </div>

            {/* Action CTA Trigger */}
            <button 
              type="submit" 
              disabled={saving}
              className="w-full bg-[#00b67a] text-white py-3.5 rounded-xl font-bold text-sm hover:bg-[#009664] transition-colors flex justify-center items-center gap-2 shadow-md disabled:opacity-60"
            >
              <Save size={16} />
              <span>{saving ? 'Saving System Profiles...' : 'Save Configuration Changes'}</span>
            </button>
            
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfilePage;
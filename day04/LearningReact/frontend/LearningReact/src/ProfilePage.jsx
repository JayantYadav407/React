import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, MapPin, ShieldAlert, Heart, Calendar, FileText, Camera, Save, ArrowLeft, Activity, Clock, HeartPulse } from 'lucide-react';

const ProfilePage = ({ onBackToDashboard }) => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Main functional state matching backend structure
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    phone: '',
    dob: '', 
    gender: 'Male',
    bloodGroup: 'O+',
    physicalAddress: '',
    avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150',
    medicalHistory: {
      chronicIllnesses: [],
      allergies: [],
      pastSurgeries: [],
      currentMedications: []
    },
    appointments: [], 
    symptomHistory: [] 
  });

  // State parameters to track the actual image file object and preview URL cleanly
  const [selectedFile, setSelectedFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');

  // String forms for the medical input fields to allow text edits
  const [medStrings, setMedStrings] = useState({
    chronicIllnesses: '',
    allergies: '',
    pastSurgeries: '',
    currentMedications: ''
  });

  // Helper function to dynamically calculate live Age from DOB string
  const calculateAge = (dateString) => {
    if (!dateString) return '0';
    const today = new Date();
    const birthDate = new Date(dateString);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age >= 0 ? age : '0';
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError('');
      const token = localStorage.getItem('token');
      
      const response = await fetch('http://localhost:5000/api/user/profile', { 
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error(`Server returned status: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Handle potential data wrapping from backend payloads cleanly
      const p = data.patient || data.user || data;

      // Format ISO Date String cleanly down into YYYY-MM-DD layout for calendar field
      let formattedDob = '';
      if (p.dob) {
        const dateObj = new Date(p.dob);
        // Verify structural date correctness before splitting strings
        if (!isNaN(dateObj.getTime())) {
          formattedDob = dateObj.toISOString().split('T')[0];
        }
      }

      setProfileData({ ...p, dob: formattedDob });
      setImagePreview(p.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150');
      
      setMedStrings({
        chronicIllnesses: p.medicalHistory?.chronicIllnesses?.join(', ') || '',
        allergies: p.medicalHistory?.allergies?.join(', ') || '',
        pastSurgeries: p.medicalHistory?.pastSurgeries?.join(', ') || '',
        currentMedications: p.medicalHistory?.currentMedications?.join(', ') || ''
      });

    } catch (err) {
      console.error("Profile API Error handled gracefully:", err.message);
      setError(err.message);
      
      const cachedUser = localStorage.getItem('patientInfo');
      if (cachedUser) {
        const parsedCache = JSON.parse(cachedUser);
        setProfileData(prev => ({ ...prev, ...parsedCache }));
      }
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

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file); 
      setImagePreview(URL.createObjectURL(file)); 
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccessMsg('');

    // Construct standard FormData to allow file binary uploads smoothly
    const formData = new FormData();
    formData.append('phone', profileData.phone || '');
    formData.append('dob', profileData.dob || '');
    formData.append('bloodGroup', profileData.bloodGroup || 'O+');
    formData.append('physicalAddress', profileData.physicalAddress || '');
    
    if (selectedFile) {
      formData.append('avatar', selectedFile);
    }

    formData.append('chronicIllnesses', medStrings.chronicIllnesses || '');
    formData.append('allergies', medStrings.allergies || '');
    formData.append('pastSurgeries', medStrings.pastSurgeries || '');
    formData.append('currentMedications', medStrings.currentMedications || '');

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/user/profile/update', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to update changes.');

      const p = data.patient || data.user || data;

      const existingInfo = JSON.parse(localStorage.getItem('patientInfo') || '{}');
      const savedEmail = p.email || profileData.email || existingInfo.email || '';
      const savedAvatar = p.avatarUrl || imagePreview || existingInfo.avatarUrl || '';

      localStorage.setItem('patientInfo', JSON.stringify({ 
        name: p.name || profileData.name, 
        email: savedEmail,
        avatarUrl: savedAvatar
      }));
      
      window.dispatchEvent(new Event("storage"));
      window.dispatchEvent(new Event("local-storage"));
      
      const updatedDob = p.dob ? new Date(p.dob).toISOString().split('T')[0] : '';
      setProfileData({ ...p, dob: updatedDob, email: savedEmail });
      if (p.avatarUrl) setImagePreview(p.avatarUrl);
      setSelectedFile(null); 

      setSuccessMsg('Your profile records have been successfully synchronized with the database!');
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
          <button type="button" onClick={onBackToDashboard} className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-800 transition-colors">
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
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm flex flex-col items-center h-fit space-y-4">
            <div className="relative group">
              <img 
                src={imagePreview} 
                alt="Patient Avatar" 
                className="w-32 h-32 rounded-full object-cover border-4 border-gray-50 shadow-inner"
              />
              <label className="absolute bottom-0 right-0 bg-[#00b67a] hover:bg-[#009664] text-white p-2.5 rounded-full cursor-pointer shadow-md transition-colors">
                <Camera size={16} />
                <input type="file" name="avatar" accept="image/*" onChange={handleImageUpload} className="hidden" />
              </label>
            </div>

            <div className="text-center">
              <h3 className="font-bold text-lg text-center">{profileData.name || 'Patient Guest'}</h3>
              <p className="text-xs text-gray-400 mt-1">{profileData.email}</p>
            </div>

            <div className="w-full border-t border-gray-100 my-2"></div>
            
            {/* Quick Metrics display */}
            <div className="grid grid-cols-2 gap-4 w-full text-center">
              <div className="bg-slate-50 p-3 rounded-xl">
                <span className="text-[10px] uppercase font-bold text-gray-400 block tracking-wider">Blood Type</span>
                <span className="text-lg font-extrabold text-red-500">{profileData.bloodGroup}</span>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl">
                <span className="text-[10px] uppercase font-bold text-gray-400 block tracking-wider">Calculated Age</span>
                <span className="text-lg font-extrabold text-[#1d2d35]">{calculateAge(profileData.dob)} Yrs</span>
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
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Full Name (Locked)</label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <input 
                      name="name" 
                      type="text" 
                      readOnly 
                      value={profileData.name || ''} 
                      className="w-full pl-9 pr-3 py-2.5 border border-gray-200 bg-gray-50 text-gray-500 rounded-xl text-sm cursor-not-allowed focus:outline-none" 
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Phone Line</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <input name="phone" type="tel" required value={profileData.phone || ''} onChange={handleInputChange} className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#00b67a]" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Date of Birth</label>
                  <div className="relative">
                    <input name="dob" type="date" required value={profileData.dob || ''} onChange={handleInputChange} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#00b67a]" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Gender (Locked)</label>
                  <div className="relative">
                    <input 
                      name="gender" 
                      type="text" 
                      readOnly 
                      value={profileData.gender || 'Male'} 
                      className="w-full px-3 py-2.5 border border-gray-200 bg-gray-50 text-gray-500 rounded-xl text-sm cursor-not-allowed focus:outline-none" 
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Residential Physical Address</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <input name="physicalAddress" type="text" required value={profileData.physicalAddress || ''} onChange={handleInputChange} className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#00b67a]" />
                </div>
              </div>
            </div>

            {/* CARD 2: Patient Medical Records */}
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
                  <input name="allergies" type="text" placeholder="e.g., Penicillin, Peanuts" value={medStrings.allergies || ''} onChange={handleMedChange} className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#00b67a]" />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                    <Activity size={14} className="text-blue-500" />
                    <span>Chronic Illness Manifestations</span>
                  </label>
                  <input name="chronicIllnesses" type="text" placeholder="e.g., Asthma, Hypertension" value={medStrings.chronicIllnesses || ''} onChange={handleMedChange} className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#00b67a]" />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                    <FileText size={14} className="text-indigo-500" />
                    <span>Active/Current Medications</span>
                  </label>
                  <input name="currentMedications" type="text" placeholder="e.g., Albuterol, Metformin" value={medStrings.currentMedications || ''} onChange={handleMedChange} className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#00b67a]" />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                    <Calendar size={14} className="text-purple-500" />
                    <span>Past Surgical Procedures</span>
                  </label>
                  <input name="pastSurgeries" type="text" placeholder="e.g., Appendectomy" value={medStrings.pastSurgeries || ''} onChange={handleMedChange} className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#00b67a]" />
                </div>
              </div>
              <p className="text-[11px] text-gray-400 italic">Please make sure arrays are split cleanly by entering items separated by commas (,).</p>
            </div>

            {/* CARD 3: Scheduled Appointments Panel */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6 md:p-8 shadow-sm space-y-4">
              <h2 className="text-base font-bold flex items-center gap-2 border-b border-gray-50 pb-3">
                <Calendar size={18} className="text-indigo-500" />
                <span>Appointments Schedule History</span>
              </h2>
              {profileData.appointments && profileData.appointments.length > 0 ? (
                <div className="space-y-3">
                  {profileData.appointments.map((appt, idx) => (
                    <div key={idx} className="p-3.5 bg-slate-50 rounded-xl flex justify-between items-center text-sm border border-slate-100">
                      <div>
                        <p className="font-bold text-slate-800">{appt.doctorName || 'General Practitioner'} ({appt.department || 'Triage'})</p>
                        <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1">
                          <Clock size={12} />
                          {appt.appointmentDate ? new Date(appt.appointmentDate).toLocaleString() : 'Date Pending'}
                        </p>
                      </div>
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                        appt.status === 'Completed' ? 'bg-emerald-50 text-emerald-600' : appt.status === 'Cancelled' ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600'
                      }`}>{appt.status || 'Scheduled'}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-gray-400 italic py-2">No upcoming or historical healthcare appointments found on record.</p>
              )}
            </div>

            {/* CARD 4: Symptom Analysis Tracker Logs */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6 md:p-8 shadow-sm space-y-4">
              <h2 className="text-base font-bold flex items-center gap-2 border-b border-gray-50 pb-3">
                <HeartPulse size={18} className="text-[#00b67a]" />
                <span>Tracked Symptom AI History Logs</span>
              </h2>
              {profileData.symptomHistory && profileData.symptomHistory.length > 0 ? (
                <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                  {profileData.symptomHistory.map((sym, idx) => (
                    <div key={idx} className="p-4 bg-slate-50 rounded-xl text-sm border border-slate-100 space-y-2">
                      <div className="flex justify-between items-center text-xs text-gray-400">
                        <span className="font-semibold text-slate-500">Log Entry #{idx + 1}</span>
                        <span>{new Date(sym.timestamp).toLocaleDateString()}</span>
                      </div>
                      <p className="text-xs"><strong className="text-slate-700">Symptoms noted:</strong> "{sym.userSymptomInput}"</p>
                      <div className="p-2 bg-white rounded-lg border border-gray-100 text-[11px] text-gray-500 max-h-24 overflow-y-auto">
                        <strong className="text-[#00b67a] block mb-0.5">AI Engine Output:</strong>
                        {sym.aiAnalysisOutput}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-gray-400 italic py-2">No historical diagnostic symptom check tracking records available.</p>
              )}
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
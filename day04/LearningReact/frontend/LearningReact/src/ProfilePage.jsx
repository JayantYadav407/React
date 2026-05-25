import React, { useState, useEffect } from 'react';
import {
  User, Mail, Phone, MapPin, ShieldAlert, Heart, Calendar, FileText,
  Camera, Save, Search, ArrowLeft, Activity, Clock, Trash2, X,
  CheckCircle, AlertCircle, Stethoscope, Edit2, BadgeInfo, Sparkles
} from 'lucide-react';

const DEFAULT_AVATAR = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150';
const API_BASE_URL = 'http://localhost:5000';

const getAvatarUrl = (url) => {
  if (!url) return DEFAULT_AVATAR;
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('blob:') || url.startsWith('data:')) {
    return url;
  }
  return `${API_BASE_URL}${url.startsWith('/') ? '' : '/'}${url}`;
};

const ProfilePage = ({ onBackToDashboard, onSearchDoctor }) => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [appointmentsFilter, setAppointmentsFilter] = useState('all');
  const [appointmentsFromDB, setAppointmentsFromDB] = useState([]);
  const [isEditing, setIsEditing] = useState(false);

  const cachedPatientInfo = JSON.parse(localStorage.getItem('patientInfo') || '{}');

  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    phone: '',
    dob: '',
    gender: 'Male',
    bloodGroup: 'O+',
    physicalAddress: '',
    avatarUrl: getAvatarUrl(cachedPatientInfo.avatarUrl) || DEFAULT_AVATAR,
    medicalHistory: {
      chronicIllnesses: [],
      allergies: [],
      pastSurgeries: [],
      currentMedications: []
    }
  });

  const [selectedFile, setSelectedFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(getAvatarUrl(cachedPatientInfo.avatarUrl) || DEFAULT_AVATAR);

  const [medStrings, setMedStrings] = useState({
    chronicIllnesses: '',
    allergies: '',
    pastSurgeries: '',
    currentMedications: ''
  });

  const calculateAge = (dateString) => {
    if (!dateString) return '0';
    const today = new Date();
    const birthDate = new Date(dateString);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) age--;
    return age >= 0 ? age : '0';
  };

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError('');
      const token = localStorage.getItem('token');

      const response = await fetch('http://localhost:5000/api/user/profile', {
        method: 'GET',
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        if (response.status === 401) throw new Error('Please login again');
        if (response.status === 404) throw new Error('Profile not found. Please try logging in again.');
        throw new Error(errorData.message || `Server returned status: ${response.status}`);
      }

      const data = await response.json();
      const p = data.patient || data.user || data;

      let formattedDob = '';
      if (p.dob) {
        const dateObj = new Date(p.dob);
        if (!isNaN(dateObj.getTime())) formattedDob = dateObj.toISOString().split('T')[0];
      }

      const normalizedAvatar = getAvatarUrl(p.avatarUrl);

      setProfileData({ ...p, dob: formattedDob, avatarUrl: normalizedAvatar });
      setImagePreview(normalizedAvatar);

      setMedStrings({
        chronicIllnesses: p.medicalHistory?.chronicIllnesses?.join(', ') || '',
        allergies: p.medicalHistory?.allergies?.join(', ') || '',
        pastSurgeries: p.medicalHistory?.pastSurgeries?.join(', ') || '',
        currentMedications: p.medicalHistory?.currentMedications?.join(', ') || ''
      });
    } catch (err) {
      const cachedUser = localStorage.getItem('patientInfo');
      if (cachedUser) {
        const parsedCache = JSON.parse(cachedUser);
        const normalizedAvatar = getAvatarUrl(parsedCache.avatarUrl);
        setProfileData(prev => ({
          ...prev,
          name: parsedCache.name || prev.name,
          email: parsedCache.email || prev.email,
          avatarUrl: normalizedAvatar
        }));
        setImagePreview(normalizedAvatar);
      } else {
        setError('Unable to load profile. Using cached data.');
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchAppointments = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/appointments/user/me', {
        method: 'GET',
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!response.ok) throw new Error('Failed to fetch appointments');

      const data = await response.json();
      const appointmentsWithDoctor = (data.appointments || []).map(appt => ({
        ...appt,
        doctorName: appt.doctorName || appt.doctorId?.name || 'Unknown Doctor',
        specialty: appt.specialty || appt.doctorId?.specialty || 'General',
        department: appt.department || appt.doctorId?.department || 'Triage'
      }));

      setAppointmentsFromDB(appointmentsWithDoctor);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    const handleStorageChange = () => {
      const cachedUser = localStorage.getItem('patientInfo');
      if (cachedUser) {
        const parsedCache = JSON.parse(cachedUser);
        const normalizedAvatar = getAvatarUrl(parsedCache.avatarUrl);
        if (normalizedAvatar) {
          setImagePreview(normalizedAvatar);
          setProfileData(prev => ({ ...prev, avatarUrl: normalizedAvatar }));
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('local-storage', handleStorageChange);
    fetchProfile();
    fetchAppointments();

    const handleRefresh = () => {
      fetchProfile();
      fetchAppointments();
    };

    window.addEventListener('refreshProfile', handleRefresh);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('local-storage', handleStorageChange);
      window.removeEventListener('refreshProfile', handleRefresh);
    };
  }, []);

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

    const formData = new FormData();
    formData.append('phone', profileData.phone || '');
    formData.append('dob', profileData.dob || '');
    formData.append('bloodGroup', profileData.bloodGroup || 'O+');
    formData.append('physicalAddress', profileData.physicalAddress || '');

    if (selectedFile) formData.append('avatar', selectedFile);

    formData.append('chronicIllnesses', medStrings.chronicIllnesses || '');
    formData.append('allergies', medStrings.allergies || '');
    formData.append('pastSurgeries', medStrings.pastSurgeries || '');
    formData.append('currentMedications', medStrings.currentMedications || '');

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/user/profile/update', {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to update changes.');

      const p = data.patient || data.user || data;
      const existingInfo = JSON.parse(localStorage.getItem('patientInfo') || '{}');
      const savedEmail = p.email || profileData.email || existingInfo.email || '';
      const savedAvatar = getAvatarUrl(p.avatarUrl || imagePreview || existingInfo.avatarUrl || '');

      localStorage.setItem('patientInfo', JSON.stringify({
        name: p.name || profileData.name,
        email: savedEmail,
        avatarUrl: savedAvatar
      }));

      window.dispatchEvent(new Event('storage'));
      window.dispatchEvent(new Event('local-storage'));

      const updatedDob = p.dob ? new Date(p.dob).toISOString().split('T')[0] : '';
      setProfileData({ ...p, dob: updatedDob, email: savedEmail, avatarUrl: savedAvatar });
      setImagePreview(savedAvatar);
      setSelectedFile(null);
      setSuccessMsg('Profile updated successfully.');
      setIsEditing(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteProfile = async () => {
    setDeleting(true);
    setError('');
    setShowDeleteModal(false);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/user/profile', {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to delete account.');

      localStorage.removeItem('token');
      localStorage.removeItem('patientInfo');
      setSuccessMsg('Your account has been deleted.');
      setTimeout(() => {
        window.location.href = '/login';
      }, 2000);
    } catch (err) {
      setError(err.message);
    } finally {
      setDeleting(false);
    }
  };

  const handleCancelAppointment = async (appointmentId) => {
    if (!window.confirm('Are you sure you want to cancel this appointment?')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/appointments/user/${appointmentId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to cancel appointment.');

      setSuccessMsg('Appointment cancelled successfully.');
      fetchAppointments();
    } catch (err) {
      setError(err.message || 'Failed to cancel appointment.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 to-slate-50">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#00b67a]"></div>
      </div>
    );
  }

  const filteredAppointments = appointmentsFromDB?.filter(appt => {
    if (appointmentsFilter === 'all') return true;
    if (appointmentsFilter === 'upcoming') return ['Scheduled', 'Pending', 'Accepted'].includes(appt.status);
    if (appointmentsFilter === 'completed') return ['Completed', 'Cancelled', 'Rejected'].includes(appt.status);
    return true;
  }) || [];

  const patientStats = [
    { label: 'Age', value: `${calculateAge(profileData.dob)} yrs`, icon: <BadgeInfo size={16} /> },
    { label: 'Blood Group', value: profileData.bloodGroup || 'N/A', icon: <Heart size={16} /> },
    { label: 'Appointments', value: `${appointmentsFromDB.length}`, icon: <Calendar size={16} /> }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50 text-[#1d2d35] pb-16">
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold flex items-center gap-2 text-red-600">
                <Trash2 size={20} />
                Delete Account
              </h3>
              <button onClick={() => setShowDeleteModal(false)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              This action cannot be undone. All your profile data will be permanently removed.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 px-4 py-2.5 border border-gray-300 rounded-xl text-sm font-bold text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteProfile}
                disabled={deleting}
                className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-xl text-sm font-bold hover:bg-red-700 disabled:opacity-60 flex items-center justify-center gap-2"
              >
                <Trash2 size={16} />
                {deleting ? 'Deleting...' : 'Delete Account'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="sticky top-0 z-20 bg-white/90 backdrop-blur border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onSearchDoctor || onBackToDashboard}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-emerald-200 text-emerald-700 bg-emerald-50 hover:bg-emerald-100 transition-colors text-sm font-semibold"
          >
            <Search size={16} />
            Search Doctor
          </button>

          <div className="text-center">
            <h1 className="text-lg font-bold">My Profile</h1>
            <p className="text-xs text-gray-500">Manage your health details with ease</p>
          </div>

          {!isEditing ? (
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-2 px-4 py-2 bg-[#00b67a] text-white rounded-xl text-sm font-bold hover:bg-[#009664] transition-colors"
            >
              <Edit2 size={16} />
              Edit Profile
            </button>
          ) : (
            <div className="w-[108px]" />
          )}
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 mt-8 space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 p-4 text-sm text-red-700 rounded-2xl flex items-center gap-2">
            <AlertCircle size={18} />
            {error}
          </div>
        )}

        {successMsg && (
          <div className="bg-emerald-50 border border-emerald-200 p-4 text-sm text-emerald-700 rounded-2xl flex items-center gap-2">
            <CheckCircle size={18} />
            {successMsg}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="space-y-6">
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
              <div className="flex flex-col items-center text-center">
                <div className="relative">
                  <img
                    src={imagePreview}
                    alt="Patient Avatar"
                    className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg"
                  />
                  {isEditing && (
                    <label className="absolute bottom-1 right-1 bg-[#00b67a] hover:bg-[#009664] text-white p-2.5 rounded-full cursor-pointer shadow-md">
                      <Camera size={16} />
                      <input type="file" name="avatar" accept="image/*" onChange={handleImageUpload} className="hidden" />
                    </label>
                  )}
                </div>

                <h2 className="mt-4 text-xl font-bold">{profileData.name || 'Patient Guest'}</h2>
                <p className="text-sm text-gray-500">{profileData.email}</p>

                <div className="grid grid-cols-3 gap-3 w-full mt-5">
                  {patientStats.map((item) => (
                    <div key={item.label} className="bg-slate-50 rounded-2xl p-3">
                      <div className="flex justify-center text-emerald-600">{item.icon}</div>
                      <p className="text-[10px] uppercase tracking-wider text-gray-400 mt-1">{item.label}</p>
                      <p className="text-sm font-bold text-gray-800">{item.value}</p>
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => setShowDeleteModal(true)}
                  className="w-full mt-5 px-4 py-3 border border-red-200 rounded-2xl text-sm font-semibold text-red-600 hover:bg-red-50 transition-colors flex items-center justify-center gap-2"
                >
                  <Trash2 size={16} />
                  Delete Account
                </button>
              </div>
            </div>

            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
              <h3 className="text-sm font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Sparkles size={16} className="text-emerald-600" />
                Quick Actions
              </h3>
              <button
                type="button"
                onClick={onSearchDoctor || onBackToDashboard}
                className="w-full px-4 py-3 rounded-2xl bg-emerald-600 text-white font-semibold hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2"
              >
                <Search size={16} />
                Find a Doctor
              </button>
            </div>
          </div>

          <div className="lg:col-span-2 space-y-6">
            <form onSubmit={handleSaveProfile} className="space-y-6">
              <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 md:p-8">
                <h2 className="text-base font-bold flex items-center gap-2 mb-6">
                  <User size={18} className="text-[#00b67a]" />
                  Personal Details
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field label="Full Name" icon={<User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />} readOnly value={profileData.name || ''} />
                  <Field label="Phone Number" icon={<Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />} name="phone" value={profileData.phone || ''} onChange={handleInputChange} disabled={!isEditing} />
                  <Field label="Date of Birth" type="date" name="dob" value={profileData.dob || ''} onChange={handleInputChange} disabled={!isEditing} />
                  <Field label="Gender" readOnly value={profileData.gender || 'Male'} />
                </div>

                <div className="mt-4">
                  <Field label="Address" icon={<MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />} name="physicalAddress" value={profileData.physicalAddress || ''} onChange={handleInputChange} disabled={!isEditing} />
                </div>
              </div>

              <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 md:p-8">
                <h2 className="text-base font-bold flex items-center gap-2 mb-6">
                  <Heart size={18} className="text-red-500" />
                  Medical History
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field label="Allergies" name="allergies" value={medStrings.allergies} onChange={handleMedChange} disabled={!isEditing} placeholder="e.g., Penicillin, Peanuts" />
                  <Field label="Chronic Illnesses" name="chronicIllnesses" value={medStrings.chronicIllnesses} onChange={handleMedChange} disabled={!isEditing} placeholder="e.g., Asthma, Hypertension" />
                  <Field label="Current Medications" name="currentMedications" value={medStrings.currentMedications} onChange={handleMedChange} disabled={!isEditing} placeholder="e.g., Metformin, Albuterol" />
                  <Field label="Past Surgeries" name="pastSurgeries" value={medStrings.pastSurgeries} onChange={handleMedChange} disabled={!isEditing} placeholder="e.g., Appendectomy" />
                </div>
              </div>

              <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 md:p-8">
                <h2 className="text-base font-bold flex items-center gap-2 mb-5">
                  <Calendar size={18} className="text-[#00b67a]" />
                  My Appointments
                </h2>

                <div className="flex gap-2 flex-wrap mb-4">
                  {[
                    { key: 'all', label: 'All', count: appointmentsFromDB.length },
                    { key: 'upcoming', label: 'Upcoming', count: appointmentsFromDB.filter(a => ['Scheduled', 'Pending', 'Accepted'].includes(a.status)).length },
                    { key: 'completed', label: 'Completed', count: appointmentsFromDB.filter(a => ['Completed', 'Cancelled', 'Rejected'].includes(a.status)).length }
                  ].map(({ key, label, count }) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setAppointmentsFilter(key)}
                      className={`px-3 py-1.5 rounded-full text-xs font-bold transition-colors ${
                        appointmentsFilter === key ? 'bg-[#00b67a] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {label} ({count})
                    </button>
                  ))}
                </div>

                {filteredAppointments.length === 0 ? (
                  <div className="text-center py-10 text-gray-400">
                    <Calendar size={42} className="mx-auto mb-3 opacity-30" />
                    <p className="text-sm">No appointments found</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredAppointments.map((appt) => (
                      <div key={appt._id} className="border border-gray-200 rounded-2xl p-4 bg-slate-50">
                        <div className="flex justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Stethoscope size={16} className="text-[#00b67a]" />
                              <h3 className="font-bold text-gray-800 text-sm">
                                {appt.doctorName || 'Unknown Doctor'}
                              </h3>
                            </div>

                            <div className="flex flex-wrap gap-2 mb-2 text-xs">
                              <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-bold">{appt.specialty || 'General'}</span>
                              <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded-full font-bold">{appt.department || 'Triage'}</span>
                            </div>

                            <div className="flex items-center gap-4 text-xs text-gray-600 mt-2">
                              <span className="flex items-center gap-1">
                                <Calendar size={12} />
                                {appt.preferredDate
                                  ? new Intl.DateTimeFormat('en-IN', {
                                      day: '2-digit',
                                      month: 'long',
                                      year: 'numeric'
                                    }).format(new Date(appt.preferredDate))
                                  : 'Date N/A'}
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock size={12} />
                                {appt.preferredTime || 'Time N/A'}
                              </span>
                            </div>

                            {appt.reason && (
                              <p className="text-xs text-gray-500 mt-2 bg-white p-2 rounded-xl">
                                <strong>Reason:</strong> {appt.reason}
                              </p>
                            )}
                          </div>

                          <div className="flex flex-col items-end gap-2">
                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                              appt.status === 'Completed' ? 'bg-emerald-50 text-emerald-600' :
                              appt.status === 'Cancelled' ? 'bg-red-50 text-red-600' :
                              appt.status === 'Rejected' ? 'bg-orange-50 text-orange-600' :
                              appt.status === 'Accepted' || appt.status === 'Scheduled' ? 'bg-blue-50 text-blue-600' :
                              'bg-yellow-50 text-yellow-600'
                            }`}>
                              {appt.status || 'Pending'}
                            </span>

                            {['Pending', 'Accepted', 'Scheduled'].includes(appt.status) && (
                              <button
                                type="button"
                                onClick={() => handleCancelAppointment(appt._id)}
                                className="px-3 py-1 bg-red-500 text-white rounded-lg text-xs font-bold hover:bg-red-600"
                              >
                                Cancel
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {isEditing && (
                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditing(false);
                      fetchProfile();
                    }}
                    className="px-6 py-3 border border-gray-300 rounded-xl text-sm font-bold text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex items-center gap-2 px-8 py-3 bg-[#00b67a] text-white rounded-xl font-bold text-sm hover:bg-[#009664] disabled:opacity-60"
                  >
                    <Save size={18} />
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

const Field = ({
  label,
  icon,
  name,
  value,
  onChange,
  disabled = false,
  readOnly = false,
  type = 'text',
  placeholder = ''
}) => (
  <div>
    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">{label}</label>
    <div className="relative">
      {icon}
      <input
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        readOnly={readOnly}
        disabled={disabled}
        placeholder={placeholder}
        className={`w-full ${icon ? 'pl-9' : 'pl-3'} pr-3 py-2.5 border rounded-xl text-sm focus:outline-none focus:border-[#00b67a] ${
          disabled || readOnly ? 'border-gray-200 bg-gray-50 text-gray-500 cursor-not-allowed' : 'border-gray-200'
        }`}
      />
    </div>
  </div>
);

export default ProfilePage;
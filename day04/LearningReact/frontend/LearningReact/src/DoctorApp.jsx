import React, { useEffect, useMemo, useState } from 'react';
import {
  Calendar,
  Users,
  Briefcase,
  Settings,
  MapPin,
  Clock,
  AlertCircle,
  Check,
  UserCircle2,
  Star,
  Upload,
  Trash2,
  Save,
  Camera
} from 'lucide-react';
import axios from 'axios';
import SchedulePage from './SchedulePage.jsx';

const DoctorApp = ({ doctorData = null, apiBase = 'http://localhost:5000', onLogout }) => {
  const [activeTab, setActiveTab] = useState('calendar');
  const [doctor, setDoctor] = useState(doctorData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [deletingProfile, setDeletingProfile] = useState(false);
  const [appointmentsFilter, setAppointmentsFilter] = useState('all');
  const [editForm, setEditForm] = useState({
    profileImageFile: null,
    specialization: '',
    proficiency: '',
    skills: '',
    experienceYears: '',
    credentials: '',
    hospitalType: 'Private',
    clinicAddress: '',
    clinicCity: '',
    clinicState: '',
    hospitalName: '',
    hospitalAddress: '',
    hospitalCity: '',
    regularFee: '',
    emergencyFee: '',
    conditionsTreated: '',
    services: '',
    availability: '',
    blackoutDates: ''
  });

  const token = localStorage.getItem('token');

  const getImageSrc = (img) => {
    if (!img) return '';
    if (img.startsWith('http')) return img;
    return `${apiBase}${img}`;
  };

  const applyDoctorToForm = (doctorData) => {
    setEditForm({
      profileImageFile: null,
      specialization: doctorData.specialization || '',
      proficiency: doctorData.proficiency || '',
      skills: Array.isArray(doctorData.skills) ? doctorData.skills.join(', ') : '',
      experienceYears: doctorData.experienceYears ?? '',
      credentials: doctorData.credentials || '',
      hospitalType: doctorData.hospitalType || 'Private',
      clinicAddress: doctorData.clinicLocation?.address || '',
      clinicCity: doctorData.clinicLocation?.city || '',
      clinicState: doctorData.clinicLocation?.state || '',
      hospitalName: doctorData.hospital?.name || '',
      hospitalAddress: doctorData.hospital?.address || '',
      hospitalCity: doctorData.hospital?.city || '',
      regularFee: doctorData.fees?.regular ?? '',
      emergencyFee: doctorData.fees?.emergency ?? '',
      conditionsTreated: Array.isArray(doctorData.conditionsTreated) ? doctorData.conditionsTreated.join(', ') : '',
      services: Array.isArray(doctorData.services) ? doctorData.services.join(', ') : '',
      availability: Array.isArray(doctorData.availability) ? JSON.stringify(doctorData.availability) : '[]',
      blackoutDates: Array.isArray(doctorData.blackoutDates) ? doctorData.blackoutDates.join(', ') : ''
    });
  };

  const loadDoctor = async () => {
    try {
      setLoading(true);
      setError('');

      if (!token) throw new Error('Login again');

      const [doctorRes, appointmentRes] = await Promise.all([
        fetch(`${apiBase}/api/doctors/me`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        fetch(`${apiBase}/api/appointments/doctor/me`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      if (!doctorRes.ok) throw new Error('Failed to load doctor profile');
      if (!appointmentRes.ok) throw new Error('Failed to load appointments');

      const doctorData = await doctorRes.json();
      const appointmentData = await appointmentRes.json();

      const mergedDoctor = {
        ...doctorData,
        appointments: appointmentData.appointments || [],
        appointmentSummary: appointmentData.summary || {
          total: 0,
          pending: 0,
          accepted: 0,
          completed: 0,
          rejected: 0,
          cancelled: 0
        }
      };

      setDoctor(mergedDoctor);
      applyDoctorToForm(doctorData);
    } catch (err) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDoctor();
  }, [apiBase]);

  const refreshDoctor = async () => {
    await loadDoctor();
  };

  const safeDoctor = useMemo(() => doctor || {
    fullName: 'Doctor',
    email: '',
    specialization: 'Specialist',
    proficiency: '',
    skills: [],
    profileImage: '',
    credentials: '',
    experienceYears: 0,
    clinicLocation: { address: '', city: '', state: '' },
    hospital: { name: '', address: '', city: '' },
    fees: { regular: 0, emergency: 0 },
    availability: [],
    appointments: [],
    appointmentSummary: { total: 0, pending: 0, accepted: 0, completed: 0, rejected: 0, cancelled: 0 },
    ratings: [],
    ratingSummary: { average: 0, count: 0 },
    patientHistory: [],
    blackoutDates: [],
    hospitalType: 'Private',
    conditionsTreated: [],
    services: []
  }, [doctor]);

  const avatarText = useMemo(() => {
    const parts = (safeDoctor.fullName || 'D').split(' ').filter(Boolean);
    return parts.slice(0, 2).map(p => p[0]?.toUpperCase()).join('');
  }, [safeDoctor.fullName]);

  const appointments = Array.isArray(safeDoctor.appointments) ? safeDoctor.appointments : [];
  const ratings = Array.isArray(safeDoctor.ratings) ? safeDoctor.ratings : [];
  const patientHistory = Array.isArray(safeDoctor.patientHistory) ? safeDoctor.patientHistory : [];

  const normalizedAvailability = useMemo(() => {
    const result = {};
    if (Array.isArray(safeDoctor.availability)) {
      safeDoctor.availability.forEach(item => {
        if (!item?.day) return;
        result[item.day] = (item.slots || []).map(slot =>
          slot?.startTime && slot?.endTime ? `${slot.startTime} - ${slot.endTime}` : 'Slot'
        );
      });
    }
    return result;
  }, [safeDoctor.availability]);

  const buildChangedFormData = (original, current, file) => {
    const fd = new FormData();
    if (file) fd.append('profileImageFile', file);

    Object.keys(current).forEach((key) => {
      const value = current[key];
      const originalValue = original[key];
      if (value === undefined || value === null || value === '') return;

      if (typeof value === 'object') {
        const currentStr = JSON.stringify(value);
        const originalStr = JSON.stringify(originalValue || {});
        if (currentStr !== originalStr) fd.append(key, currentStr);
        return;
      }

      if (String(value) !== String(originalValue ?? '')) fd.append(key, value);
    });

    return fd;
  };

  const handleEditChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'profileImageFile') {
      setEditForm(prev => ({ ...prev, profileImageFile: files?.[0] || null }));
      return;
    }
    setEditForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    try {
      setSavingProfile(true);
      setError('');

      const original = {
        specialization: safeDoctor.specialization || '',
        proficiency: safeDoctor.proficiency || '',
        skills: Array.isArray(safeDoctor.skills) ? safeDoctor.skills.join(', ') : '',
        experienceYears: safeDoctor.experienceYears ?? '',
        credentials: safeDoctor.credentials || '',
        hospitalType: safeDoctor.hospitalType || 'Private',
        clinicLocation: {
          address: safeDoctor.clinicLocation?.address || '',
          city: safeDoctor.clinicLocation?.city || '',
          state: safeDoctor.clinicLocation?.state || ''
        },
        hospital: {
          name: safeDoctor.hospital?.name || '',
          address: safeDoctor.hospital?.address || '',
          city: safeDoctor.hospital?.city || ''
        },
        fees: {
          regular: safeDoctor.fees?.regular ?? '',
          emergency: safeDoctor.fees?.emergency ?? ''
        },
        conditionsTreated: Array.isArray(safeDoctor.conditionsTreated) ? safeDoctor.conditionsTreated.join(', ') : '',
        services: Array.isArray(safeDoctor.services) ? safeDoctor.services.join(', ') : '',
        availability: Array.isArray(safeDoctor.availability) ? JSON.stringify(safeDoctor.availability) : '[]',
        blackoutDates: Array.isArray(safeDoctor.blackoutDates) ? safeDoctor.blackoutDates.join(', ') : ''
      };

      const current = {
        specialization: editForm.specialization,
        proficiency: editForm.proficiency,
        skills: editForm.skills,
        experienceYears: editForm.experienceYears,
        credentials: editForm.credentials,
        hospitalType: editForm.hospitalType,
        clinicLocation: {
          address: editForm.clinicAddress,
          city: editForm.clinicCity,
          state: editForm.clinicState
        },
        hospital: {
          name: editForm.hospitalName,
          address: editForm.hospitalAddress,
          city: editForm.hospitalCity
        },
        fees: {
          regular: editForm.regularFee,
          emergency: editForm.emergencyFee
        },
        conditionsTreated: editForm.conditionsTreated,
        services: editForm.services,
        availability: editForm.availability,
        blackoutDates: editForm.blackoutDates
      };

      const formData = buildChangedFormData(original, current, editForm.profileImageFile);

      if ([...formData.keys()].length === 0) {
        setError('No changes detected');
        return;
      }

      const res = await axios.put(`${apiBase}/api/doctors/me`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      setDoctor(prev => ({ ...prev, ...res.data.doctor }));
      setShowSettings(false);
      await loadDoctor();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleDeleteProfile = async () => {
    const confirmDelete = window.confirm('Delete doctor profile permanently?');
    if (!confirmDelete) return;

    try {
      setDeletingProfile(true);
      await axios.delete(`${apiBase}/api/doctors/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (onLogout) onLogout();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete profile');
    } finally {
      setDeletingProfile(false);
    }
  };

  const updateAppointmentStatus = async (appointmentId, status) => {
    try {
      setError('');
      await axios.patch(
        `${apiBase}/api/appointments/${appointmentId}/status`,
        { status },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      await loadDoctor();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update appointment status');
    }
  };

  const summary = safeDoctor.appointmentSummary || {
    total: 0,
    pending: 0,
    accepted: 0,
    completed: 0,
    rejected: 0,
    cancelled: 0
  };

  const filteredAppointments = useMemo(() => {
    return appointments.filter(appt => {
      if (appointmentsFilter === 'all') return true;
      if (appointmentsFilter === 'pending') return appt.status === 'Pending';
      if (appointmentsFilter === 'accepted') return appt.status === 'Accepted';
      if (appointmentsFilter === 'completed') return appt.status === 'Completed';
      if (appointmentsFilter === 'rejected') return appt.status === 'Rejected';
      if (appointmentsFilter === 'cancelled') return appt.status === 'Cancelled';
      return true;
    });
  }, [appointments, appointmentsFilter]);

  return (
    <div className="flex h-screen bg-[#F8FAFC] font-sans text-slate-800">
      <aside className="w-72 bg-white border-r border-slate-200 flex flex-col p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-12 px-2">
          <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white font-bold shadow-lg shadow-indigo-100 text-xl">
            H+
          </div>
          <div>
            <span className="text-xl font-black tracking-tight text-indigo-900 block leading-none">SetMore</span>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Doctor Portal</span>
          </div>
        </div>

        <nav className="flex-1 space-y-2">
          <SidebarItem icon={<Calendar size={20} />} label="Appointments" active={activeTab === 'calendar'} onClick={() => setActiveTab('calendar')} />
          <SidebarItem icon={<Clock size={20} />} label="Manage Schedule" active={activeTab === 'schedule'} onClick={() => setActiveTab('schedule')} />
          <SidebarItem icon={<Users size={20} />} label="Patient History" active={activeTab === 'patients'} onClick={() => setActiveTab('patients')} />
          <SidebarItem icon={<Briefcase size={20} />} label="Public Profile" active={activeTab === 'profile'} onClick={() => setActiveTab('profile')} />
          <SidebarItem icon={<Settings size={20} />} label="Settings" active={activeTab === 'settings'} onClick={() => { setShowSettings(true); setActiveTab('settings'); }} />
        </nav>

        <div className="mt-auto pt-6 border-t border-slate-100">
          <button onClick={() => { setShowSettings(true); setActiveTab('settings'); }} className="w-full flex items-center gap-3 p-2 bg-slate-50 rounded-2xl border border-slate-100 hover:bg-slate-100 transition">
            <div className="w-10 h-10 rounded-full overflow-hidden bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold">
              {safeDoctor.profileImage ? (
                <img src={getImageSrc(safeDoctor.profileImage)} alt={safeDoctor.fullName} className="w-full h-full object-cover" />
              ) : (
                avatarText || 'D'
              )}
            </div>
            <div className="flex flex-col overflow-hidden text-left">
              <span className="text-sm font-bold truncate">{safeDoctor.fullName}</span>
              <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" /> Online
              </span>
            </div>
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-20 bg-white border-b border-slate-100 flex items-center justify-between px-10">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-black text-slate-900 capitalize tracking-tight">{activeTab}</h1>
            {activeTab === 'calendar' && (
              <span className="bg-rose-100 text-rose-700 text-[10px] font-black px-2 py-1 rounded-md uppercase">Live Ops</span>
            )}
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2 bg-amber-50 border border-amber-100 px-4 py-2 rounded-xl">
              <AlertCircle size={16} className="text-amber-600" />
              <span className="text-xs font-bold text-amber-800">{summary.pending} Pending Requests</span>
            </div>

            <button onClick={() => { setShowSettings(true); setActiveTab('settings'); }} className="flex items-center gap-3 bg-slate-50 border border-slate-200 px-4 py-2 rounded-2xl hover:bg-slate-100 transition">
              <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center overflow-hidden">
                {safeDoctor.profileImage ? (
                  <img src={getImageSrc(safeDoctor.profileImage)} alt="Doctor avatar" className="w-full h-full object-cover" />
                ) : (
                  <UserCircle2 size={20} className="text-indigo-700" />
                )}
              </div>
              <div className="leading-tight">
                <p className="text-sm font-bold text-slate-900 truncate max-w-40">{safeDoctor.fullName}</p>
                <p className="text-[10px] text-slate-500 truncate max-w-40">{safeDoctor.specialization}</p>
              </div>
            </button>

            <button onClick={onLogout} className="bg-slate-900 text-white px-5 py-3 rounded-2xl text-sm font-bold hover:bg-slate-800 transition-all">
              Logout
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-10">
          {loading ? (
            <div className="text-slate-500">Loading doctor profile...</div>
          ) : error ? (
            <div className="text-rose-600">Error: {error}</div>
          ) : (
            <>
              <DoctorSummaryStrip doctor={safeDoctor} summary={summary} ratings={ratings} />

              {showSettings && activeTab === 'settings' && (
                <div className="mt-8 bg-white rounded-[32px] border border-slate-100 p-8 shadow-sm">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-black text-slate-900">Doctor Settings</h2>
                    <button onClick={() => setShowSettings(false)} className="text-sm font-bold text-slate-500">Close</button>
                  </div>

                  <form onSubmit={handleSaveProfile} className="grid gap-4 md:grid-cols-2">
                    <div className="md:col-span-2 flex items-center gap-4">
                      <div className="w-24 h-24 rounded-full bg-slate-100 overflow-hidden flex items-center justify-center text-3xl">
                        {editForm.profileImageFile ? (
                          <img src={URL.createObjectURL(editForm.profileImageFile)} alt="Preview" className="w-full h-full object-cover" />
                        ) : safeDoctor.profileImage ? (
                          <img src={getImageSrc(safeDoctor.profileImage)} alt="Current" className="w-full h-full object-cover" />
                        ) : (
                          <Camera className="text-slate-400" />
                        )}
                      </div>

                      <div className="flex-1">
                        <label className="flex items-center gap-2 cursor-pointer bg-indigo-600 text-white px-4 py-3 rounded-xl font-bold w-fit">
                          <Upload size={16} /> Upload Profile Picture
                          <input type="file" name="profileImageFile" accept="image/*" onChange={handleEditChange} className="hidden" />
                        </label>
                        <p className="text-xs text-slate-500 mt-2">Upload a new profile picture to show it in the navbar.</p>
                      </div>
                    </div>

                    <input value={safeDoctor.fullName} disabled className="border rounded-lg px-4 py-3 bg-slate-50" />
                    <input value={safeDoctor.email} disabled className="border rounded-lg px-4 py-3 bg-slate-50" />

                    <input name="specialization" value={editForm.specialization} onChange={handleEditChange} placeholder="Specialization" className="border rounded-lg px-4 py-3" />
                    <input name="experienceYears" type="number" value={editForm.experienceYears} onChange={handleEditChange} placeholder="Experience years" className="border rounded-lg px-4 py-3" />

                    <textarea name="proficiency" value={editForm.proficiency} onChange={handleEditChange} placeholder="About proficiency" className="border rounded-lg px-4 py-3 md:col-span-2" rows="3" />
                    <input name="skills" value={editForm.skills} onChange={handleEditChange} placeholder="Skills, comma separated" className="border rounded-lg px-4 py-3 md:col-span-2" />
                    <input name="credentials" value={editForm.credentials} onChange={handleEditChange} placeholder="Credentials" className="border rounded-lg px-4 py-3 md:col-span-2" />

                    <select name="hospitalType" value={editForm.hospitalType} onChange={handleEditChange} className="border rounded-lg px-4 py-3">
                      <option value="Private">Private</option>
                      <option value="Government">Government</option>
                    </select>

                    <input name="regularFee" type="number" value={editForm.regularFee} onChange={handleEditChange} placeholder="Regular fee" className="border rounded-lg px-4 py-3" />
                    <input name="emergencyFee" type="number" value={editForm.emergencyFee} onChange={handleEditChange} placeholder="Emergency fee" className="border rounded-lg px-4 py-3" />

                    <input name="clinicAddress" value={editForm.clinicAddress} onChange={handleEditChange} placeholder="Clinic address" className="border rounded-lg px-4 py-3" />
                    <input name="clinicCity" value={editForm.clinicCity} onChange={handleEditChange} placeholder="Clinic city" className="border rounded-lg px-4 py-3" />
                    <input name="clinicState" value={editForm.clinicState} onChange={handleEditChange} placeholder="Clinic state" className="border rounded-lg px-4 py-3" />
                    <input name="hospitalName" value={editForm.hospitalName} onChange={handleEditChange} placeholder="Hospital name" className="border rounded-lg px-4 py-3" />
                    <input name="hospitalAddress" value={editForm.hospitalAddress} onChange={handleEditChange} placeholder="Hospital address" className="border rounded-lg px-4 py-3" />
                    <input name="hospitalCity" value={editForm.hospitalCity} onChange={handleEditChange} placeholder="Hospital city" className="border rounded-lg px-4 py-3" />

                    <textarea name="conditionsTreated" value={editForm.conditionsTreated} onChange={handleEditChange} placeholder="Conditions treated, comma separated" className="border rounded-lg px-4 py-3 md:col-span-2" rows="3" />
                    <textarea name="services" value={editForm.services} onChange={handleEditChange} placeholder="Services, comma separated" className="border rounded-lg px-4 py-3 md:col-span-2" rows="3" />
                    <textarea name="availability" value={editForm.availability} onChange={handleEditChange} placeholder='Availability JSON' className="border rounded-lg px-4 py-3 md:col-span-2" rows="4" />
                    <input name="blackoutDates" value={editForm.blackoutDates} onChange={handleEditChange} placeholder="Blackout dates, comma separated" className="border rounded-lg px-4 py-3 md:col-span-2" />

                    <div className="md:col-span-2 flex flex-wrap gap-3">
                      <button type="submit" disabled={savingProfile} className="bg-emerald-600 text-white px-5 py-3 rounded-xl font-bold inline-flex items-center gap-2 disabled:opacity-60">
                        <Save size={16} /> {savingProfile ? 'Saving...' : 'Save Profile'}
                      </button>

                      <button type="button" onClick={handleDeleteProfile} disabled={deletingProfile} className="bg-rose-600 text-white px-5 py-3 rounded-xl font-bold inline-flex items-center gap-2 disabled:opacity-60">
                        <Trash2 size={16} /> {deletingProfile ? 'Deleting...' : 'Delete Profile'}
                      </button>

                      <button type="button" onClick={refreshDoctor} className="bg-slate-900 text-white px-5 py-3 rounded-xl font-bold">
                        Refresh Data
                      </button>
                    </div>
                  </form>
                </div>
              )}

              <div className="mt-8">
                {activeTab === 'calendar' && (
                  <CalendarView
                    appointments={filteredAppointments}
                    allAppointments={appointments}
                    filter={appointmentsFilter}
                    setFilter={setAppointmentsFilter}
                    summary={summary}
                    onAccept={(id) => updateAppointmentStatus(id, 'Accepted')}
                    onComplete={(id) => updateAppointmentStatus(id, 'Completed')}
                    onReject={(id) => updateAppointmentStatus(id, 'Rejected')}
                  />
                )}
                {activeTab === 'profile' && <ProfilePanel doctor={safeDoctor} avatarText={avatarText} />}
                {activeTab === 'schedule' && (
                  <SchedulePage
                    apiBase={apiBase}
                    token={token}
                    doctor={safeDoctor}
                    onUpdated={(updatedDoctor) => {
                      setDoctor(prev => ({ ...prev, ...updatedDoctor }));
                      loadDoctor();
                    }}
                  />
                )}
                {activeTab === 'patients' && <PatientLog appointments={appointments} patientHistory={patientHistory} />}
                {activeTab === 'settings' && !showSettings && <SettingsPanel doctor={safeDoctor} />}
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
};

const SidebarItem = ({ icon, label, active, onClick }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all ${
      active ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-100' : 'text-slate-500 hover:bg-slate-50'
    }`}
  >
    {icon}
    <span className="text-sm font-bold tracking-tight">{label}</span>
  </button>
);

const DoctorSummaryStrip = ({ summary }) => (
  <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
    <SummaryCard title="Total" value={summary.total} />
    <SummaryCard title="Pending" value={summary.pending} />
    <SummaryCard title="Accepted" value={summary.accepted} />
    <SummaryCard title="Completed" value={summary.completed} />
    <SummaryCard title="Rejected" value={summary.rejected} />
    <SummaryCard title="Cancelled" value={summary.cancelled} />
  </div>
);

const SummaryCard = ({ title, value }) => (
  <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-sm">
    <p className="text-[10px] uppercase tracking-widest font-black text-slate-400">{title}</p>
    <div className="mt-2 text-3xl font-black text-slate-900">{value}</div>
  </div>
);

const CalendarView = ({ appointments, allAppointments, filter, setFilter, summary, onAccept, onComplete, onReject }) => (
  <div>
    <div className="flex gap-2 mb-6 flex-wrap">
      {[
        { key: 'all', label: 'All', count: allAppointments.length },
        { key: 'pending', label: 'Pending', count: summary.pending },
        { key: 'accepted', label: 'Accepted', count: summary.accepted },
        { key: 'completed', label: 'Completed', count: summary.completed },
        { key: 'rejected', label: 'Rejected', count: summary.rejected },
        { key: 'cancelled', label: 'Cancelled', count: summary.cancelled }
      ].map(({ key, label, count }) => (
        <button
          key={key}
          onClick={() => setFilter(key)}
          className={`px-4 py-2 rounded-lg text-xs font-bold capitalize transition-colors ${
            filter === key
              ? 'bg-indigo-600 text-white'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          {label} ({count})
        </button>
      ))}
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
      {appointments.length === 0 ? (
        <div className="col-span-full p-6 rounded-3xl bg-white border border-slate-100 text-slate-400">
          No appointments found.
        </div>
      ) : (
        appointments.map((apt) => (
          <div
            key={apt._id}
            className={`p-6 rounded-3xl border-2 shadow-sm ${
              apt.status === 'Rejected'
                ? 'bg-red-50 border-red-100'
                : apt.status === 'Completed'
                ? 'bg-emerald-50 border-emerald-100'
                : apt.status === 'Cancelled'
                ? 'bg-orange-50 border-orange-100'
                : apt.status === 'Accepted'
                ? 'bg-blue-50 border-blue-100'
                : 'bg-white border-slate-50'
            }`}
          >
            <div className="flex justify-between items-start mb-4">
              <div className="p-2 rounded-lg bg-slate-100 text-slate-600">
                <Clock size={16} />
              </div>
              <span
                className={`text-[10px] font-black uppercase px-2 py-1 rounded-md ${
                  apt.status === 'Rejected'
                    ? 'bg-red-600 text-white'
                    : apt.status === 'Completed'
                    ? 'bg-emerald-600 text-white'
                    : apt.status === 'Cancelled'
                    ? 'bg-orange-600 text-white'
                    : apt.status === 'Accepted'
                    ? 'bg-blue-600 text-white'
                    : 'bg-yellow-100 text-yellow-700'
                }`}
              >
                {apt.status || 'Pending'}
              </span>
            </div>

            <h4 className="font-black text-slate-900 text-lg">{apt.patientName || 'Unknown Patient'}</h4>
            <p className="text-xs text-slate-500 font-medium mb-1">
              {apt.preferredTime} — {apt.preferredDate ? new Date(apt.preferredDate).toLocaleDateString() : ''}
            </p>
            <p className="text-xs text-slate-400 font-bold mb-4">
              {apt.patientPhone || 'N/A'}
            </p>

            <p className="pt-4 border-t border-slate-100 text-sm text-slate-600 mb-4">
              {apt.reason || 'No reason provided'}
            </p>

            <div className="flex gap-2 flex-wrap">
              {apt.status === 'Pending' && (
                <>
                  <button onClick={() => onAccept?.(apt._id)} className="bg-blue-600 text-white px-3 py-2 rounded-lg text-xs font-bold hover:bg-blue-700 transition-colors flex-1">
                    ✓ Accept
                  </button>
                  <button onClick={() => onReject?.(apt._id)} className="bg-red-600 text-white px-3 py-2 rounded-lg text-xs font-bold hover:bg-red-700 transition-colors flex-1">
                    ✗ Reject
                  </button>
                </>
              )}

              {apt.status === 'Accepted' && (
                <>
                  <button onClick={() => onComplete?.(apt._id)} className="bg-emerald-600 text-white px-3 py-2 rounded-lg text-xs font-bold hover:bg-emerald-700 transition-colors flex-1">
                    ✓ Mark Completed
                  </button>
                  <button onClick={() => onReject?.(apt._id)} className="bg-red-600 text-white px-3 py-2 rounded-lg text-xs font-bold hover:bg-red-700 transition-colors flex-1">
                    ✗ Reject
                  </button>
                </>
              )}

              {apt.status === 'Completed' && (
                <div className="w-full text-center py-2 bg-emerald-100 text-emerald-700 rounded-lg text-xs font-bold">✓ Completed</div>
              )}
              {apt.status === 'Rejected' && (
                <div className="w-full text-center py-2 bg-red-100 text-red-700 rounded-lg text-xs font-bold">✗ Rejected</div>
              )}
              {apt.status === 'Cancelled' && (
                <div className="w-full text-center py-2 bg-orange-100 text-orange-700 rounded-lg text-xs font-bold">✗ Cancelled by Patient</div>
              )}
            </div>
          </div>
        ))
      )}
    </div>
  </div>
);

const ProfilePanel = ({ doctor, avatarText }) => (
  <div className="max-w-5xl space-y-8">
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-6">
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
          <div className="flex gap-8 items-start">
            <div className="w-40 h-40 bg-slate-100 rounded-3xl flex items-center justify-center text-5xl overflow-hidden">
              {doctor.profileImage ? (
                <img src={doctor.profileImage.startsWith('http') ? doctor.profileImage : `http://localhost:5000${doctor.profileImage}`} alt={doctor.fullName} className="w-full h-full object-cover" />
              ) : (
                avatarText
              )}
            </div>
            <div className="flex-1">
              <h2 className="text-4xl font-black text-slate-900 mb-1">{doctor.fullName || 'Doctor Name'}</h2>
              <p className="text-indigo-600 font-bold text-lg mb-4">{doctor.specialization || 'Specialization'}</p>
              <div className="flex flex-wrap gap-3">
                {(doctor.skills || []).map((s) => (
                  <span key={s} className="bg-slate-100 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-600">
                    {s}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
          <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-4">Professional Proficiency</h3>
          <p className="text-lg text-slate-600 leading-relaxed font-medium italic">{doctor.proficiency || ''}</p>
          <p className="mt-4 text-sm text-slate-500 leading-relaxed">{doctor.credentials || ''}</p>
          <div className="mt-4 text-sm text-slate-500">
            <span className="font-bold text-slate-700">Experience:</span> {doctor.experienceYears || 0} years
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <div className="bg-indigo-900 text-white p-8 rounded-3xl shadow-2xl shadow-indigo-200">
          <h3 className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-6">Fee Structure</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center bg-white/10 p-4 rounded-2xl">
              <span className="text-sm font-bold">Regular</span>
              <span className="text-2xl font-black">₹{doctor.fees?.regular || 0}</span>
            </div>
            <div className="flex justify-between items-center bg-rose-500 p-4 rounded-2xl">
              <span className="text-sm font-bold text-white">Emergency</span>
              <span className="text-2xl font-black">₹{doctor.fees?.emergency || 0}</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">Hospital Location</h3>
          <div className="flex gap-4">
            <div className="bg-slate-50 p-3 rounded-2xl text-indigo-600">
              <MapPin />
            </div>
            <div>
              <p className="font-bold text-slate-900">{doctor.hospital?.name || 'Clinic'}</p>
              <p className="text-sm text-slate-500">{doctor.hospital?.address || doctor.clinicLocation?.address || ''}</p>
              <p className="text-sm text-slate-500">{doctor.hospital?.city || doctor.clinicLocation?.city || ''}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

const PatientLog = ({ appointments }) => (
  <div className="space-y-8">
    <div className="bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-sm">
      <table className="w-full text-left">
        <thead className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b">
          <tr>
            <th className="px-8 py-5">Patient Details</th>
            <th className="px-8 py-5">Visit Type</th>
            <th className="px-8 py-5">Diagnostic Notes</th>
            <th className="px-8 py-5">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50">
          {appointments.length === 0 ? (
            <tr>
              <td colSpan="4" className="px-8 py-6 text-slate-400">No patient records yet.</td>
            </tr>
          ) : (
            appointments.map((apt) => (
              <tr key={apt._id} className="group hover:bg-slate-50/50 transition-colors">
                <td className="px-8 py-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center font-bold text-slate-400">P</div>
                    <div className="flex flex-col">
                      <span className="text-sm font-black text-slate-900">{apt.patientName || 'Unknown Patient'}</span>
                      <span className="text-[10px] text-slate-400 font-bold">
                        {apt.preferredDate ? new Date(apt.preferredDate).toLocaleDateString() : ''}
                      </span>
                    </div>
                  </div>
                </td>
                <td className="px-8 py-6 text-sm font-medium text-slate-600">Regular</td>
                <td className="px-8 py-6 text-sm font-medium text-slate-600">{apt.reason || 'NA'}</td>
                <td className="px-8 py-6 text-sm font-semibold text-slate-700">{apt.status}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  </div>
);

const SettingsPanel = ({ doctor }) => (
  <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm max-w-3xl space-y-6">
    <h2 className="text-2xl font-black">Settings</h2>
    <div className="space-y-2 text-slate-600">
      <p><span className="font-bold">Email:</span> {doctor.email || 'NA'}</p>
      <p><span className="font-bold">Hospital Type:</span> {doctor.hospitalType || 'NA'}</p>
      <p><span className="font-bold">Profile Image:</span> {doctor.profileImage ? 'Uploaded' : 'Not uploaded'}</p>
      <p><span className="font-bold">Experience:</span> {doctor.experienceYears || 0} years</p>
      <p><span className="font-bold">About:</span> {doctor.proficiency || 'NA'}</p>
    </div>
  </div>
);

export default DoctorApp;
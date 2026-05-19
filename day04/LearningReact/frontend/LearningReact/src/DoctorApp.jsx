import React, { useState } from 'react';
import { 
  Calendar, Users, Briefcase, Settings, Plus, 
  MapPin, Award, Clock, History, AlertCircle, 
  ShieldCheck, DollarSign, Globe, Check
} from 'lucide-react';

const DoctorApp = () => {
  const [activeTab, setActiveTab] = useState('calendar');
  
  // This state would ideally come from your MongoDB via a UseEffect hook
  const [doctor, setDoctor] = useState({
    fullName: "Dr. Jayant Yadav",
    specialization: "Cardiologist",
    proficiency: "Expert in robotic-assisted heart surgery and preventive cardiology.",
    details: "MBBS, MD (Gold Medalist). Over 10+ years of experience in clinical excellence.",
    hospital: {
      name: "City Heart Institute",
      address: "12/450, Civil Lines",
      city: "Kanpur"
    },
    fees: { regular: 800, emergency: 2500 },
    skills: ["Surgery", "Diagnostics", "Echocardiography"],
    rating: 4.9,
    // Weekly Slot Logic: Doctors toggle these to let patients book
    availability: {
      Monday: ["09:00 AM", "10:00 AM", "11:00 AM", "04:00 PM"],
      Tuesday: ["09:00 AM", "11:00 AM", "02:00 PM"],
      Wednesday: ["10:00 AM", "01:00 PM", "05:00 PM"]
    },
    appointments: [
      { id: '1', name: 'Hemant Yadav', date: '2026-05-19', time: '12:15 AM', status: 'present', symptoms: 'Chest Pain', type: 'Emergency' },
      { id: '2', name: 'Amrita Singh', date: '2026-05-18', time: '10:00 AM', status: 'past', symptoms: 'Fever', type: 'Regular' }
    ]
  });

  return (
    <div className="flex h-screen bg-[#F8FAFC] font-sans text-slate-800">
      {/* Sidebar */}
      <aside className="w-72 bg-white border-r border-slate-200 flex flex-col p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-12 px-2">
          <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white font-bold shadow-lg shadow-indigo-100 text-xl">
            H+
          </div>
          <div>
            <span className="text-xl font-black tracking-tight text-indigo-900 block leading-none">HEIRS</span>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Doctor Portal</span>
          </div>
        </div>

        <nav className="flex-1 space-y-2">
          <SidebarItem icon={<Calendar size={20}/>} label="Appointments" active={activeTab === 'calendar'} onClick={() => setActiveTab('calendar')} />
          <SidebarItem icon={<Clock size={20}/>} label="Manage Schedule" active={activeTab === 'schedule'} onClick={() => setActiveTab('schedule')} />
          <SidebarItem icon={<Users size={20}/>} label="Patient History" active={activeTab === 'patients'} onClick={() => setActiveTab('patients')} />
          <SidebarItem icon={<Briefcase size={20}/>} label="Public Profile" active={activeTab === 'profile'} onClick={() => setActiveTab('profile')} />
          <SidebarItem icon={<Settings size={20}/>} label="Settings" active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} />
        </nav>

        <div className="mt-auto pt-6 border-t border-slate-100">
          <div className="flex items-center gap-3 p-2 bg-slate-50 rounded-2xl border border-slate-100">
             <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-700 font-bold">JY</div>
             <div className="flex flex-col overflow-hidden">
                <span className="text-sm font-bold truncate">{doctor.fullName}</span>
                <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
                  <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div> Online
                </span>
             </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-20 bg-white border-b border-slate-100 flex items-center justify-between px-10">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-black text-slate-900 capitalize tracking-tight">{activeTab}</h1>
            {activeTab === 'calendar' && (
              <span className="bg-rose-100 text-rose-700 text-[10px] font-black px-2 py-1 rounded-md uppercase">Live Ops</span>
            )}
          </div>
          
          <div className="flex items-center gap-4">
             <div className="flex items-center gap-2 bg-amber-50 border border-amber-100 px-4 py-2 rounded-xl">
                <AlertCircle size={16} className="text-amber-600" />
                <span className="text-xs font-bold text-amber-800">1 Urgent Request</span>
             </div>
             <button className="bg-indigo-600 text-white px-6 py-3 rounded-2xl text-sm font-bold flex items-center gap-2 hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100">
                <Plus size={18} /> Add Appointment
             </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-10">
          {activeTab === 'calendar' && <CalendarView appointments={doctor.appointments} />}
          {activeTab === 'profile' && <ProfilePanel doctor={doctor} />}
          {activeTab === 'schedule' && <SchedulerPanel availability={doctor.availability} />}
          {activeTab === 'patients' && <PatientLog appointments={doctor.appointments} />}
        </div>
      </main>
    </div>
  );
};

// --- Profile Component (Fees, Hospital, Proficiency) ---
const ProfilePanel = ({ doctor }) => (
  <div className="max-w-5xl space-y-8 animate-in fade-in duration-500">
    <div className="grid grid-cols-3 gap-8">
      <div className="col-span-2 space-y-6">
        <div className="bg-white p-8 rounded-[32px] shadow-sm border border-slate-100">
          <div className="flex gap-8 items-start">
            <div className="w-40 h-40 bg-slate-100 rounded-3xl flex items-center justify-center text-5xl">👨‍⚕️</div>
            <div className="flex-1">
              <h2 className="text-4xl font-black text-slate-900 mb-1">{doctor.fullName}</h2>
              <p className="text-indigo-600 font-bold text-lg mb-4">{doctor.specialization}</p>
              <div className="flex flex-wrap gap-3">
                {doctor.skills.map(s => <span key={s} className="bg-slate-100 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-600">#{s}</span>)}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white p-8 rounded-[32px] shadow-sm border border-slate-100">
           <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-4">Professional Proficiency</h3>
           <p className="text-lg text-slate-600 leading-relaxed font-medium italic">"{doctor.proficiency}"</p>
           <p className="mt-4 text-sm text-slate-500 leading-relaxed">{doctor.details}</p>
        </div>
      </div>

      <div className="space-y-6">
        <div className="bg-indigo-900 text-white p-8 rounded-[32px] shadow-2xl shadow-indigo-200">
          <h3 className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-6">Fee Structure</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center bg-white/10 p-4 rounded-2xl">
              <span className="text-sm font-bold">Regular</span>
              <span className="text-2xl font-black">₹{doctor.fees.regular}</span>
            </div>
            <div className="flex justify-between items-center bg-rose-500 p-4 rounded-2xl">
              <span className="text-sm font-bold text-white">Emergency</span>
              <span className="text-2xl font-black">₹{doctor.fees.emergency}</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-8 rounded-[32px] shadow-sm border border-slate-100">
           <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">Hospital Location</h3>
           <div className="flex gap-4">
              <div className="bg-slate-50 p-3 rounded-2xl text-indigo-600"><MapPin /></div>
              <div>
                <p className="font-bold text-slate-900">{doctor.hospital.name}</p>
                <p className="text-sm text-slate-500">{doctor.hospital.address}, {doctor.hospital.city}</p>
              </div>
           </div>
        </div>
      </div>
    </div>
  </div>
);

// --- Scheduler Component (Doctors set their free time) ---
const SchedulerPanel = ({ availability }) => (
  <div className="bg-white p-10 rounded-[32px] border border-slate-100 shadow-sm max-w-4xl">
    <div className="flex justify-between items-end mb-10">
      <div>
        <h2 className="text-2xl font-black mb-2">Weekly Schedule Builder</h2>
        <p className="text-slate-500 text-sm">Open slots here to allow patients to book appointments online.</p>
      </div>
      <button className="bg-emerald-600 text-white px-5 py-2 rounded-xl text-xs font-bold uppercase tracking-widest">Save Changes</button>
    </div>

    <div className="space-y-8">
      {Object.entries(availability).map(([day, slots]) => (
        <div key={day} className="flex items-start gap-8 group">
          <div className="w-32 py-2">
            <span className="font-black text-slate-400 group-hover:text-indigo-600 transition-colors">{day}</span>
          </div>
          <div className="flex-1 flex flex-wrap gap-3">
            {slots.map(time => (
              <div key={time} className="px-4 py-2 bg-indigo-50 border border-indigo-100 rounded-xl text-xs font-bold text-indigo-700 flex items-center gap-2">
                {time} <Check size={12} className="cursor-pointer hover:text-red-500" />
              </div>
            ))}
            <button className="px-4 py-2 border-2 border-dashed border-slate-200 rounded-xl text-[10px] font-black text-slate-400 hover:border-indigo-400 hover:text-indigo-400 transition-all">
              + ADD SLOT
            </button>
          </div>
        </div>
      ))}
    </div>
  </div>
);

const CalendarView = ({ appointments }) => (
  <div className="grid grid-cols-4 gap-6">
    {appointments.map(apt => (
      <div key={apt.id} className={`p-6 rounded-[32px] border-2 shadow-sm ${apt.type === 'Emergency' ? 'bg-rose-50 border-rose-100' : 'bg-white border-slate-50'}`}>
        <div className="flex justify-between items-start mb-4">
          <div className={`p-2 rounded-lg ${apt.type === 'Emergency' ? 'bg-rose-200 text-rose-700' : 'bg-slate-100 text-slate-600'}`}>
            <Clock size={16} />
          </div>
          <span className={`text-[10px] font-black uppercase px-2 py-1 rounded-md ${apt.type === 'Emergency' ? 'bg-rose-600 text-white' : 'bg-indigo-100 text-indigo-700'}`}>
            {apt.type}
          </span>
        </div>
        <h4 className="font-black text-slate-900 text-lg">{apt.name}</h4>
        <p className="text-xs text-slate-500 font-medium mb-4">{apt.time} • {apt.date}</p>
        <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
           <span className="text-[10px] font-bold text-slate-400 uppercase">Reason: {apt.symptoms}</span>
           <button className="text-indigo-600 font-black text-xs hover:underline uppercase">View Chart</button>
        </div>
      </div>
    ))}
  </div>
);

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

const PatientLog = ({ appointments }) => (
  <div className="bg-white rounded-[32px] border border-slate-100 overflow-hidden shadow-sm">
    <table className="w-full text-left">
      <thead className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b">
        <tr>
          <th className="px-8 py-5">Patient Details</th>
          <th className="px-8 py-5">Visit Type</th>
          <th className="px-8 py-5">Diagnostic Notes</th>
          <th className="px-8 py-5">Outcome/Cure</th>
          <th className="px-8 py-5 text-right">Actions</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-50">
        {appointments.map((apt, i) => (
          <tr key={i} className="group hover:bg-slate-50/50 transition-colors">
            <td className="px-8 py-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center font-bold text-slate-400">P</div>
                <div className="flex flex-col">
                  <span className="text-sm font-black text-slate-900">{apt.name}</span>
                  <span className="text-[10px] text-slate-400 font-bold">{apt.date}</span>
                </div>
              </div>
            </td>
            <td className="px-8 py-6">
               <span className={`px-2 py-1 rounded-md text-[10px] font-black uppercase ${apt.type === 'Emergency' ? 'text-rose-600 bg-rose-50' : 'text-indigo-600 bg-indigo-50'}`}>
                {apt.type}
               </span>
            </td>
            <td className="px-8 py-6 text-sm font-medium text-slate-600">{apt.symptoms}</td>
            <td className="px-8 py-6 text-sm text-slate-400 italic">Dr. {apt.cure}</td>
            <td className="px-8 py-6 text-right">
              <button className="text-slate-300 group-hover:text-indigo-600 transition-colors uppercase text-[10px] font-black tracking-widest">Update Records</button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

export default DoctorApp;
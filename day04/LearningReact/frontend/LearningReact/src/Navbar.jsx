import React, { useState, useEffect } from 'react';
import { 
  Users, Briefcase, Award, BookOpen, GraduationCap, Newspaper,
  Video, Square, Calendar, CreditCard, Layout, MousePointerClick, 
  Monitor, School, ChevronDown, Globe, MessageSquare, User, LogOut, Settings
} from 'lucide-react';

const Navbar = ({ onLogin, onStart, user: initialUser, onLogOut, onNavigateToProfile, onNavigateHome, role: initialRole, onNavigateToDashboard }) => {
  const [activeMenu, setActiveMenu] = useState(null);
  const [profileDropdown, setProfileDropdown] = useState(false);

  const [currentUser, setCurrentUser] = useState(() => {
    const doctorCached = localStorage.getItem('doctorInfo');
    const patientCached = localStorage.getItem('patientInfo');

    if (doctorCached) {
      try {
        return JSON.parse(doctorCached);
      } catch (e) {
        console.error("Error parsing doctor cache:", e);
      }
    }

    if (patientCached) {
      try {
        return JSON.parse(patientCached);
      } catch (e) {
        console.error("Error parsing patient cache:", e);
      }
    }

    return initialUser || null;
  });

  const [currentRole, setCurrentRole] = useState(() => {
    const doctorCached = localStorage.getItem('doctorInfo');
    const patientCached = localStorage.getItem('patientInfo');

    if (doctorCached) return 'doctor';
    if (patientCached) return 'patient';
    return initialRole || null;
  });

  const syncUserSession = () => {
    const doctorCached = localStorage.getItem('doctorInfo');
    const patientCached = localStorage.getItem('patientInfo');

    if (doctorCached) {
      try {
        setCurrentUser(JSON.parse(doctorCached));
        setCurrentRole('doctor');
        return;
      } catch (e) {
        console.error("Failed parsing doctor session info context.", e);
      }
    }

    if (patientCached) {
      try {
        setCurrentUser(JSON.parse(patientCached));
        setCurrentRole('patient');
        return;
      } catch (e) {
        console.error("Failed parsing patient session info context.", e);
      }
    }

    setCurrentUser(null);
    setCurrentRole(null);
  };

  useEffect(() => {
    syncUserSession();
    window.addEventListener('storage', syncUserSession);
    window.addEventListener('local-storage', syncUserSession);

    return () => {
      window.removeEventListener('storage', syncUserSession);
      window.removeEventListener('local-storage', syncUserSession);
    };
  }, [initialUser, initialRole]);

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const handleInternalLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('doctorInfo');
    localStorage.removeItem('patientInfo');
    setCurrentUser(null);
    setCurrentRole(null);
    if (onLogOut) onLogOut();
  };

  const currentAvatar =
    currentUser?.profileImage ||
    currentUser?.avatarUrl ||
    currentUser?.avatar ||
    null;

  const displayName =
    currentUser?.fullName ||
    currentUser?.name ||
    'User';

  const displayEmail =
    currentUser?.email ||
    '';

  const displaySubtitle =
    currentRole === 'doctor'
      ? (currentUser?.specialization || 'Doctor')
      : (currentRole === 'patient'
          ? 'Patient'
          : '');

  return (
    <nav 
      className="sticky top-0 z-50 w-full bg-white border-b border-gray-100" 
      onMouseLeave={() => {
        setActiveMenu(null);
        setProfileDropdown(false);
      }}
    >
      <div className="flex items-center justify-between px-6 py-5 md:px-16 lg:px-24 max-w-[1400px] mx-auto">
        
        <div className="flex items-center space-x-12">
          <div className="flex items-center gap-1 cursor-pointer" onClick={onNavigateHome}>
            <span className="text-[26px] font-bold tracking-tighter text-[#1d2d35]">setmore</span>
            <div className="flex flex-col -space-y-1">
              <div className="w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-b-[6px] border-b-green-600"></div>
              <div className="w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-t-[6px] border-t-green-600"></div>
            </div>
          </div>

          <div className="hidden lg:flex items-center space-x-7 text-[15px] font-medium text-gray-500">
            <div className="relative py-2" onMouseEnter={() => setActiveMenu('learn')}>
              <button className="hover:text-black flex items-center gap-1">Learn <ChevronDown size={14}/></button>
              {activeMenu === 'learn' && (
                <div className="absolute top-full left-[-50px] w-[650px] bg-white shadow-2xl rounded-xl border border-gray-100 p-8 mt-2">
                  <div className="grid grid-cols-3 gap-8 text-left">
                    <div className="space-y-4">
                      <h4 className="text-xl font-bold text-[#1d2d35]">Mission</h4>
                      <p className="text-gray-500 text-xs leading-relaxed">Our mission is to help you deliver your magic.</p>
                      <button className="border border-[#1d2d35] px-4 py-2 rounded text-xs font-bold">Book a demo</button>
                    </div>
                    <div className="space-y-4">
                      <h4 className="text-xl font-bold text-[#1d2d35]">Community</h4>
                      <ul className="space-y-3 text-sm">
                        <li className="flex items-center gap-2"><Users size={16}/> Customers</li>
                        <li className="flex items-center gap-2"><Briefcase size={16}/> Partners</li>
                        <li className="flex items-center gap-2"><Award size={16}/> Badges</li>
                      </ul>
                    </div>
                    <div className="space-y-4">
                      <h4 className="text-xl font-bold text-[#1d2d35]">Resources</h4>
                      <ul className="space-y-3 text-sm">
                        <li className="flex items-center gap-2"><BookOpen size={16}/> By Industry</li>
                        <li className="flex items-center gap-2"><GraduationCap size={16}/> Guides</li>
                        <li className="flex items-center gap-2"><Newspaper size={16}/> Blog</li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="relative py-2" onMouseEnter={() => setActiveMenu('integrations')}>
              <button className="hover:text-black flex items-center gap-1">Integrations <ChevronDown size={14}/></button>
              {activeMenu === 'integrations' && (
                <div className="absolute top-full left-[-150px] w-[500px] bg-white shadow-2xl rounded-xl border border-gray-100 p-8 mt-2">
                  <div className="grid grid-cols-2 gap-y-6 gap-x-4 mb-6">
                    <div className="flex items-center gap-3 text-sm text-gray-600"><MessageSquare className="text-blue-600" size={18}/> Facebook</div>
                    <div className="flex items-center gap-3 text-sm text-gray-600"><Video className="text-blue-500" size={18}/> Zoom</div>
                    <div className="flex items-center gap-3 text-sm text-gray-600"><Square className="text-black" size={18}/> Square</div>
                    <div className="flex items-center gap-3 text-sm text-gray-600"><Calendar className="text-red-500" size={18}/> Google Calendar</div>
                    <div className="flex items-center gap-3 text-sm text-gray-600"><Globe className="text-blue-800" size={18}/> Wordpress</div>
                    <div className="flex items-center gap-3 text-sm text-gray-600"><CreditCard className="text-indigo-600" size={18}/> Stripe</div>
                  </div>
                </div>
              )}
            </div>

            <div className="relative py-2" onMouseEnter={() => setActiveMenu('features')}>
              <button className="hover:text-black flex items-center gap-1">Features <ChevronDown size={14}/></button>
              {activeMenu === 'features' && (
                <div className="absolute top-full left-[-200px] w-[500px] bg-white shadow-2xl rounded-xl border border-gray-100 p-8 mt-2">
                  <div className="grid grid-cols-2 gap-6 mb-4">
                    <div className="flex items-center gap-3 text-sm text-gray-600"><Layout size={18}/> Booking Page</div>
                    <div className="flex items-center gap-3 text-sm text-gray-600"><Calendar size={18}/> Calendar</div>
                    <div className="flex items-center gap-3 text-sm text-gray-600"><MousePointerClick size={18}/> Website Widget</div>
                    <div className="flex items-center gap-3 text-sm text-gray-600"><School size={18}/> Class Booking</div>
                    <div className="flex items-center gap-3 text-sm text-gray-600"><Monitor size={18}/> Desktop-App</div>
                    <div className="flex items-center gap-3 text-sm text-gray-600"><CreditCard size={18}/> Payments</div>
                  </div>
                </div>
              )}
            </div>

            <div className="relative py-2" onMouseEnter={() => setActiveMenu('pricing')}>
              <button className="hover:text-black flex items-center gap-1">Pricing <ChevronDown size={14}/></button>
              {activeMenu === 'pricing' && (
                <div className="absolute top-full left-[-250px] w-[450px] bg-white shadow-2xl rounded-xl border border-gray-100 p-8 mt-2">
                  <div className="grid grid-cols-2 gap-4 text-left">
                    <div className="border border-gray-100 p-4 rounded-lg">
                      <h4 className="font-bold text-xl">Free</h4>
                      <p className="text-xs text-gray-400">$0 user / mo</p>
                    </div>
                    <div className="border border-blue-600 p-4 rounded-lg bg-blue-50/10">
                      <h4 className="font-bold text-xl">Pro</h4>
                      <p className="text-xs text-gray-400">$5* user / mo</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-6">
          {currentUser ? (
            <div className="relative">
              <button 
                onClick={() => setProfileDropdown(!profileDropdown)}
                className="flex items-center gap-2 focus:outline-none group py-1"
              >
                {currentAvatar ? (
                  <img 
                    src={currentAvatar} 
                    alt="User Profile" 
                    className="w-9 h-9 rounded-full object-cover shadow-sm ring-2 ring-emerald-50 transition-transform group-hover:scale-105"
                  />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-[#00b67a] text-white flex items-center justify-center text-sm font-bold shadow-sm group-hover:bg-[#009664] transition-colors">
                    {getInitials(displayName)}
                  </div>
                )}
                
                <span className="text-sm font-semibold text-[#1d2d35] hidden sm:block max-w-[120px] truncate">
                  {displayName.split(' ')[0] || 'User'}
                </span>
                <ChevronDown size={14} className={`text-gray-400 transition-transform ${profileDropdown ? 'rotate-180' : ''}`} />
              </button>

              {profileDropdown && (
                <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 py-2 text-left z-50">
                  <div className="px-4 py-2.5 border-b border-gray-50">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Signed in as</p>
                    <p className="text-sm font-bold text-[#1d2d35] truncate">{displayName}</p>
                    <p className="text-xs text-gray-400 truncate">{displayEmail}</p>
                    <p className="text-[10px] text-emerald-600 font-bold uppercase mt-1">{displaySubtitle}</p>
                  </div>

                  <button 
                    onClick={() => {
                      setProfileDropdown(false);
                      if (currentRole === 'doctor' && onNavigateToDashboard) onNavigateToDashboard();
                      else onNavigateToProfile();
                    }}
                    className="w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2.5 transition-colors font-medium"
                  >
                    <User size={16} className="text-gray-400" />
                    <span>{currentRole === 'doctor' ? 'Doctor Dashboard' : 'My Profile Page'}</span>
                  </button>

                  <button className="w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2.5 transition-colors font-medium">
                    <Settings size={16} className="text-gray-400" />
                    <span>Account Settings</span>
                  </button>

                  <div className="border-t border-gray-50 my-1"></div>

                  <button 
                    onClick={() => {
                      setProfileDropdown(false);
                      handleInternalLogout();
                    }}
                    className="w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2.5 transition-colors font-semibold"
                  >
                    <LogOut size={16} />
                    <span>Log Out</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <button onClick={onLogin} className="text-[15px] font-medium text-gray-500 hover:text-black">Login</button>
              <button onClick={onStart} className="bg-[#1d2d35] text-white px-6 py-[10px] rounded-[4px] text-[15px] font-bold hover:bg-[#253943] transition-all">
                Start FREE
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
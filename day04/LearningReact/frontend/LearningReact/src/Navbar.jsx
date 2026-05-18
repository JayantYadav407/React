import React, { useState } from 'react';
// Corrected icon names for Lucide React
import { 
  Users, Briefcase, Award, BookOpen, GraduationCap, Newspaper, LifeBuoy,
  Video, Square, Calendar, CreditCard, 
  Layout, MousePointerClick, Monitor, School,
  ChevronDown, Globe, MessageSquare
} from 'lucide-react';

const Navbar = ({ onLogin, onStart }) => {
  const [activeMenu, setActiveMenu] = useState(null);

  return (
    <nav className="sticky top-0 z-50 w-full bg-white border-b border-gray-100" onMouseLeave={() => setActiveMenu(null)}>
      <div className="flex items-center justify-between px-6 py-5 md:px-16 lg:px-24 max-w-[1400px] mx-auto">
        
        <div className="flex items-center space-x-12">
          {/* Logo */}
          <div className="flex items-center gap-1 cursor-pointer">
            <span className="text-[26px] font-bold tracking-tighter text-[#1d2d35]">setmore</span>
            <div className="flex flex-col -space-y-1">
              <div className="w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-b-[6px] border-b-green-600"></div>
              <div className="w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-t-[6px] border-t-green-600"></div>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="hidden lg:flex items-center space-x-7 text-[15px] font-medium text-gray-500">
            
            {/* LEARN */}
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

            {/* INTEGRATIONS */}
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

            {/* FEATURES */}
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

            {/* PRICING */}
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

        {/* Buttons */}
        <div className="flex items-center space-x-7">
          <button onClick={onLogin} className="text-[15px] font-medium text-gray-500 hover:text-black">Login</button>
          <button onClick={onStart} className="bg-[#1d2d35] text-white px-6 py-[10px] rounded-[4px] text-[15px] font-bold hover:bg-[#253943] transition-all">
            Start FREE
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
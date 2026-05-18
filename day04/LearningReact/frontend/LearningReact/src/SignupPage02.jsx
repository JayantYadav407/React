import React from 'react';
import { Award, Video, CreditCard, Bell, ChevronRight } from 'lucide-react';

const SignupPage = ({ onLogin, onCancel }) => {
  return (
    <div className="min-h-screen bg-white font-sans text-[#1d2d35]">
      
      {/* 1. NAVIGATION HEADER */}
      <header className="flex justify-between items-center px-6 py-4 md:px-20 max-w-7xl mx-auto">
        <div className="flex items-center gap-1" onClick={onCancel}>
          <span className="text-2xl font-bold tracking-tighter">setmore</span>
          <div className="flex flex-col -space-y-1">
            <div className="w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-b-[5px] border-b-green-600"></div>
            <div className="w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[5px] border-t-green-600"></div>
          </div>
        </div>
        <div className="flex items-center gap-8 text-sm text-gray-500">
          <span className="hidden md:block">+1 (800) 749-4920</span>
          <button onClick={onLogin} className="border border-gray-300 px-6 py-2 rounded hover:bg-gray-50 transition-colors">
            Login
          </button>
        </div>
      </header>

      {/* 2. HERO SECTION (Image 1) */}
      <section className="relative px-6 py-12 md:px-20 md:py-24 max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-12">
        <div className="flex-1 space-y-8">
          <h1 className="text-5xl md:text-7xl font-bold leading-tight">
            Create your own <br /> booking calendar
          </h1>
          <p className="text-xl text-gray-500 max-w-md leading-relaxed">
            Schedule appointments, manage your calendar and accept payments Anywhere, with free online booking software.
          </p>
          
          {/* Hero Image Positioning */}
          <div className="relative pt-10">
            <img 
              src="https://images.unsplash.com/photo-1527613426441-4da17471b66d?auto=format&fit=crop&q=80&w=600" 
              alt="Medical Professionals" 
              className="rounded-2xl shadow-2xl w-full max-w-lg object-cover h-[300px]"
            />
          </div>
        </div>

        {/* SIGNUP CARD */}
        <div className="w-full lg:w-[450px] bg-white rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.1)] p-8 md:p-10 border border-gray-50">
          <h3 className="text-lg font-medium mb-8">Get your FREE account</h3>
          
          <div className="space-y-4">
            <button className="w-full flex items-center justify-center gap-3 border border-gray-200 py-3 rounded-md hover:bg-gray-50 transition-colors">
              <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="G" className="w-5" />
              <span className="text-sm">Continue with Google</span>
            </button>
            
            <button className="w-full flex items-center justify-center gap-3 bg-[#1877F2] text-white py-3 rounded-md hover:opacity-90 transition-opacity">
              <span className="bg-white text-[#1877F2] rounded-full w-5 h-5 flex items-center justify-center font-bold text-xs">f</span>
              <span className="text-sm font-medium">Continue with Facebook</span>
            </button>

            <div className="relative flex items-center py-4">
              <div className="flex-grow border-t border-gray-100"></div>
              <span className="flex-shrink mx-4 text-gray-400 text-xs uppercase">or</span>
              <div className="flex-grow border-t border-gray-100"></div>
            </div>

            <button className="w-full flex items-center justify-center gap-3 border border-gray-200 py-3 rounded-md hover:bg-gray-50 transition-colors">
              <div className="w-5 h-5 border border-gray-300 rounded flex items-center justify-center">
                <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
              </div>
              <span className="text-sm">Continue with email</span>
            </button>
          </div>

          <div className="mt-8 text-center">
            <p className="text-sm text-gray-600">
              Already have an account? 
              <button onClick={onLogin} className="ml-1 text-blue-600 hover:underline">Login</button>
            </p>
          </div>

          <p className="mt-12 text-[10px] text-gray-400 text-center leading-relaxed">
            By signing in, you agree to our <span className="underline">terms of use</span> & <span className="underline">Privacy Policy</span>.
          </p>
        </div>
      </section>

      {/* 3. FEATURES GRID (Image 2 - Top) */}
      <section className="bg-gray-100 py-24 px-6 md:px-20">
        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12">
          
          <div className="space-y-4">
            <Award className="text-[#1d2d35]" size={32} strokeWidth={1.5} />
            <h4 className="text-xl font-bold">Put your stamp on it</h4>
            <p className="text-gray-500 text-sm leading-relaxed">
              Personalize your Booking Page's URL and feature your logo, brand colors, and reviews.
            </p>
          </div>

          <div className="space-y-4">
            <Video className="text-[#1d2d35]" size={32} strokeWidth={1.5} />
            <h4 className="text-xl font-bold">Make the world your stage</h4>
            <p className="text-gray-500 text-sm leading-relaxed">
              Offer your services online with <span className="text-blue-600 hover:underline cursor-pointer">Google Meet</span> or <span className="text-blue-600 hover:underline cursor-pointer">Zoom</span> video meetings.
            </p>
          </div>

          <div className="space-y-4">
            <CreditCard className="text-[#1d2d35]" size={32} strokeWidth={1.5} />
            <h4 className="text-xl font-bold">Take advance payments</h4>
            <p className="text-gray-500 text-sm leading-relaxed">
              Get paid through your Booking Page ahead of appointments and events.
            </p>
          </div>

          <div className="space-y-4">
            <Bell className="text-[#1d2d35]" size={32} strokeWidth={1.5} />
            <h4 className="text-xl font-bold">So long, no-shows</h4>
            <p className="text-gray-500 text-sm leading-relaxed">
              Automate custom email or text reminders for every client in your calendar.
            </p>
          </div>

        </div>
      </section>

      {/* 4. FOOTER (Image 2 - Bottom) */}
      <footer className="bg-[#1d2d35] text-white py-18 px-12 md:px-20">
        <div className="max-w-7xl mx-auto flex flex-row md:row justify-between items-center gap-8">
          <div className="flex items-center gap-1">
            <span className="text-2xl font-bold tracking-tighter">setmore</span>
            <div className="flex flex-col -space-y-1">
              <div className="w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-b-[5px] border-b-white/80"></div>
              <div className="w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[5px] border-t-white/80"></div>
            </div>
          </div>
          
          <div className="flex items-center gap-2 group cursor-pointer">
            <span className="text-sm font-medium text-gray-300">Grow your business with <span className="text-white font-bold">Setmore Community</span></span>
            <ChevronRight size={16} className="text-gray-400 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </footer>

    </div>
  );
};

export default SignupPage;
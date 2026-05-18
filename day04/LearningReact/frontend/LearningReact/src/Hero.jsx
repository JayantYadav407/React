
import React from 'react';
import { Star } from 'lucide-react';
const Hero = () => {
  return (
  <main className="max-w-[1400px] mx-auto px-6 md:px-16 lg:px-24 pt-12 md:pt-20 pb-12 grid lg:grid-cols-2 items-center gap-4">
        
        {/* Left Column */}
        <div className="z-10 order-2 lg:order-1 mt-12 lg:mt-0">
          <h1 className="text-[44px] md:text-[62px] font-[800] leading-[1.08] tracking-tight text-[#1d2d35] mb-8">
            Online doctor <br />
            appointment <br />
            scheduling software
          </h1>
          
          <p className="text-[19px] md:text-[21px] text-gray-600 max-w-[480px] leading-relaxed mb-10">
            Increase efficiency and keep patients at the heart of your practice.
          </p>

          <div className="flex items-center gap-3 py-2">
            <span className="text-[16px] font-bold border-b-2 border-[#1d2d35] pb-0.5">Excellent</span>
            <div className="flex gap-[3px]">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="bg-[#00b67a] p-[3px] rounded-sm">
                  <Star size={14} fill="white" color="white" />
                </div>
              ))}
            </div>
            <div className="flex items-center gap-1.5 ml-1">
              <Star size={20} fill="#00b67a" color="#00b67a" className="mb-0.5" />
              <span className="text-[16px] font-bold tracking-tight">Trustpilot</span>
            </div>
          </div>
        </div>

        {/* Right Column: Imagery - EXACT STYLING from your image */}
        <div className="relative order-1 lg:order-2 flex justify-center lg:justify-end">
          <div className="absolute top-[10%] right-[-5%] w-[70%] h-[85%] bg-[#f4f7f9] -z-20 rounded-xl"></div>
          <div className="absolute top-[15%] right-0 w-[38%] h-[55%] bg-[#4089ff] -z-10 rounded-lg"></div>
          <div className="absolute bottom-[20%] left-[10%] w-[35%] h-[25%] bg-[#4089ff] -z-10 rounded-lg"></div>
          
          <div className="relative z-10 w-full max-w-[520px]">
            {/* Using a high-quality doctor placeholder that matches your screenshot */}
            <img 
              src="https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=1000" 
              alt="Doctor smiling" 
              className="w-full object-cover rounded-lg shadow-xl"
            />
          </div>
        </div>
      </main>

        );
};

export default Hero;
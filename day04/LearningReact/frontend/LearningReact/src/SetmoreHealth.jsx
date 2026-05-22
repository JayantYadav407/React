import React from 'react';

const SetmoreHealth = ({Jump}) => {
  return (
    <section className="py-20 px-6 bg-white flex justify-center items-center">
      {/* Container with shadow and rounded corners to match the card style */}
      <div className="max-w-6xl w-full bg-[#f9fafb] rounded-2xl overflow-hidden shadow-sm border border-gray-100 flex flex-col md:flex-row items-center p-8 md:p-16 gap-12">
        
        {/* Left Content: Text and CTA */}
        <div className="flex-1 space-y-6">
          <h2 className="text-3xl md:text-4xl font-extrabold text-[#1d2d35] leading-tight">
            Doctor scheduling software on <br />
            Setmore Health
          </h2>
          
          <p className="text-lg text-gray-600 leading-relaxed max-w-md">
            Build trust in your services by ensuring your patients’ data remains secure. 
            Your <span className="text-[#1d2d35] font-semibold underline decoration-1 underline-offset-4 cursor-pointer">Setmore Pro</span> account 
            comes with additional safeguarding and privacy tools.
          </p>

          <button className="bg-[#243931] text-white px-8 py-4 rounded-md font-bold text-sm hover:bg-[#2c463c] transition-colors duration-200" onClick={Jump}>
            Get started now
          </button>
        </div>

        {/* Right Content: Branding and Product Mockup */}
        <div className="flex-1 relative flex justify-center items-center">
          {/* Blurred background mockup representation */}
          <div className="absolute inset-0 bg-white/40 backdrop-blur-[2px] rounded-xl z-0 border border-gray-100 shadow-inner"></div>
          
          {/* Central Logo Branding */}
          <div className="relative z-10 flex flex-col items-center">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-4xl font-bold tracking-tighter text-[#1d2d35]">setmore</span>
              <div className="flex flex-col justify-center items-center -mt-1">
                <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-b-[8px] border-b-green-600 mb-[1px]"></div>
                <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] border-t-green-600"></div>
              </div>
            </div>
            <div className="tracking-[0.5em] text-[#1d2d35] font-light text-xl ml-2">
              HEALTH
            </div>
          </div>

          {/* Abstract representation of UI elements in the background */}
          <div className="absolute -right-4 top-10 w-32 h-48 bg-white/60 rounded-lg shadow-sm -rotate-3 -z-10 border border-gray-50"></div>
          <div className="absolute -left-4 bottom-10 w-24 h-32 bg-white/60 rounded-lg shadow-sm rotate-6 -z-10 border border-gray-50"></div>
        </div>
      </div>
    </section>
  );
};

export default SetmoreHealth;
import React from 'react';

const PatientInformation = () => {
  return (
    <section className="py-24 px-6 md:px-16 lg:px-24 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto grid lg:grid-cols-2 items-center gap-16">
        
        {/* Left Content: Text Block */}
        <div className="order-2 lg:order-1 space-y-8">
          <h2 className="text-4xl md:text-5xl font-extrabold text-[#1d2d35] leading-tight tracking-tight">
            Store up-to-date patient <br />
            information
          </h2>
          
          <div className="space-y-6 text-lg md:text-xl text-gray-600 leading-relaxed max-w-xl">
            <p>
              A patient's <span className="text-[#00b67a] font-medium border-b border-[#00b67a]/30 cursor-pointer hover:border-[#00b67a] transition-all">Customer Profile</span> automatically updates when 
              they book an appointment. Centralize contact information 
              and <span className="text-[#1d2d35] font-bold">attach notes for fast access before appointments.</span>
            </p>
            <p>
              Your online doctor scheduling app allows you to digitally 
              back-up patient health records and treatment 
              recommendations.
            </p>
          </div>
        </div>

        {/* Right Content: Image with Accent */}
        <div className="order-1 lg:order-2 relative flex justify-center lg:justify-end">
          {/* Subtle light-blue vertical accent behind the image */}
          <div className="absolute top-0 right-0 w-[90%] h-full bg-[#f4f7f9] -z-10 rounded-2xl opacity-60"></div>
          
          <div className="relative z-10 w-full max-w-[580px]">
            <img 
              src="https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&q=80&w=1000" 
              alt="Doctor using a digital tablet" 
              className="w-full h-auto rounded-lg shadow-sm object-cover"
              style={{ minHeight: '400px' }}
            />
          </div>
        </div>
        
      </div>
    </section>
  );
};

export default PatientInformation;
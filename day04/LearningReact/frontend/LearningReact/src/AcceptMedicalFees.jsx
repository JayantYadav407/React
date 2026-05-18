import React from 'react';

const AcceptMedicalFees = () => {
  return (
    <section className="py-24 px-6 md:px-16 lg:px-24 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto grid lg:grid-cols-2 items-center gap-16">
        
        {/* Left Content: Image with Rounded Corners */}
        <div className="relative flex justify-center lg:justify-start">
          {/* Decorative subtle background block behind image */}
          <div className="absolute top-[-5%] left-[-5%] w-[80%] h-[90%] bg-[#f4f7f9] -z-10 rounded-2xl opacity-60"></div>
          
          <div className="relative z-10 w-full max-w-[580px]">
            <img 
              src="https://images.unsplash.com/photo-1563013544-824ae1b704d3?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" 
              alt="Person typing on laptop with credit card" 
              className="w-full h-auto rounded-xl shadow-lg object-cover"
              style={{ minHeight: '400px' }}
            />
          </div>
        </div>

        {/* Right Content: Text Block */}
        <div className="space-y-8">
          <h2 className="text-4xl md:text-5xl font-[800] text-[#1d2d35] leading-tight tracking-tight">
            Accept medical fees <br />
            online
          </h2>
          
          <div className="space-y-6 text-lg md:text-xl text-gray-600 leading-relaxed max-w-xl">
            <p>
              Minimize invoicing time by integrating Setmore with <span className="text-[#00b67a] font-medium border-b border-[#00b67a]/30 cursor-pointer hover:border-[#00b67a] transition-all">Stripe</span>, <span className="text-[#00b67a] font-medium border-b border-[#00b67a]/30 cursor-pointer hover:border-[#00b67a] transition-all">Square</span> or <span className="text-[#00b67a] font-medium border-b border-[#00b67a]/30 cursor-pointer hover:border-[#00b67a] transition-all">PayPal</span>.
            </p>
            <p>
              Your practice is able to <span className="text-[#1d2d35] font-bold">accept secure online payments</span>, directly from your Booking Page.
            </p>
            <p>
              Bill patients for consultations or treatments in advance with a convenient, contactless payment gateway.
            </p>
          </div>
        </div>
        
      </div>
    </section>
  );
};

export default AcceptMedicalFees;
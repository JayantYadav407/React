import React from 'react';
import { Calendar, MousePointerClick, Mail } from 'lucide-react';

const FeaturesGrid = () => {
  const features = [
    {
      icon: <Calendar className="text-gray-400" size={32} strokeWidth={1.5} />,
      title: "Create your practice’s Booking Page",
      description: (
        <>
          Display your medical services online. Customize your Booking Page with your logo, contact details, reviews and more. 
          <span className="block mt-4 text-[#00b67a]">Share specialists’ availability and let patients confirm their appointments in minutes.</span>
        </>
      ),
    },
    {
      icon: <MousePointerClick className="text-gray-400" size={32} strokeWidth={1.5} />,
      title: "Book appointments from your website",
      description: (
        <>
          Add a <span className="text-[#00b67a] cursor-pointer hover:underline">‘Book Now’ button</span> to your practice’s website. Enable new and existing patients to self-book right away, without needing to contact your office.
          <span className="block mt-4">Connect Setmore with Squarespace, WordPress and more.</span>
        </>
      ),
    },
    {
      icon: <Mail className="text-gray-400" size={32} strokeWidth={1.5} />,
      title: "Set up automatic appointment confirmations",
      description: (
        <>
          Attend to more patients while Setmore automates <span className="text-[#00b67a] cursor-pointer hover:underline">booking confirmations via email</span>.
          <span className="block mt-4">Personalize alerts with important pre-appointment information so visitors come prepared.</span>
        </>
      ),
    },
  ];

  return (
    <section className="py-24 px-6 md:px-16 lg:px-24 bg-[#f4f7f9]/30">
      <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-8">
        {features.map((feature, index) => (
          <div 
            key={index} 
            className="bg-white p-10 rounded-2xl shadow-[0_10px_30px_-15px_rgba(0,0,0,0.08)] border border-gray-100 flex flex-col space-y-6 hover:shadow-lg transition-shadow duration-300"
          >
            <div className="mb-2">
              {feature.icon}
            </div>
            <h3 className="text-2xl font-bold text-[#1d2d35] leading-snug">
              {feature.title}
            </h3>
            <div className="text-gray-600 leading-relaxed text-[17px]">
              {feature.description}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default FeaturesGrid;
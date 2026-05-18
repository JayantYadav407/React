import React, { useState } from 'react';

const SignupPage = ({ onCancel }) => {
  const [userCount, setUserCount] = useState(1);

  return (
    <div className="min-h-screen bg-[#fafafa] font-sans text-[#1d2d35] flex flex-col lg:flex-row">
      {/* LEFT SIDE: Form & Payment */}
      <div className="flex-1 bg-white p-8 md:p-16 lg:p-24 overflow-y-auto">
        <div className="max-w-md mx-auto lg:ml-0">
          {/* Logo */}
          <div className="flex items-center gap-1 mb-12 cursor-pointer" onClick={onCancel}>
            <span className="text-2xl font-bold tracking-tighter">setmore</span>
            <div className="flex flex-col -space-y-1">
              <div className="w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-b-[5px] border-b-green-600"></div>
              <div className="w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[5px] border-t-green-600"></div>
            </div>
          </div>

          <h1 className="text-4xl font-normal mb-8">Create Your Account</h1>

          {/* Social Signups */}
          <p className="text-sm font-semibold mb-4 text-gray-700">Use your social media account</p>
          <div className="flex gap-4 mb-10">
            <button className="flex-1 border border-gray-200 py-3 rounded-md flex justify-center items-center gap-2 hover:bg-gray-50 transition-colors">
              <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5" />
              <span className="text-sm text-gray-600">Sign up with Google</span>
            </button>
            <button className="flex-1 bg-[#181818] text-white py-3 rounded-md flex justify-center items-center gap-2 hover:bg-black transition-colors">
              <span className="text-sm font-semibold">Sign up with Facebook</span>
            </button>
          </div>

          {/* Account Form */}
          <div className="space-y-8 mb-16">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Full Name</label>
              <input type="text" placeholder="First and last name" className="w-full border-b border-gray-200 pb-2 outline-none focus:border-green-600 transition-colors" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Email</label>
              <input type="email" placeholder="name@domain.com" className="w-full border-b border-gray-200 pb-2 outline-none focus:border-green-600 transition-colors" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Password</label>
              <input type="password" placeholder="At least 8 characters" className="w-full border-b border-gray-200 pb-2 outline-none focus:border-green-600 transition-colors" />
            </div>
          </div>

          {/* Payment Details */}
          <h2 className="text-2xl font-normal mb-8">Payment details</h2>
          <div className="space-y-6">
            <div>
              <label className="block text-xs font-bold text-gray-400 mb-2">Card number</label>
              <div className="border border-gray-200 rounded-md p-3 flex justify-between items-center">
                <input type="text" placeholder="1234 1234 1234 1234" className="outline-none w-full" />
                <div className="flex gap-1 opacity-70">
                  <span className="text-[10px] border px-1 rounded">VISA</span>
                  <span className="text-[10px] border px-1 rounded">MC</span>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-400 mb-2">Expiration date</label>
                <input type="text" placeholder="MM / YY" className="w-full border border-gray-200 rounded-md p-3 outline-none" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 mb-2">Security code</label>
                <input type="text" placeholder="CVC" className="w-full border border-gray-200 rounded-md p-3 outline-none" />
              </div>
            </div>

            <p className="text-xs text-gray-400 leading-relaxed">
              By providing your card information, you allow Setmore to charge your card for future payments in accordance with their terms.
            </p>

            <div className="flex items-start gap-3 pt-4">
              <input type="checkbox" className="mt-1" id="terms" />
              <label htmlFor="terms" className="text-sm text-gray-600 leading-snug">
                By signing up, you agree to our <span className="underline cursor-pointer">Terms of Use</span> & <span className="underline cursor-pointer">Privacy Policy</span>.
              </label>
            </div>

            <div className="flex gap-4 pt-8">
              <button onClick={onCancel} className="flex-1 py-3 border border-gray-200 rounded-md font-medium text-gray-600 hover:bg-gray-50">Cancel</button>
              <button className="flex-1 py-3 bg-[#181818] text-white rounded-md font-bold hover:bg-black">Pay Now</button>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT SIDE: Summary Card */}
      <div className="lg:w-[450px] bg-[#f7f8f9] p-8 md:p-16 flex items-start justify-center">
        <div className="w-full bg-white rounded-xl shadow-xl p-8 border border-gray-100">
          <h3 className="text-xl mb-6">Selected plan</h3>
          
          <div className="flex gap-6 mb-10">
            <label className="flex items-center gap-2 cursor-pointer text-sm">
              <input type="radio" name="billing" /> Monthly billing
            </label>
            <label className="flex items-center gap-2 cursor-pointer text-sm font-bold">
              <input type="radio" name="billing" defaultChecked /> Annual billing
            </label>
          </div>

          <div className="flex justify-between items-center mb-8">
            <div>
              <p className="font-bold text-lg">Pro <span className="text-gray-400 font-normal text-sm">(per user)</span></p>
            </div>
            <p className="text-xl font-bold">$5<span className="text-sm font-normal text-gray-400">/mo</span></p>
          </div>

          <div className="flex justify-between items-center border-b border-gray-100 pb-8 mb-8">
            <p className="text-sm text-gray-500">Number of users</p>
            <div className="flex items-center gap-4">
              <button onClick={() => setUserCount(Math.max(1, userCount - 1))} className="w-6 h-6 border rounded-full flex items-center justify-center text-gray-400">-</button>
              <span className="font-bold">{userCount}</span>
              <button onClick={() => setUserCount(userCount + 1)} className="w-6 h-6 border rounded-full flex items-center justify-center text-gray-400">+</button>
            </div>
          </div>

          <div className="flex justify-between items-center mb-10">
            <p className="text-lg">Total charged today</p>
            <p className="text-3xl font-bold">${(userCount * 60).toFixed(2)}</p>
          </div>

          <div className="bg-blue-50/50 text-blue-600 text-[11px] text-center py-2 rounded-md font-medium">
            ${(userCount * 60).toFixed(2)} Billed on 17 May 2026
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
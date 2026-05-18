import React from 'react';

const LoginPage = ({ onCancel, onSignup }) => {
  return (
    <div className="min-h-screen bg-[#f7f8f9] flex flex-col font-sans">
      {/* Top Navigation Bar (Logo and Signup Link) */}
      <div className="w-full max-w-[1200px] mx-auto flex justify-between items-center px-10 py-8">
        {/* Brand Logo - Aligned Left */}
        <div className="cursor-pointer" onClick={onCancel}>
          <div className="flex items-center gap-1">
            <span className="text-[36px] font-bold tracking-tighter text-[#1d2d35]">setmore</span>
            <div className="flex flex-col -space-y-1">
              <div className="w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-b-[6px] border-b-green-600"></div>
              <div className="w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-t-[6px] border-t-green-600"></div>
            </div>
          </div>
        </div>

        {/* Signup Link - Aligned Right */}
        <div className="text-sm text-gray-600">
          Don't have an account? 
          <button onClick={onSignup} className="ml-2 text-blue-600 hover:underline font-medium">Sign up</button>
        </div>
      </div>

      {/* Main Login Content - Centered in the middle of the remaining screen */}
      <div className="flex flex-col items-center justify-center flex-grow p-6">
        <div className="bg-white w-full max-w-[480px] rounded-lg shadow-[0_4px_20px_rgba(0,0,0,0.08)] p-10 md:p-14">
          <h1 className="text-2xl font-normal text-gray-800 mb-8">Login</h1>

          {/* Social Icons Container */}
          <div className="flex justify-between gap-4 mb-8">
             <div className="flex-1 flex justify-center py-2 px-4 border border-gray-200 rounded-md hover:bg-gray-50 cursor-pointer">
               <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-5 h-5" alt="Google" />
             </div>
             <div className="flex-1 flex justify-center py-2 px-4 border border-gray-200 rounded-md hover:bg-gray-50 cursor-pointer">
               <img src="https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg" className="w-5 h-5" alt="Apple" />
             </div>
             <div className="flex-1 flex justify-center py-2 px-4 border border-gray-200 rounded-md hover:bg-gray-50 cursor-pointer">
               <img src="https://upload.wikimedia.org/wikipedia/commons/4/44/Microsoft_logo.svg" className="w-5 h-5" alt="Microsoft" />
             </div>
             <div className="flex-1 flex justify-center py-2 px-4 border border-gray-200 rounded-md hover:bg-gray-50 cursor-pointer">
               <img src="https://upload.wikimedia.org/wikipedia/commons/b/b8/2021_Facebook_icon.svg" className="w-5 h-5" alt="Facebook" />
             </div>
          </div>

          <div className="relative flex items-center mb-8">
            <div className="flex-grow border-t border-gray-200"></div>
            <span className="flex-shrink mx-4 text-gray-400 text-sm">or</span>
            <div className="flex-grow border-t border-gray-200"></div>
          </div>

          <form className="space-y-8">
            <input 
              type="email" 
              placeholder="Email" 
              className="w-full border-b border-gray-300 py-2 outline-none focus:border-green-600 transition-colors"
            />
            <input 
              type="password" 
              placeholder="Password" 
              className="w-full border-b border-gray-300 py-2 outline-none focus:border-green-600 transition-colors"
            />
            <button className="w-full bg-[#1d332d] text-white py-3.5 rounded font-bold hover:bg-[#152723] transition-all">
              Login
            </button>
          </form>

          <div className="mt-8 text-center">
            <button className="text-sm text-blue-600 hover:underline">Forgotten your password?</button>
            <p className="text-[11px] text-gray-400 mt-6 leading-relaxed">
              By logging in, you agree to our <span className="underline">Terms of Use</span> & <span className="underline">Privacy Policy</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
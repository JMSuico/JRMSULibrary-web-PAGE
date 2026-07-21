import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { LoginForm } from '@/src/Features/Auth/components/LoginForm';
import { useToast } from '@/src/Hooks/useToast';
import { useGlobalAutoRefresh } from '@/src/Hooks/useGlobalAutoRefresh';

export default function LoginPage() {
  const location = useLocation();
  const { showToast } = useToast();

  // Monitor server connection: if server drops and reconnects, force reload. (Ignores normal CMS updates)
  useGlobalAutoRefresh(15000, true);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('timeout') === '1') {
      showToast('You have been logged out due to inactivity.', 'info');
    }
  }, [location.search, showToast]);

  return (
    <div className="min-h-screen w-full flex flex-col items-center bg-gray-50 relative">
      
      {/* Dynamic Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-navy blur-[120px] opacity-20 animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-gold blur-[120px] opacity-20" style={{ animation: 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite 2s' }}></div>
      </div>

      <div className="w-full max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center p-6 md:p-12 relative z-10 flex-grow my-auto">
        
        {/* Left Side: Branding */}
        <div className="hidden lg:flex flex-col gap-6 p-8">
          <div className="flex items-center gap-4 mb-4">
            <img 
              src="/assets/jrmsu-logo.png" 
              alt="JRMSU Logo" 
              className="w-20 h-20 drop-shadow-xl"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = "https://via.placeholder.com/80x80/002B7F/FFFFFF?text=Logo";
              }}
            />
            <div className="w-1 h-16 bg-gold rounded-full"></div>
            <div>
              <h1 className="font-playfair text-3xl font-bold text-navy leading-tight">Jose Rizal<br/>Memorial State University</h1>
              <p className="font-inter text-gold font-semibold tracking-wider text-sm">KATIPUNAN CAMPUS LIBRARY</p>
            </div>
          </div>
          <div className="bg-white/60 backdrop-blur-md p-8 rounded-3xl border border-white/50 shadow-xl shadow-navy/5">
            <h3 className="font-playfair text-2xl font-bold text-gray-900 mb-4">
              Secure Administration Portal
            </h3>
            <p className="text-gray-600 font-inter leading-relaxed">
              This system is strictly restricted to authorized library personnel. 
              Manage newly acquired books, gallery sections, page content, and e-resources 
              seamlessly through this portal.
            </p>
          </div>
        </div>

        {/* Right Side: Form */}
        <div className="w-full bg-white/80 backdrop-blur-xl p-8 md:p-12 rounded-[2.5rem] shadow-2xl shadow-navy/10 border border-white">
          <LoginForm />
        </div>

      </div>

      {/* Developer Footer */}
      <div className="w-full text-center z-20 pb-6 mt-4">
        <p className="text-gray-500 font-medium text-sm">Developed by JM Suico, Rodman Wong, John Lester Uy</p>
        <p className="text-gray-400 text-xs mt-1">CS - A</p>
      </div>
    </div>
  );
}

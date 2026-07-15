import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, ShieldCheck, Loader2 } from 'lucide-react';
import { userApi } from '@/src/Endpoints/userApi';
import { useToast } from '@/src/Hooks/useToast';
import { ForgotPasswordModal } from './ForgotPasswordModal';

export function LoginForm() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [captchaNum1, setCaptchaNum1] = useState(0);
  const [captchaNum2, setCaptchaNum2] = useState(0);
  const [captchaInput, setCaptchaInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const { showToast } = useToast();

  // Initialize Captcha and Remember Me
  useEffect(() => {
    setCaptchaNum1(Math.floor(Math.random() * 10) + 1);
    setCaptchaNum2(Math.floor(Math.random() * 10) + 1);
    
    const remembered = localStorage.getItem('jrmsu_admin_remember_me');
    if (remembered) {
      try {
        const parsed = JSON.parse(remembered);
        if (parsed.username && parsed.password) {
          setUsername(parsed.username);
          setPassword(parsed.password);
          setRememberMe(true);
        }
      } catch (e) {
        // ignore JSON parse errors
      }
    }
  }, []);

  const isHuman = captchaInput === (captchaNum1 + captchaNum2).toString();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isHuman) return;
    
    setIsLoading(true);
    
    // Autofill fix: Read directly from DOM to handle browser autofill bypassing React's onChange
    const actualUsername = (document.getElementById('username') as HTMLInputElement)?.value || username;
    const actualPassword = (document.getElementById('password') as HTMLInputElement)?.value || password;
    
    try {
      await userApi.login({ username: actualUsername, password: actualPassword });
      
      if (rememberMe) {
        localStorage.setItem('jrmsu_admin_remember_me', JSON.stringify({ username: actualUsername, password: actualPassword }));
      } else {
        localStorage.removeItem('jrmsu_admin_remember_me');
      }

      showToast('Login successful', 'success');
      
      // Force a full page reload to flush any stale SPA state or chunk hashes,
      // especially if the server was recently restarted.
      window.location.href = '/admin';
    } catch (err: any) {
      showToast(err.message || 'Invalid credentials', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
    <form onSubmit={handleLogin} className="flex flex-col gap-6 w-full max-w-md mx-auto relative z-10">
      <div className="flex flex-col text-center mb-4">
        <h2 className="font-playfair text-3xl font-bold text-gray-900 mb-2">Admin Portal</h2>
        <p className="text-gray-500 font-inter text-sm">Sign in to manage library content</p>
      </div>

      <div className="flex flex-col gap-4">
        <div className="relative group">
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full px-4 pt-6 pb-2 border border-gray-300 rounded-xl bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-navy focus:border-transparent transition-all peer"
            placeholder=" "
            required
          />
          <label
            htmlFor="username"
            className="absolute left-4 top-4 text-gray-500 text-sm transition-all peer-placeholder-shown:text-base peer-placeholder-shown:top-4 peer-focus:top-1.5 peer-focus:text-xs peer-focus:text-navy peer-[:not(:placeholder-shown)]:top-1.5 peer-[:not(:placeholder-shown)]:text-xs font-inter cursor-text"
          >
            Username
          </label>
        </div>

        <div className="relative group">
          <input
            type={showPassword ? "text" : "password"}
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 pt-6 pb-2 pr-12 border border-gray-300 rounded-xl bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-navy focus:border-transparent transition-all peer"
            placeholder=" "
            required
          />
          <label
            htmlFor="password"
            className="absolute left-4 top-4 text-gray-500 text-sm transition-all peer-placeholder-shown:text-base peer-placeholder-shown:top-4 peer-focus:top-1.5 peer-focus:text-xs peer-focus:text-navy peer-[:not(:placeholder-shown)]:top-1.5 peer-[:not(:placeholder-shown)]:text-xs font-inter cursor-text"
          >
            Password
          </label>
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
            aria-label="Toggle password visibility"
          >
            {showPassword ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/><line x1="2" x2="22" y1="2" y2="22"/></svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
            )}
          </button>
        </div>
      </div>

      {/* Math Captcha Verification */}
      <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl flex flex-col gap-3 shadow-sm">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700 select-none">
            Human Verification
          </span>
          <div className="flex flex-col items-center justify-center">
            <ShieldCheck className="w-5 h-5 text-navy" />
            <span className="text-[9px] text-navy mt-1 uppercase tracking-wider font-semibold">Secure</span>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="px-3 py-2 bg-white border border-gray-300 rounded-lg text-lg font-mono font-bold text-gray-800 tracking-widest select-none">
            {captchaNum1} + {captchaNum2} =
          </div>
          <input
            type="number"
            value={captchaInput}
            onChange={(e) => setCaptchaInput(e.target.value)}
            className={`w-20 px-3 py-2 border rounded-lg text-lg font-mono text-center focus:outline-none focus:ring-2 focus:border-transparent transition-all ${
              captchaInput === (captchaNum1 + captchaNum2).toString() 
                ? 'border-green-500 bg-green-50 text-green-700 focus:ring-green-500' 
                : captchaInput.length > 0 
                  ? 'border-red-400 bg-red-50 text-red-700 focus:ring-red-500'
                  : 'border-gray-300 bg-white text-gray-900 focus:ring-navy'
            }`}
            placeholder="?"
            required
          />
          {captchaInput === (captchaNum1 + captchaNum2).toString() && (
            <CheckCircle className="w-6 h-6 text-green-500 animate-in zoom-in" />
          )}
        </div>
      </div>

      <div className="flex justify-between items-center -mt-3 px-1">
        <label className="flex items-center gap-2 cursor-pointer group">
          <div className="relative flex items-center justify-center w-5 h-5">
            <input 
              type="checkbox" 
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="peer appearance-none w-5 h-5 border-2 border-gray-300 rounded-md checked:bg-navy checked:border-navy transition-all"
            />
            <CheckCircle className="absolute text-white w-3.5 h-3.5 opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none" strokeWidth={3} />
          </div>
          <span className="text-sm font-medium text-gray-600 group-hover:text-gray-900 transition-colors">Remember me</span>
        </label>
        
        <button
          type="button"
          onClick={() => setIsForgotModalOpen(true)}
          className="text-sm font-medium text-navy hover:text-navy-dark transition-colors"
        >
          Forgot Password?
        </button>
      </div>

      <button
        type="submit"
        disabled={!isHuman || isLoading || !username || !password}
        className="w-full mt-2 py-3.5 rounded-xl bg-navy hover:bg-navy-dark text-white font-inter font-semibold transition-all shadow-md shadow-navy/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Authenticating...
          </>
        ) : (
          'Sign In to Dashboard'
        )}
      </button>

      <div className="mt-4 text-center">
        <a href="/" className="text-sm text-gray-500 hover:text-navy transition-colors font-medium">
          &larr; Return to public website
        </a>
      </div>
    </form>
    
    <ForgotPasswordModal 
      isOpen={isForgotModalOpen} 
      onClose={() => setIsForgotModalOpen(false)} 
    />
    </>
  );
}

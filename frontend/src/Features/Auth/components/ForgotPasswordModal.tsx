import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Loader2, Mail, KeyRound, CheckCircle } from 'lucide-react';
import { userApi } from '@/src/Endpoints/userApi';
import { useToast } from '@/src/Hooks/useToast';

interface ForgotPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ForgotPasswordModal({ isOpen, onClose }: ForgotPasswordModalProps) {
  const [step, setStep] = useState<1 | 2>(1);
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { showToast } = useToast();

  if (!isOpen) return null;

  const handleRequestCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await userApi.requestPasswordReset(email);
      showToast('If that email exists, a reset code was sent.', 'success');
      setStep(2);
    } catch (err: any) {
      showToast(err.message || 'Failed to request reset', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await userApi.resetPasswordWithCode(email, code, newPassword);
      showToast('Password reset successfully. You can now log in.', 'success');
      onClose();
      // Reset state for next time
      setTimeout(() => {
        setStep(1);
        setEmail('');
        setCode('');
        setNewPassword('');
      }, 300);
    } catch (err: any) {
      showToast(err.message || 'Failed to reset password', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 ] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-modal-overlay z-[9999]">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-modal-card">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold font-playfair text-gray-900">
            {step === 1 ? 'Forgot Password' : 'Reset Password'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors rounded-full hover:bg-gray-100 p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          {step === 1 ? (
            <form onSubmit={handleRequestCode} className="flex flex-col gap-4">
              <p className="text-sm text-gray-600 mb-2">
                Enter your admin email address. We'll send you an 8-digit verification code to reset your password.
              </p>
              
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-navy focus:border-transparent transition-all"
                  placeholder="admin@example.com"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading || !email}
                className="w-full mt-4 py-3 rounded-xl bg-navy hover:bg-navy-dark text-white font-inter font-semibold transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Send Reset Code'}
              </button>
            </form>
          ) : (
             <form onSubmit={handleResetPassword} className="flex flex-col gap-4">
              <p className="text-sm text-gray-600 mb-2">
                Enter the 8-digit code sent to <span className="font-semibold">{email}</span> and your new password.
              </p>

              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <CheckCircle className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  required
                  maxLength={8}
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-navy focus:border-transparent transition-all font-mono tracking-widest uppercase"
                  placeholder="12345678"
                />
              </div>

              <div className="relative mt-2">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <KeyRound className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-navy focus:border-transparent transition-all"
                  placeholder="New Password"
                  minLength={8}
                />
              </div>

              <button
                type="submit"
                disabled={isLoading || !code || !newPassword}
                className="w-full mt-4 py-3 rounded-xl bg-green-600 hover:bg-green-700 text-white font-inter font-semibold transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Confirm Password Reset'}
              </button>
              
              <button
                type="button"
                onClick={() => setStep(1)}
                className="w-full mt-2 py-2 text-sm text-gray-500 hover:text-navy transition-colors font-medium"
              >
                Didn't receive code? Try again
              </button>
            </form>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}

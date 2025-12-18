import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext'; // Add this import

interface TwoFactorAuthProps {
  onVerify: (token: string) => Promise<void>;
  onCancel: () => void;
  isLoading: boolean;
}

const TwoFactorAuth: React.FC<TwoFactorAuthProps> = ({ 
  onVerify, 
  onCancel, 
  isLoading 
}) => {
  const [token, setToken] = useState('');
  const [error, setError] = useState<string>('');
  const [resendLoading, setResendLoading] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const { resend2FACode, pending2FAEmail } = useAuth(); // Add this

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!token.trim()) {
      setError('Please enter the verification code');
      return;
    }

    if (token.length !== 6) {
      setError('Verification code must be 6 digits');
      return;
    }

    try {
      await onVerify(token);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Verification failed');
      setToken('');
    }
  };

  const handleTokenChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
    setToken(value);
    if (error) setError('');
  };

  const handleResendCode = async () => {
    try {
      setResendLoading(true);
      setError('');
      await resend2FACode();
      setResendSuccess(true);
      setTimeout(() => setResendSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to resend code');
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center py-8 sm:py-12 px-3 sm:px-4 relative overflow-y-auto">
      {/* Background decorative elements */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-blue-200/20 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 hidden sm:block"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-cyan-200/20 rounded-full blur-3xl translate-x-1/2 translate-y-1/2 hidden sm:block"></div>
      
      <div className="max-w-md w-full space-y-4 sm:space-y-8 relative z-10 my-4">
        {/* Header Card */}
        <div className="bg-white shadow-xl border border-blue-100/50 rounded-2xl sm:rounded-3xl p-4 sm:p-8 text-center space-y-3 sm:space-y-4">
          <div className="flex justify-center">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl sm:rounded-3xl flex items-center justify-center shadow-lg shadow-blue-500/20">
              <svg className="w-6 h-6 sm:w-8 sm:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
              Email Verification
            </h2>
            <p className="text-slate-600 text-xs sm:text-sm mt-1 sm:mt-2">
              We've sent a 6-digit code to your email
            </p>
          </div>
          {pending2FAEmail && (
            <div className="pt-2 sm:pt-3 mt-3 sm:mt-4 border-t border-blue-100">
              <p className="text-slate-700 text-xs sm:text-sm font-semibold break-words">
                {pending2FAEmail}
              </p>
            </div>
          )}
        </div>
        
        <form className="space-y-4 sm:space-y-6 bg-white shadow-xl border border-blue-100/50 rounded-2xl sm:rounded-3xl p-4 sm:p-8" onSubmit={handleSubmit}>
          <div className="space-y-2 sm:space-y-3">
            <label htmlFor="token" className="block text-xs sm:text-sm font-semibold text-slate-700 text-center">
              Enter your 6-digit code
            </label>
            <input
              id="token"
              name="token"
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              autoComplete="one-time-code"
              required
              value={token}
              onChange={handleTokenChange}
              placeholder="000000"
              className="appearance-none relative block w-full px-3 sm:px-4 py-3 sm:py-4 border border-blue-200 placeholder-slate-400 text-slate-900 text-3xl sm:text-4xl tracking-[0.4em] sm:tracking-[0.5em] font-semibold rounded-lg sm:rounded-xl bg-blue-50/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isLoading}
            />
          </div>

          {error && (
            <div className="rounded-lg sm:rounded-xl bg-red-50 border border-red-200 p-3 sm:p-4 animate-in fade-in-50">
              <div className="text-xs sm:text-sm text-red-700 text-center font-medium flex items-center justify-center gap-2">
                <span>✕</span>
                {error}
              </div>
            </div>
          )}

          {resendSuccess && (
            <div className="rounded-lg sm:rounded-xl bg-emerald-50 border border-emerald-200 p-3 sm:p-4 animate-in fade-in-50">
              <div className="text-xs sm:text-sm text-emerald-700 text-center font-medium flex items-center justify-center gap-2">
                <span>✓</span>
                Code sent to your email!
              </div>
            </div>
          )}

          <div className="flex flex-col space-y-2 sm:space-y-3 pt-2 sm:pt-4">
            <button
              type="submit"
              disabled={isLoading || token.length !== 6}
              className="group relative w-full flex justify-center items-center py-2.5 sm:py-3 px-4 border border-transparent text-xs sm:text-sm font-semibold rounded-lg sm:rounded-xl text-white bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 min-h-[40px] sm:min-h-[48px]"
            >
              {isLoading ? (
                <div className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-3 w-3 sm:h-4 sm:w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Verifying...
                </div>
              ) : (
                'Verify Code'
              )}
            </button>
            
            <button
              type="button"
              onClick={handleResendCode}
              disabled={resendLoading || isLoading}
              className="w-full flex justify-center items-center py-2.5 sm:py-3 px-4 border border-blue-200 text-xs sm:text-sm font-semibold rounded-lg sm:rounded-xl text-slate-700 bg-blue-50/50 hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all min-h-[40px] sm:min-h-[48px]"
            >
              {resendLoading ? (
                <div className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-3 w-3 sm:h-4 sm:w-4 text-slate-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Sending...
                </div>
              ) : (
                "Didn't receive code? Resend"
              )}
            </button>

            <button
              type="button"
              onClick={onCancel}
              disabled={isLoading || resendLoading}
              className="w-full flex justify-center py-2.5 sm:py-3 px-4 border border-slate-300 text-xs sm:text-sm font-semibold rounded-lg sm:rounded-xl text-slate-600 bg-slate-50 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all min-h-[40px] sm:min-h-[48px]"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>

      <div className="fixed bottom-4 sm:bottom-8 left-4 sm:left-1/2 right-4 sm:right-auto sm:-translate-x-1/2 max-w-sm mx-auto text-center bg-white shadow-lg border border-blue-100/50 rounded-lg sm:rounded-2xl p-3 sm:p-4">
        <p className="text-xs sm:text-sm text-slate-600">
          Code expires in <span className="font-semibold text-slate-700">10 mins</span>. Check spam folder.
        </p>
      </div>
    </div>
  );
};

export default TwoFactorAuth;
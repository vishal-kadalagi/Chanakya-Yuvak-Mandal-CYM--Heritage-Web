import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Lock, Mail, ArrowRight, ShieldCheck, AlertCircle, ArrowLeft, ExternalLink, Copy, Check, Globe } from 'lucide-react';
import { useAuth, AUTHORIZED_ADMIN_EMAILS, MASTER_ADMIN_CREDENTIALS } from '../context/AuthContext';
import { useLanguage } from '../i18n/LanguageContext';

export const AdminLoginPage: React.FC = () => {
  const { language, toggleLanguage } = useLanguage();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [unauthorizedDomain, setUnauthorizedDomain] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login, loginWithGoogle, isAuthorized } = useAuth();
  const navigate = useNavigate();

  // If this phone/PC is already an authenticated device, go straight to Admin (which asks only for the PIN)
  useEffect(() => {
    const isDeviceRemembered =
      localStorage.getItem('cym_device_authenticated') === 'true' ||
      sessionStorage.getItem('cym_admin_session') === 'true' ||
      isAuthorized;

    if (isDeviceRemembered) {
      navigate('/admin');
    }
  }, [navigate, isAuthorized]);

  const handleGoogleSignIn = async () => {
    setError(null);
    setUnauthorizedDomain(null);
    setIsSubmitting(true);
    try {
      await loginWithGoogle();
      navigate('/admin');
    } catch (err: unknown) {
      const authErr = err as { code?: string; message?: string };
      if (authErr.code === 'auth/popup-closed-by-user') {
        setError('Google sign-in popup was closed before completing.');
      } else if (authErr.code === 'auth/operation-not-allowed') {
        setError('Google sign-in is not enabled in Firebase Console yet. Please enable Google under Authentication -> Sign-in method in Firebase Console.');
      } else if (authErr.code === 'auth/unauthorized-domain') {
        setUnauthorizedDomain(window.location.hostname);
        setError('Domain Authorization Required: This hosted domain must be added to Firebase Authorized Domains.');
      } else {
        setError(authErr.message || 'Google authentication failed. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const rawInput = email.trim();
    const cleanDigits = rawInput.replace(/\D/g, '');

    // Allow email or configured admin phone
    let normalizedEmail = rawInput.toLowerCase();
    if (cleanDigits === MASTER_ADMIN_CREDENTIALS.phone || rawInput === MASTER_ADMIN_CREDENTIALS.phone) {
      normalizedEmail = MASTER_ADMIN_CREDENTIALS.email;
    }

    if (!AUTHORIZED_ADMIN_EMAILS.includes(normalizedEmail)) {
      setError(
        'Access Denied: Unrecognized email or phone number. Access restricted to authorized committee admins.'
      );
      return;
    }

    setIsSubmitting(true);

    try {
      await login(rawInput, password);
      navigate('/admin');
    } catch (err: unknown) {
      const authErr = err as { code?: string; message?: string };
      console.warn('Login attempt response:', authErr);

      if (authErr.code === 'auth/operation-not-allowed') {
        setError(
          'Sign in with authorized password or click Continue with Google.'
        );
      } else if (
        authErr.code === 'auth/wrong-password' ||
        authErr.code === 'auth/invalid-credential'
      ) {
        setError(
          'Incorrect password. Please verify your credentials or click Continue with Google.'
        );
      } else if (authErr.code === 'auth/weak-password') {
        setError('Password should be at least 6 characters.');
      } else {
        setError(authErr.message || 'Authentication error. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070708] flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8 relative overflow-hidden py-12 sm:py-16 selection:bg-amber-400 selection:text-black">
      {/* Devotional Ambient Saffron Gold Glows */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-[#E5A812]/15 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-amber-500/10 rounded-full blur-[140px] pointer-events-none" />

      {/* Back to Public Website link */}
      <div className="absolute top-5 left-5 sm:top-6 sm:left-6 z-20">
        <Link
          to="/"
          className="inline-flex items-center space-x-2 text-xs font-sans font-bold text-neutral-300 hover:text-white transition-colors bg-white/5 hover:bg-white/10 border border-white/10 px-4 py-2 rounded-full backdrop-blur-md"
        >
          <ArrowLeft className="w-3.5 h-3.5 text-amber-400" />
          <span>{language === 'kn' ? 'ಮುಖ್ಯ ಪುಟಕ್ಕೆ ಹಿಂತಿರುಗಿ' : 'Back to Website'}</span>
        </Link>
      </div>

      {/* Language Switcher Capsule (English / Kannada) */}
      <div className="absolute top-5 right-5 sm:top-6 sm:right-6 z-20">
        <button
          type="button"
          onClick={toggleLanguage}
          className="flex items-center space-x-1.5 px-3.5 py-2 rounded-full bg-white/10 hover:bg-white/20 active:bg-white/25 border border-amber-400/40 text-xs font-bold text-white transition-all shadow-md cursor-pointer whitespace-nowrap"
          title={language === 'kn' ? 'Switch to English' : 'ಕನ್ನಡಕ್ಕೆ ಬದಲಿಸಿ'}
          aria-label="Language switcher"
        >
          <Globe className="w-3.5 h-3.5 text-amber-400" />
          <span className="font-mono uppercase text-[11px] sm:text-xs font-bold tracking-wider text-white">
            {language === 'kn' ? 'ENGLISH' : 'ಕನ್ನಡ'}
          </span>
        </button>
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Obsidian Glass Card */}
        <div className="bg-[#0f0f12]/85 backdrop-blur-2xl border border-amber-400/25 rounded-3xl p-6 sm:p-9 shadow-[0_20px_60px_rgba(0,0,0,0.85),inset_0_1px_0_rgba(255,255,255,0.1)]">
          {/* Brand Header */}
          <div className="flex flex-col items-center text-center mb-6">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-amber-400/10 border border-amber-400/30 flex items-center justify-center p-2.5 mb-3.5 shadow-inner">
              <img
                src="/assets/logo_transparent.png"
                alt="CYM Logo"
                className="w-full h-full object-contain filter drop-shadow-[0_2px_10px_rgba(229,168,18,0.4)]"
              />
            </div>

            <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-amber-400/10 border border-amber-400/30 text-amber-400 text-[10px] font-mono font-bold uppercase tracking-wider mb-2">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>{language === 'kn' ? 'ನಿಯಂತ್ರಿತ ಪ್ರವೇಶ' : 'RESTRICTED ACCESS'}</span>
            </div>

            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight leading-tight">
              <span>{language === 'kn' ? 'ಕಂಟ್ರೋಲ್ ಸೆಂಟರ್ ಲಾಗಿನ್' : 'Admin Portal Sign In'}</span>
            </h1>
            <p className="text-xs text-neutral-400 font-sans mt-1.5">
              {language === 'kn' ? 'ಚಾಣಕ್ಯ ಯುವಕ ಮಂಡಳ • ಕಡಲಗಿ ಖೂಟ, ಯಮಕನಮರಡಿ' : 'Chanakya Yuvak Mandal • Kadalagi Khoot, Yamakanmardi'}
            </p>
          </div>

          {/* Domain Authorization Diagnostic Card */}
          {unauthorizedDomain && (
            <div className="mb-5 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-neutral-200 text-xs space-y-3">
              <div className="flex items-center space-x-2 text-amber-400 font-bold">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>Domain Not Authorized in Firebase</span>
              </div>
              <p className="text-neutral-300 leading-relaxed text-[11px]">
                Firebase requires you to whitelist this hosted domain once before Google Sign-In can work:
              </p>
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-black/50 border border-white/10 font-mono text-[11px] text-amber-300 select-all">
                <span className="truncate pr-2">{unauthorizedDomain}</span>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(unauthorizedDomain);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                  }}
                  className="px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-[10px] font-sans font-bold uppercase transition-colors shrink-0 flex items-center space-x-1 cursor-pointer"
                >
                  {copied ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-400" />
                      <span>Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
              <div className="space-y-1.5 text-[11px] text-neutral-400 bg-white/5 p-3 rounded-xl border border-white/5">
                <p className="font-semibold text-neutral-200">60-Second Fix in Firebase Console:</p>
                <ol className="list-decimal list-inside space-y-1 text-neutral-300">
                  <li>Open Firebase Console Settings</li>
                  <li>Scroll to <strong className="text-white">Authorized domains</strong></li>
                  <li>Click <strong className="text-white">Add domain</strong>, paste this domain &amp; click <strong className="text-white">Save</strong></li>
                  <li>Refresh this page and click Continue with Google</li>
                </ol>
              </div>
              <a
                href="https://console.firebase.google.com/project/cym-public-website/authentication/settings"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center space-x-2 px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs transition-colors cursor-pointer shadow-md"
              >
                <span>Open Firebase Settings</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          )}

          {/* Error Banner */}
          {error && !unauthorizedDomain && (
            <div className="mb-5 p-3.5 rounded-2xl bg-red-500/15 border border-red-500/30 flex items-start space-x-2.5 text-xs text-red-300 leading-relaxed">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* One-Click Google Sign In Button */}
          <button
            onClick={handleGoogleSignIn}
            disabled={isSubmitting}
            type="button"
            className="w-full py-3.5 px-4 rounded-2xl bg-white hover:bg-neutral-100 text-neutral-900 font-sans font-bold text-xs flex items-center justify-center space-x-3 shadow-md transition-all cursor-pointer hover:shadow-lg disabled:opacity-50 transform hover:-translate-y-0.5 active:translate-y-0"
          >
            {/* Official Google 'G' Icon */}
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>{language === 'kn' ? 'ಗೂಗಲ್ ಮೂಲಕ ಲಾಗಿನ್' : 'Continue with Google'}</span>
          </button>

          {/* OR Divider */}
          <div className="my-5 flex items-center space-x-3">
            <div className="flex-1 h-px bg-white/10" />
            <span className="text-[10px] font-mono uppercase text-neutral-400 font-bold tracking-widest">
              {language === 'kn' ? 'ಅಥವಾ ಕ್ರೆಡೆನ್ಷಿಯಲ್ಸ್' : 'OR CREDENTIALS'}
            </span>
            <div className="flex-1 h-px bg-white/10" />
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                {language === 'kn' ? 'ಅಧಿಕೃತ ಇಮೇಲ್ ಅಥವಾ ಮೊಬೈಲ್ ಸಂಖ್ಯೆ' : 'Admin Email or Mobile Number'}
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={language === 'kn' ? 'ಅಧಿಕೃತ ಇಮೇಲ್ ಅಥವಾ ಮೊಬೈಲ್ ನಮೂದಿಸಿ' : 'Enter authorized email or mobile'}
                  required
                  className="w-full pl-10 pr-4 py-3 rounded-2xl bg-white/5 border border-white/15 text-white placeholder-neutral-500 text-sm focus:outline-hidden focus:border-[#E5A812] focus:ring-1 focus:ring-[#E5A812] transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                {language === 'kn' ? 'ಪಾಸ್‌ವರ್ಡ್' : 'Security Password'}
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={language === 'kn' ? 'ಸಮಿತಿ ಪಾಸ್‌ವರ್ಡ್ ನಮೂದಿಸಿ' : 'Enter committee password'}
                  required
                  minLength={6}
                  className="w-full pl-10 pr-4 py-3 rounded-2xl bg-white/5 border border-white/15 text-white placeholder-neutral-500 text-sm focus:outline-hidden focus:border-[#E5A812] focus:ring-1 focus:ring-[#E5A812] transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-2 py-3.5 px-4 rounded-2xl bg-[#E5A812] hover:bg-[#d4980a] text-black font-extrabold uppercase text-xs tracking-wider flex items-center justify-center space-x-2 shadow-[0_0_20px_rgba(229,168,18,0.35)] transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transform hover:-translate-y-0.5 active:translate-y-0"
            >
              <span>{isSubmitting ? (language === 'kn' ? 'ಪರಿಶೀಲಿಸಲಾಗುತ್ತಿದೆ...' : 'Verifying...') : (language === 'kn' ? 'ಲಾಗಿನ್ ಮಾಡಿ' : 'Sign In to Portal')}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Security Notice */}
          <div className="mt-6 pt-5 border-t border-white/10 text-center">
            <p className="text-[11px] font-sans text-neutral-400">
              {language === 'kn'
                ? '🔒 ಚಾಣಕ್ಯ ಯುವಕ ಮಂಡಳದ ಅಧಿಕೃತ ನಿರ್ವಾಹಕರಿಗೆ ಮಾತ್ರ ಪ್ರವೇಶ.'
                : '🔒 Access restricted strictly to authorized CYM Committee Leads.'}
            </p>
          </div>
        </div>

        {/* Footnote */}
        <p className="text-center text-[11px] font-sans text-neutral-500 mt-4">
          Secured with Firebase Authentication & Cloudinary Cloud Storage
        </p>
      </div>
    </div>
  );
};

import React, { useState, useEffect, useCallback } from 'react';
import { Lock, Unlock, AlertCircle, LogOut, Delete } from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';
import { MASTER_ADMIN_CREDENTIALS } from '../../context/AuthContext';

interface AdminPinLockModalProps {
  isLocked: boolean;
  onUnlock: () => void;
  onLogout: () => void;
  correctPin?: string;
}

export const AdminPinLockModal: React.FC<AdminPinLockModalProps> = ({
  isLocked,
  onUnlock,
  onLogout,
  correctPin = MASTER_ADMIN_CREDENTIALS.pin,
}) => {
  const { language } = useLanguage();
  const [pin, setPin] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [shake, setShake] = useState<boolean>(false);
  const [attempts, setAttempts] = useState<number>(0);
  const [lockoutTime, setLockoutTime] = useState<number>(0);

  // Security Lockout Timer
  useEffect(() => {
    if (lockoutTime <= 0) return;
    const interval = setInterval(() => {
      setLockoutTime((prev) => {
        if (prev <= 1) {
          setAttempts(0);
          setError(null);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [lockoutTime]);

  // Reset state whenever modal opens
  useEffect(() => {
    if (isLocked) {
      setPin('');
      setError(null);
      setIsSuccess(false);
      setShake(false);
    }
  }, [isLocked]);

  // Handle PIN verification
  const handleDigitAdd = useCallback(
    (digit: string) => {
      if (lockoutTime > 0 || pin.length >= 4 || isSuccess) return;
      const nextPin = pin + digit;
      setPin(nextPin);
      setError(null);

      // When 4 digits entered, verify immediately
      if (nextPin.length === 4) {
        if (nextPin === correctPin) {
          setIsSuccess(true);
          setAttempts(0);
          setTimeout(() => {
            onUnlock();
          }, 350);
        } else {
          setShake(true);
          const nextAttempts = attempts + 1;
          setAttempts(nextAttempts);

          if (nextAttempts >= 5) {
            setLockoutTime(30);
            setError(
              language === 'kn'
                ? '🔒 ಗರಿಷ್ಠ ಯತ್ನಗಳು ಮೀರಿದೆ. 30 ಸೆಕೆಂಡುಗಳ ಕಾಲ ಲಾಕ್ ಮಾಡಲಾಗಿದೆ.'
                : '🔒 Maximum attempts exceeded. Locked for 30s.'
            );
          } else {
            setError(
              language === 'kn'
                ? `ತಪ್ಪಾದ ಪಿನ್. ಬಾಕಿ ಯತ್ನಗಳು: ${5 - nextAttempts}`
                : `Incorrect PIN. ${5 - nextAttempts} attempts left.`
            );
          }

          setTimeout(() => {
            setPin('');
            setShake(false);
          }, 600);
        }
      }
    },
    [pin, correctPin, isSuccess, onUnlock, attempts, lockoutTime]
  );

  const handleBackspace = useCallback(() => {
    if (lockoutTime > 0 || pin.length === 0) return;
    setPin((prev) => prev.slice(0, -1));
    setError(null);
  }, [pin, lockoutTime]);

  const handleClear = useCallback(() => {
    if (lockoutTime > 0) return;
    setPin('');
    setError(null);
  }, [lockoutTime]);

  // Keyboard support for typing PIN
  useEffect(() => {
    if (!isLocked) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key >= '0' && e.key <= '9') {
        e.preventDefault();
        handleDigitAdd(e.key);
      } else if (e.key === 'Backspace') {
        e.preventDefault();
        handleBackspace();
      } else if (e.key === 'Escape' || e.key === 'c' || e.key === 'C') {
        e.preventDefault();
        handleClear();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isLocked, handleDigitAdd, handleBackspace, handleClear]);

  if (!isLocked) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-black/92 backdrop-blur-2xl flex items-center justify-center p-4 select-none">
      {/* Background Sacred Ambience */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-80 h-80 bg-amber-400/10 rounded-full blur-[100px] pointer-events-none" />

      <div
        className={`w-full max-w-sm bg-[#111114] border ${
          error
            ? 'border-red-500/80 shadow-[0_0_35px_rgba(239,68,68,0.25)]'
            : isSuccess
            ? 'border-emerald-400 shadow-[0_0_35px_rgba(52,211,153,0.3)]'
            : 'border-amber-400/40 shadow-[0_0_40px_rgba(229,168,18,0.2)]'
        } rounded-3xl p-6 sm:p-7 text-center relative overflow-hidden transition-all duration-300 ${
          shake ? 'animate-shake' : ''
        }`}
      >
        {/* Lock Shield Icon */}
        <div className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center relative transition-all duration-300">
          <div
            className={`absolute inset-0 rounded-2xl blur-md transition-colors ${
              isSuccess
                ? 'bg-emerald-500/30'
                : error
                ? 'bg-red-500/30'
                : 'bg-amber-400/20'
            }`}
          />
          <div
            className={`w-full h-full rounded-2xl border flex items-center justify-center relative z-10 transition-colors ${
              isSuccess
                ? 'bg-emerald-500/20 border-emerald-400 text-emerald-400'
                : error
                ? 'bg-red-500/20 border-red-400 text-red-400'
                : 'bg-amber-400/15 border-amber-400/50 text-amber-400'
            }`}
          >
            {isSuccess ? (
              <Unlock className="w-8 h-8 animate-bounce" />
            ) : (
              <Lock className="w-8 h-8" />
            )}
          </div>
        </div>

        {/* Title */}
        <h3 className="text-lg font-black text-white tracking-tight">
          {isSuccess
            ? (language === 'kn' ? 'ಅನ್‌ಲಾಕ್ ಆಗಿದೆ' : 'Portal Unlocked')
            : (language === 'kn' ? 'ಪೋರ್ಟಲ್ ಲಾಕ್ ಆಗಿದೆ' : 'Portal Locked')}
        </h3>
        <p className="text-xs text-neutral-400 mt-1">
          {isSuccess
            ? (language === 'kn' ? 'ಸ್ವಾಗತ, ಅಡ್ಮಿನ್' : 'Welcome back, Admin')
            : (language === 'kn' ? 'ಅಡ್ಮಿನ್ ನಿರ್ಗಮನ ಅಥವಾ ನಿಷ್ಕ್ರಿಯತೆ • 4-ಅಂಕಿಯ ಪಿನ್ ನಮೂದಿಸಿ' : 'Admin inactive • Enter 4-digit PIN to unlock')}
        </p>

        {/* 4 Digit Dots Indicator */}
        <div className="flex items-center justify-center space-x-3.5 my-6">
          {[0, 1, 2, 3].map((idx) => {
            const hasDigit = pin.length > idx;
            return (
              <div
                key={idx}
                className={`w-4 h-4 rounded-full transition-all duration-200 ${
                  isSuccess
                    ? 'bg-emerald-400 ring-4 ring-emerald-400/30 scale-110'
                    : error
                    ? 'bg-red-400 ring-4 ring-red-400/30 scale-110'
                    : hasDigit
                    ? 'bg-amber-400 ring-4 ring-amber-400/30 scale-110'
                    : 'bg-neutral-800 border border-neutral-700'
                }`}
              />
            );
          })}
        </div>

        {/* Error / Cooldown message */}
        {error && (
          <div className="mb-4 text-xs font-semibold text-red-400 flex items-center justify-center space-x-1.5 animate-pulse text-center px-2">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {lockoutTime > 0 && (
          <div className="mb-4 p-2.5 rounded-xl bg-red-500/10 border border-red-500/30 text-center">
            <span className="text-xs font-bold text-red-400 font-mono">
              {language === 'kn' ? `⏱️ ಮರುಪ್ರಯತ್ನಕ್ಕೆ ಕಾಯಿರಿ: ${lockoutTime}ಸೆ` : `⏱️ Retry in: ${lockoutTime}s`}
            </span>
          </div>
        )}

        {/* Numeric Keypad Grid */}
        <div className={`grid grid-cols-3 gap-2.5 max-w-[260px] mx-auto mb-4 ${lockoutTime > 0 ? 'opacity-40 pointer-events-none' : ''}`}>
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
            <button
              key={digit}
              type="button"
              disabled={lockoutTime > 0}
              onClick={() => handleDigitAdd(digit)}
              className="h-12 rounded-xl bg-neutral-900/90 hover:bg-neutral-800 active:bg-amber-400 active:text-black border border-neutral-800 hover:border-amber-400/50 text-white font-mono font-bold text-lg transition-all cursor-pointer shadow-xs disabled:cursor-not-allowed"
            >
              {digit}
            </button>
          ))}

          {/* Clear Button */}
          <button
            type="button"
            disabled={lockoutTime > 0}
            onClick={handleClear}
            className="h-12 rounded-xl bg-neutral-900/60 hover:bg-neutral-800 text-neutral-400 hover:text-white border border-neutral-800 text-xs font-bold uppercase transition-all cursor-pointer disabled:cursor-not-allowed"
          >
            {language === 'kn' ? 'ಅಳಿಸಿ' : 'Clear'}
          </button>

          {/* Digit 0 */}
          <button
            type="button"
            disabled={lockoutTime > 0}
            onClick={() => handleDigitAdd('0')}
            className="h-12 rounded-xl bg-neutral-900/90 hover:bg-neutral-800 active:bg-amber-400 active:text-black border border-neutral-800 hover:border-amber-400/50 text-white font-mono font-bold text-lg transition-all cursor-pointer shadow-xs disabled:cursor-not-allowed"
          >
            0
          </button>

          {/* Backspace Button */}
          <button
            type="button"
            disabled={lockoutTime > 0}
            onClick={handleBackspace}
            className="h-12 rounded-xl bg-neutral-900/60 hover:bg-neutral-800 text-neutral-400 hover:text-white border border-neutral-800 flex items-center justify-center transition-all cursor-pointer disabled:cursor-not-allowed"
            title={language === 'kn' ? 'ಹಿಂದಕ್ಕೆ' : 'Backspace'}
          >
            <Delete className="w-5 h-5" />
          </button>
        </div>

        {/* Footnote & Sign Out Action */}
        <div className="pt-3 border-t border-neutral-800/80 flex items-center justify-between text-xs text-neutral-500">
          <span className="text-[11px] text-neutral-500 font-sans">
            CYM Security Gate
          </span>

          <button
            type="button"
            onClick={onLogout}
            className="inline-flex items-center space-x-1 text-[11px] text-neutral-400 hover:text-red-400 transition-colors cursor-pointer"
          >
            <LogOut className="w-3 h-3" />
            <span>{language === 'kn' ? 'ಲಾಗ್ ಔಟ್' : 'Sign Out'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

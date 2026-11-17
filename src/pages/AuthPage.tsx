import React, { useState } from 'react';
import { ArrowLeft, Eye, EyeOff, ShieldCheck } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import type { AppRoute } from '../layouts/AppShell';
import { MakeItYourOwnBrush } from '../illustrations/BrushTypography';
import { FindikooWordmark } from '../components/FindikooWordmark';
import { api } from '../services/api';

interface AuthPageProps {
  initialMode?: 'signin' | 'signup';
  onNavigate: (route: AppRoute) => void;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function AuthPage({ initialMode = 'signup', onNavigate }: AuthPageProps) {
  const { login, register, demoLogin } = useAuth();
  const [mode, setMode] = useState<'signin' | 'signup' | 'reset'>(initialMode);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [adultConfirmed, setAdultConfirmed] = useState(false);

  // Two-step functional password reset state
  const [resetStep, setResetStep] = useState<'request' | 'confirm'>('request');
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [devPreviewCode, setDevPreviewCode] = useState('');

  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const switchMode = (nextMode: 'signin' | 'signup' | 'reset') => {
    setMode(nextMode);
    setError('');
    setNotice('');
    setDevPreviewCode('');
    if (nextMode === 'reset') {
      setResetStep('request');
      setResetCode('');
      setNewPassword('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setNotice('');

    const trimmedEmail = email.trim();
    if (!EMAIL_RE.test(trimmedEmail)) {
      setError('Please enter a valid email address.');
      return;
    }

    if (mode === 'signup') {
      if (name.trim().length < 2) {
        setError('Please enter a display name of at least 2 characters.');
        return;
      }
      if (password.length < 8) {
        setError('Password must be at least 8 characters.');
        return;
      }
      if (!adultConfirmed) {
        setError('Please confirm that you are 18 years of age or older to create an account.');
        return;
      }
    }

    if (mode === 'signin' && !password) {
      setError('Please enter your password.');
      return;
    }

    if (mode === 'reset' && resetStep === 'confirm') {
      if (resetCode.trim().length < 4) {
        setError('Please enter the reset code.');
        return;
      }
      if (newPassword.length < 8) {
        setError('New password must be at least 8 characters.');
        return;
      }
    }

    setSubmitting(true);
    try {
      if (mode === 'signin') {
        const u = await login(trimmedEmail, password);
        onNavigate(u.role === 'admin' ? 'admin' : u.onboarding.completed ? 'world' : 'onboarding');
      } else if (mode === 'signup') {
        const u = await register({
          name: name.trim(),
          email: trimmedEmail,
          password,
          adultConfirmed,
        });
        onNavigate(u.onboarding.completed ? 'world' : 'onboarding');
      } else if (resetStep === 'request') {
        const data = await api.auth.forgotPassword(trimmedEmail);
        setNotice(data.message);
        if (data.devResetCode) {
          setDevPreviewCode(data.devResetCode);
          setResetCode(data.devResetCode);
        }
        setResetStep('confirm');
      } else {
        const res = await api.auth.resetPassword({
          email: trimmedEmail,
          code: resetCode.trim(),
          newPassword,
        });
        setPassword('');
        setNewPassword('');
        setResetCode('');
        setDevPreviewCode('');
        setMode('signin');
        setResetStep('request');
        setNotice(res.message);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDemo = async (demoEmail: string, targetRoute: AppRoute) => {
    setError('');
    setNotice('');
    setSubmitting(true);
    try {
      await demoLogin(demoEmail);
      onNavigate(targetRoute);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Demonstration sign-in failed.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#416FD2] text-white flex flex-col">
      <div className="px-6 py-4 flex items-center justify-between max-w-6xl mx-auto w-full">
        <button
          type="button"
          onClick={() => onNavigate('landing')}
          className="inline-flex items-center gap-2 min-h-[40px] text-sm font-semibold text-white/95 hover:text-white cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" aria-hidden="true" />
          <span>Back to Findikoo</span>
        </button>
        <FindikooWordmark tone="light" size="sm" />
      </div>

      <div className="flex-1 max-w-6xl mx-auto w-full px-6 py-8 grid lg:grid-cols-12 gap-10 items-center">
        {/* Left Brand & Clearly Labeled Demonstration Access */}
        <div className="lg:col-span-5 space-y-6">
          <MakeItYourOwnBrush variant="royal-lime" size="md" />
          <p className="text-white/90 text-base leading-relaxed">
            Create your own personal world on Findikoo to replace passive scrolling with practical skill growth, offline presence, and original projects.
          </p>

          <div className="bg-white/10 border border-white/25 rounded-3xl p-5 space-y-3">
            <div className="space-y-1">
              <h2 className="text-sm font-bold text-[#9BE52E]">
                Demonstration Accounts (Sample Data)
              </h2>
              <p className="text-xs text-white/85">
                Explore a pre-populated sample world or open the supervisor console. Personal accounts always start fresh at Stage 1 and keep all progress private.
              </p>
            </div>
            <div className="grid gap-2.5">
              <button
                type="button"
                disabled={submitting}
                onClick={() => handleDemo('maya@findikoo.app', 'world')}
                className="text-left min-h-[44px] px-4 py-3 rounded-2xl bg-white/15 hover:bg-white/25 transition-colors cursor-pointer disabled:opacity-60"
              >
                <div className="font-bold text-sm">Try Adult Demo Account (Maya Lin · 18+)</div>
                <div className="text-xs text-white/85">Sample Tree, House &amp; Car progress and reflections</div>
              </button>
              <button
                type="button"
                disabled={submitting}
                onClick={() => handleDemo('admin@findikoo.app', 'admin')}
                className="text-left min-h-[44px] px-4 py-3 rounded-2xl bg-[#F4C324] text-[#0F2544] hover:bg-[#f7cd45] transition-colors cursor-pointer disabled:opacity-60"
              >
                <div className="font-bold text-sm">Try Supervisor Demo (Admin Console)</div>
                <div className="text-xs text-[#0F2544]/85">Inspect supervised users, submissions, and original projects</div>
              </button>
            </div>
          </div>
        </div>

        {/* Right Sign In / Register / Reset Card */}
        <div className="lg:col-span-7 bg-white text-[#0F2544] rounded-3xl p-6 sm:p-8 shadow-lg">
          <div className="flex flex-wrap gap-1.5 p-1 bg-[#FFF0C9]/80 rounded-xl w-fit mb-6" role="tablist" aria-label="Account actions">
            <button
              type="button"
              role="tab"
              aria-selected={mode === 'signup'}
              onClick={() => switchMode('signup')}
              className={`min-h-[40px] px-4 py-2 rounded-lg text-sm font-semibold cursor-pointer ${
                mode === 'signup' ? 'bg-white shadow-xs text-[#0F2544]' : 'text-[#465873]'
              }`}
            >
              Create Account
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={mode === 'signin'}
              onClick={() => switchMode('signin')}
              className={`min-h-[40px] px-4 py-2 rounded-lg text-sm font-semibold cursor-pointer ${
                mode === 'signin' ? 'bg-white shadow-xs text-[#0F2544]' : 'text-[#465873]'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={mode === 'reset'}
              onClick={() => switchMode('reset')}
              className={`min-h-[40px] px-4 py-2 rounded-lg text-sm font-semibold cursor-pointer ${
                mode === 'reset' ? 'bg-white shadow-xs text-[#0F2544]' : 'text-[#465873]'
              }`}
            >
              Reset Password
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            {mode === 'signup' && (
              <div>
                <label htmlFor="auth-name" className="block text-sm font-semibold mb-1.5">
                  Display Name
                </label>
                <input
                  id="auth-name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="How you would like to be addressed"
                  className="w-full min-h-[44px] px-4 py-2.5 rounded-xl border border-[#0F2544]/20"
                />
              </div>
            )}

            <div>
              <label htmlFor="auth-email" className="block text-sm font-semibold mb-1.5">
                Email Address
              </label>
              <input
                id="auth-email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full min-h-[44px] px-4 py-2.5 rounded-xl border border-[#0F2544]/20"
              />
            </div>

            {mode !== 'reset' && (
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label htmlFor="auth-password" className="block text-sm font-semibold">
                    Password
                  </label>
                  {mode === 'signin' && (
                    <button
                      type="button"
                      onClick={() => switchMode('reset')}
                      className="text-xs font-semibold text-[#1E4EB8] hover:underline cursor-pointer"
                    >
                      Forgot password?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <input
                    id="auth-password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={8}
                    autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={mode === 'signup' ? 'At least 8 characters' : 'Your password'}
                    className="w-full min-h-[44px] pl-4 pr-12 py-2.5 rounded-xl border border-[#0F2544]/20"
                  />
                  <button
                    type="button"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-1 top-1/2 -translate-y-1/2 min-w-[40px] min-h-[40px] flex items-center justify-center rounded-lg text-[#465873] hover:text-[#0F2544] cursor-pointer"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" aria-hidden="true" />
                    ) : (
                      <Eye className="w-4 h-4" aria-hidden="true" />
                    )}
                  </button>
                </div>
              </div>
            )}

            {mode === 'reset' && resetStep === 'confirm' && (
              <div className="space-y-4 pt-1">
                {devPreviewCode && (
                  <div className="p-3.5 rounded-2xl bg-[#FFF0C9]/70 border border-[#F4C324] text-xs text-[#0F2544]">
                    Local preview reset code: <strong className="font-mono">{devPreviewCode}</strong>
                  </div>
                )}

                <div>
                  <label htmlFor="auth-reset-code" className="block text-sm font-semibold mb-1.5">
                    One-Time Reset Code
                  </label>
                  <input
                    id="auth-reset-code"
                    type="text"
                    required
                    value={resetCode}
                    onChange={(e) => setResetCode(e.target.value)}
                    placeholder="Enter 8-character code"
                    className="w-full min-h-[44px] px-4 py-2.5 rounded-xl border border-[#0F2544]/20 font-mono uppercase"
                  />
                </div>

                <div>
                  <label htmlFor="auth-new-password" className="block text-sm font-semibold mb-1.5">
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      id="auth-new-password"
                      type={showNewPassword ? 'text' : 'password'}
                      required
                      minLength={8}
                      autoComplete="new-password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="At least 8 characters"
                      className="w-full min-h-[44px] pl-4 pr-12 py-2.5 rounded-xl border border-[#0F2544]/20"
                    />
                    <button
                      type="button"
                      aria-label={showNewPassword ? 'Hide new password' : 'Show new password'}
                      onClick={() => setShowNewPassword((v) => !v)}
                      className="absolute right-1 top-1/2 -translate-y-1/2 min-w-[40px] min-h-[40px] flex items-center justify-center rounded-lg text-[#465873] hover:text-[#0F2544] cursor-pointer"
                    >
                      {showNewPassword ? (
                        <EyeOff className="w-4 h-4" aria-hidden="true" />
                      ) : (
                        <Eye className="w-4 h-4" aria-hidden="true" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {mode === 'signup' && (
              <div className="p-4 rounded-2xl bg-[#F4F8FD] border border-[#416FD2]/25 space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-[#1E4EB8]">
                  <ShieldCheck className="w-4 h-4 shrink-0" aria-hidden="true" />
                  <span>Adult Eligibility (18+)</span>
                </div>
                <label htmlFor="adult-confirm" className="flex items-start gap-3 text-sm text-[#0F2544] cursor-pointer">
                  <input
                    id="adult-confirm"
                    type="checkbox"
                    checked={adultConfirmed}
                    onChange={(e) => setAdultConfirmed(e.target.checked)}
                    className="mt-1 w-4 h-4 accent-[#416FD2] rounded cursor-pointer"
                  />
                  <span>
                    I confirm that I am <strong>18 years of age or older</strong>. Findikoo is open exclusively to adults.
                  </span>
                </label>
              </div>
            )}

            {error && (
              <p role="alert" className="text-sm font-medium text-red-700 bg-red-50 border border-red-200 px-3.5 py-2.5 rounded-xl">
                {error}
              </p>
            )}
            {notice && (
              <p role="status" className="text-sm font-medium text-[#126EB2] bg-[#E8F6FC] border border-[#126EB2]/25 px-3.5 py-2.5 rounded-xl">
                {notice}
              </p>
            )}

            <div className="space-y-2">
              <button
                type="submit"
                disabled={submitting}
                className="w-full min-h-[44px] py-3 px-5 rounded-xl text-sm font-bold bg-[#416FD2] text-white hover:bg-[#1E4EB8] transition-colors cursor-pointer disabled:opacity-60"
              >
                {submitting
                  ? 'Please wait...'
                  : mode === 'signin'
                  ? 'Sign In to My World'
                  : mode === 'signup'
                  ? 'Create Account & Personalize'
                  : resetStep === 'request'
                  ? 'Request Reset Code'
                  : 'Update Password'}
              </button>

              {mode === 'reset' && resetStep === 'confirm' && (
                <button
                  type="button"
                  onClick={() => {
                    setResetStep('request');
                    setError('');
                    setNotice('');
                    setDevPreviewCode('');
                  }}
                  className="w-full min-h-[40px] py-2 text-xs font-semibold text-[#465873] hover:text-[#0F2544] cursor-pointer"
                >
                  Request a new code instead
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

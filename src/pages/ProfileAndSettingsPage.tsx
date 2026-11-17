import React, { useEffect, useState } from 'react';
import { ShieldCheck, CheckCircle2, Eye, EyeOff, Lock } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';
import type { AppRoute } from '../layouts/AppShell';

export function ProfileAndSettingsPage({ onNavigate }: { onNavigate: (route: AppRoute) => void }) {
  const { user, setUser } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [privacyMode, setPrivacyMode] = useState<'private' | 'connections' | 'community'>(
    user?.privacyMode || 'private'
  );
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState('');
  const [error, setError] = useState('');

  // Change password state (personal non-demo accounts)
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [pwSaving, setPwSaving] = useState(false);
  const [pwSaved, setPwSaved] = useState('');
  const [pwError, setPwError] = useState('');

  useEffect(() => {
    if (user) {
      setName(user.name);
      setPrivacyMode(user.privacyMode);
    }
  }, [user?.id, user?.name, user?.privacyMode]);

  if (!user) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaved('');
    setError('');
    if (name.trim().length < 2) {
      setError('Display name must be at least 2 characters.');
      return;
    }
    setSaving(true);
    try {
      const res = await api.users.updateProfile({ name: name.trim(), privacyMode });
      setUser(res.user);
      setSaved('Profile and privacy settings updated.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to save settings.');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwSaved('');
    setPwError('');
    if (!currentPassword) {
      setPwError('Enter your current password.');
      return;
    }
    if (newPassword.length < 8) {
      setPwError('New password must be at least 8 characters.');
      return;
    }
    setPwSaving(true);
    try {
      const res = await api.users.changePassword({ currentPassword, newPassword });
      setCurrentPassword('');
      setNewPassword('');
      setPwSaved(res.message);
    } catch (err) {
      setPwError(err instanceof Error ? err.message : 'Unable to update password.');
    } finally {
      setPwSaving(false);
    }
  };

  return (
    <div className="space-y-8 max-w-2xl">
      <div className="space-y-1">
        <h2 className="text-3xl font-extrabold">Profile &amp; Privacy Settings</h2>
        <p className="text-sm text-[#465873]">
          Manage your display name, account details, privacy defaults, password, and onboarding preferences.
        </p>
      </div>

      <form onSubmit={handleSave} className="bg-white rounded-3xl border border-[#0F2544]/10 p-6 sm:p-8 space-y-5">
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="prof-name" className="block text-xs font-bold mb-1">
              Display Name
            </label>
            <input
              id="prof-name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl border border-[#0F2544]/20 text-sm"
            />
          </div>
          <div>
            <span className="block text-xs font-bold mb-1">Account Email</span>
            <div className="min-h-[44px] px-3.5 py-2.5 rounded-xl bg-[#FFFDF6] border border-[#0F2544]/10 text-sm text-[#465873] truncate flex items-center">
              {user.email}
            </div>
          </div>
        </div>

        <div>
          <span className="block text-xs font-bold mb-1">Account Eligibility</span>
          <div className="min-h-[44px] px-3.5 py-2.5 rounded-xl bg-[#FFFDF6] border border-[#0F2544]/10 text-sm font-semibold flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#2D6A1E]" aria-hidden="true" />
            <span>
              Adult (18+) {user.isDemoAccount ? '· Demonstration Account (Sample Data)' : '· Confirmed'}
              {user.role === 'admin' ? ' · Supervisor' : ''}
            </span>
          </div>
        </div>

        <div>
          <label htmlFor="prof-privacy" className="block text-xs font-bold mb-1">
            Profile Visibility
          </label>
          <select
            id="prof-privacy"
            value={privacyMode}
            onChange={(e) => setPrivacyMode(e.target.value as 'private' | 'connections' | 'community')}
            className="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl border border-[#0F2544]/20 text-sm bg-white"
          >
            <option value="private">Private (Only Me)</option>
            <option value="connections">My Real-World Circle</option>
            <option value="community">Shared Community Activities</option>
          </select>
          <p className="text-xs text-[#465873] mt-1.5">
            Personal journal entries always respect their own per-entry privacy selector.
          </p>
        </div>

        {error && (
          <p role="alert" className="text-xs font-semibold text-red-700 bg-red-50 border border-red-200 px-3 py-2 rounded-xl">
            {error}
          </p>
        )}

        {saved && (
          <p role="status" className="text-xs font-semibold text-[#2D6A1E] flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 shrink-0" aria-hidden="true" />
            <span>{saved}</span>
          </p>
        )}

        <div className="flex flex-wrap gap-3 pt-2">
          <button
            type="submit"
            disabled={saving}
            className="min-h-[44px] px-5 py-2.5 rounded-xl bg-[#1E4EB8] text-white text-sm font-bold hover:bg-[#126EB2] cursor-pointer disabled:opacity-60"
          >
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
          <button
            type="button"
            onClick={() => onNavigate('onboarding')}
            className="min-h-[44px] px-5 py-2.5 rounded-xl border border-[#0F2544]/20 text-sm font-semibold hover:bg-[#FFF0C9]/50 cursor-pointer"
          >
            Update Onboarding Preferences
          </button>
        </div>
      </form>

      {/* Password Management */}
      <section className="bg-white rounded-3xl border border-[#0F2544]/10 p-6 sm:p-8 space-y-4">
        <div className="flex items-center gap-2">
          <Lock className="w-4 h-4 text-[#1E4EB8]" aria-hidden="true" />
          <h3 className="text-lg font-extrabold">Password &amp; Security</h3>
        </div>

        {user.isDemoAccount ? (
          <p className="text-sm text-[#465873]">
            This shared demonstration profile uses fixed credentials. Create a personal Findikoo account to manage your own password.
          </p>
        ) : (
          <form onSubmit={handleChangePassword} className="space-y-4" noValidate>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="pw-current" className="block text-xs font-bold mb-1">
                  Current Password
                </label>
                <div className="relative">
                  <input
                    id="pw-current"
                    type={showCurrentPw ? 'text' : 'password'}
                    autoComplete="current-password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full min-h-[44px] pl-3.5 pr-11 py-2.5 rounded-xl border border-[#0F2544]/20 text-sm"
                  />
                  <button
                    type="button"
                    aria-label={showCurrentPw ? 'Hide current password' : 'Show current password'}
                    onClick={() => setShowCurrentPw((v) => !v)}
                    className="absolute right-1 top-1/2 -translate-y-1/2 min-w-[38px] min-h-[38px] flex items-center justify-center rounded-lg text-[#465873] hover:text-[#0F2544] cursor-pointer"
                  >
                    {showCurrentPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label htmlFor="pw-new" className="block text-xs font-bold mb-1">
                  New Password (8+ characters)
                </label>
                <div className="relative">
                  <input
                    id="pw-new"
                    type={showNewPw ? 'text' : 'password'}
                    autoComplete="new-password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full min-h-[44px] pl-3.5 pr-11 py-2.5 rounded-xl border border-[#0F2544]/20 text-sm"
                  />
                  <button
                    type="button"
                    aria-label={showNewPw ? 'Hide new password' : 'Show new password'}
                    onClick={() => setShowNewPw((v) => !v)}
                    className="absolute right-1 top-1/2 -translate-y-1/2 min-w-[38px] min-h-[38px] flex items-center justify-center rounded-lg text-[#465873] hover:text-[#0F2544] cursor-pointer"
                  >
                    {showNewPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>

            {pwError && (
              <p role="alert" className="text-xs font-semibold text-red-700 bg-red-50 border border-red-200 px-3 py-2 rounded-xl">
                {pwError}
              </p>
            )}
            {pwSaved && (
              <p role="status" className="text-xs font-semibold text-[#2D6A1E] flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 shrink-0" aria-hidden="true" />
                <span>{pwSaved}</span>
              </p>
            )}

            <button
              type="submit"
              disabled={pwSaving}
              className="min-h-[44px] px-5 py-2.5 rounded-xl border border-[#0F2544]/20 text-sm font-bold hover:bg-[#FFF0C9]/50 cursor-pointer disabled:opacity-60"
            >
              {pwSaving ? 'Updating Password...' : 'Update Password'}
            </button>
          </form>
        )}
      </section>
    </div>
  );
}

import { useState } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, ArrowRight, Check, Plus } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';
import type { AppRoute } from '../layouts/AppShell';

const INTEREST_OPTIONS = [
  'Drawing & Illustration',
  'Reading',
  'Nature & Gardening',
  'Coding & Building',
  'Photography',
  'Writing',
  'Walking & Movement',
  'Cooking',
  'Community Volunteering',
  'Music & Craft',
];

const SKILL_SUGGESTIONS = [
  'Sketching',
  'Graphic Design',
  'Writing',
  'Gardening',
  'Photography',
  'Woodworking',
  'Coding',
  'Cooking',
];

const SCROLL_TRIGGERS = [
  'Boredom between tasks',
  'Opening my phone out of habit',
  'Feeling stressed or mentally tired',
  'Feeling lonely or disconnected',
  'Looking for creative inspiration',
];

export function OnboardingPage({ onNavigate }: { onNavigate: (route: AppRoute) => void }) {
  const { user, setUser } = useAuth();
  const [step, setStep] = useState(1);

  const [displayName, setDisplayName] = useState(user?.name || '');
  const [adultConfirmed, setAdultConfirmed] = useState(Boolean(user?.adultConfirmed));
  const [interests, setInterests] = useState<string[]>(
    user?.onboarding.interests.length ? user.onboarding.interests : ['Drawing & Illustration', 'Nature & Gardening']
  );
  const [dailyFreeMinutes, setDailyFreeMinutes] = useState(user?.onboarding.dailyFreeMinutes || 20);
  const [currentSkills, setCurrentSkills] = useState<string[]>(user?.onboarding.currentSkills || []);
  const [learningGoals, setLearningGoals] = useState<string[]>(user?.onboarding.learningGoals || []);
  const [customSkillInput, setCustomSkillInput] = useState('');
  const [customGoalInput, setCustomGoalInput] = useState('');
  const [scrollTriggers, setScrollTriggers] = useState<string[]>(
    user?.onboarding.scrollTriggers.length ? user.onboarding.scrollTriggers : ['Boredom between tasks']
  );
  const [aspiration, setAspiration] = useState(user?.onboarding.aspiration || '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const toggleItem = (list: string[], setList: (next: string[]) => void, value: string) => {
    setList(list.includes(value) ? list.filter((i) => i !== value) : [...list, value]);
  };

  const addCustomChip = (
    value: string,
    clear: (v: string) => void,
    list: string[],
    setList: (next: string[]) => void
  ) => {
    const trimmed = value.trim();
    if (!trimmed) return;
    if (!list.includes(trimmed)) {
      setList([...list, trimmed]);
    }
    clear('');
  };

  const goToStep = (next: number) => {
    setStep(next);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNextStep1 = () => {
    setError('');
    if (displayName.trim().length < 2) {
      setError('Please enter a display name (at least 2 characters).');
      return;
    }
    if (!adultConfirmed) {
      setError('Please confirm that you are 18 years of age or older.');
      return;
    }
    goToStep(2);
  };

  const handleFinish = async () => {
    setSaving(true);
    setError('');
    try {
      const res = await api.users.saveOnboarding({
        name: displayName.trim(),
        adultConfirmed,
        interests,
        currentSkills,
        learningGoals,
        personalGoals: aspiration.trim() ? [aspiration.trim()] : ['Spend more meaningful time offline'],
        dailyFreeMinutes,
        enjoyedActivities: interests.slice(0, 3),
        scrollTriggers,
        aspiration: aspiration.trim(),
      });
      setUser(res.user);
      onNavigate('world');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to save onboarding preferences.');
    } finally {
      setSaving(false);
    }
  };

  const totalSteps = 4;

  return (
    <div className="min-h-screen bg-[#FFF0C9] text-[#0F2544] py-8 sm:py-12 px-4">
      <div className="max-w-2xl mx-auto bg-white rounded-3xl p-6 sm:p-10 shadow-sm border border-[#0F2544]/10 space-y-8">
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-4">
            <p className="text-xs font-bold text-[#1E4EB8] tabular-nums">
              Step {step} of {totalSteps}
            </p>
            {user?.onboarding.completed && (
              <button
                type="button"
                onClick={() => onNavigate('world')}
                className="text-xs font-semibold text-[#465873] hover:text-[#0F2544] hover:underline cursor-pointer"
              >
                Return to My World
              </button>
            )}
          </div>
          <div className="h-2 rounded-full bg-[#FFF0C9] overflow-hidden" aria-hidden="true">
            <div
              className="h-full bg-[#416FD2] rounded-full transition-all duration-200"
              style={{ width: `${(step / totalSteps) * 100}%` }}
            />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold">
            Personalize your offline world
          </h1>
        </div>

        <motion.div
          key={step}
          initial={{ opacity: 0.7, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
        >
        {/* STEP 1: Display Name & Adult Confirmation */}
        {step === 1 && (
          <div className="space-y-6">
            <div>
              <label htmlFor="ob-name" className="block text-sm font-bold mb-1.5">
                What should we call you?
              </label>
              <input
                id="ob-name"
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Your preferred display name"
                className="w-full min-h-[44px] px-4 py-2.5 rounded-xl border border-[#0F2544]/20"
              />
            </div>

            <div className="p-4 rounded-2xl bg-[#F4F8FD] border border-[#416FD2]/25 space-y-2">
              <label htmlFor="ob-adult" className="flex items-start gap-3 text-sm text-[#0F2544] cursor-pointer">
                <input
                  id="ob-adult"
                  type="checkbox"
                  checked={adultConfirmed}
                  onChange={(e) => setAdultConfirmed(e.target.checked)}
                  className="mt-1 w-4 h-4 accent-[#416FD2] rounded cursor-pointer"
                />
                <span>
                  I confirm that I am <strong>18 years of age or older</strong>. We keep onboarding minimal and avoid collecting unnecessary personal details.
                </span>
              </label>
            </div>

            {error && (
              <p role="alert" className="text-sm font-medium text-red-700 bg-red-50 px-3.5 py-2.5 rounded-xl">
                {error}
              </p>
            )}

            <div className="flex justify-end">
              <button
                type="button"
                onClick={handleNextStep1}
                className="inline-flex items-center gap-2 min-h-[44px] px-6 py-2.5 rounded-xl bg-[#416FD2] text-white font-bold text-sm hover:bg-[#1E4EB8] cursor-pointer"
              >
                <span>Next: Interests & Time</span>
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: Interests & Offline Time */}
        {step === 2 && (
          <div className="space-y-6">
            <div>
              <span className="block text-sm font-bold mb-2">
                Which real-world interests sound inviting right now?
              </span>
              <div className="flex flex-wrap gap-2">
                {INTEREST_OPTIONS.map((opt) => {
                  const selected = interests.includes(opt);
                  return (
                    <button
                      key={opt}
                      type="button"
                      aria-pressed={selected}
                      onClick={() => toggleItem(interests, setInterests, opt)}
                      className={`min-h-[40px] px-3.5 py-2 rounded-xl text-sm font-medium border transition-colors cursor-pointer inline-flex items-center gap-1.5 ${
                        selected
                          ? 'bg-[#416FD2] text-white border-[#416FD2]'
                          : 'bg-[#FFFDF6] text-[#0F2544] border-[#0F2544]/15 hover:bg-[#FFF0C9]/50'
                      }`}
                    >
                      {selected && <Check className="w-3.5 h-3.5" aria-hidden="true" />}
                      <span>{opt}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <span className="block text-sm font-bold mb-2">
                How much offline time do you typically have per session?
              </span>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                {[10, 15, 20, 30, 45, 60].map((mins) => (
                  <button
                    key={mins}
                    type="button"
                    aria-pressed={dailyFreeMinutes === mins}
                    onClick={() => setDailyFreeMinutes(mins)}
                    className={`min-h-[44px] px-3 py-2 rounded-xl text-sm font-semibold border tabular-nums cursor-pointer ${
                      dailyFreeMinutes === mins
                        ? 'bg-[#116D63] text-white border-[#116D63]'
                        : 'bg-[#FFFDF6] text-[#0F2544] border-[#0F2544]/15'
                    }`}
                  >
                    {mins}m
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() => goToStep(1)}
                className="inline-flex items-center gap-1.5 min-h-[44px] px-4 py-2 rounded-xl border border-[#0F2544]/20 text-sm font-semibold cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" aria-hidden="true" />
                <span>Back</span>
              </button>
              <button
                type="button"
                onClick={() => goToStep(3)}
                className="inline-flex items-center gap-2 min-h-[44px] px-6 py-2.5 rounded-xl bg-[#416FD2] text-white font-bold text-sm hover:bg-[#1E4EB8] cursor-pointer"
              >
                <span>Next: Skills</span>
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Current Skills & Desired Skills */}
        {step === 3 && (
          <div className="space-y-6">
            <div className="space-y-2.5">
              <span className="block text-sm font-bold">
                Skills you already practice (optional)
              </span>
              <div className="flex flex-wrap gap-2">
                {SKILL_SUGGESTIONS.map((sk) => {
                  const selected = currentSkills.includes(sk);
                  return (
                    <button
                      key={`cur-${sk}`}
                      type="button"
                      aria-pressed={selected}
                      onClick={() => toggleItem(currentSkills, setCurrentSkills, sk)}
                      className={`min-h-[38px] px-3 py-1.5 rounded-xl text-xs font-semibold border cursor-pointer ${
                        selected
                          ? 'bg-[#416FD2] text-white border-[#416FD2]'
                          : 'bg-[#FFFDF6] text-[#0F2544] border-[#0F2544]/15'
                      }`}
                    >
                      {sk}
                    </button>
                  );
                })}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  aria-label="Add another current skill"
                  value={customSkillInput}
                  onChange={(e) => setCustomSkillInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addCustomChip(customSkillInput, setCustomSkillInput, currentSkills, setCurrentSkills);
                    }
                  }}
                  placeholder="Add another skill you have..."
                  className="flex-1 min-h-[42px] px-3.5 py-2 rounded-xl border border-[#0F2544]/20 text-sm"
                />
                <button
                  type="button"
                  onClick={() =>
                    addCustomChip(customSkillInput, setCustomSkillInput, currentSkills, setCurrentSkills)
                  }
                  className="min-h-[42px] px-3.5 rounded-xl border border-[#0F2544]/20 text-xs font-bold inline-flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>Add</span>
                </button>
              </div>
            </div>

            <div className="space-y-2.5">
              <span className="block text-sm font-bold">
                Skills you want to grow through hands-on practice
              </span>
              <div className="flex flex-wrap gap-2">
                {SKILL_SUGGESTIONS.map((sk) => {
                  const selected = learningGoals.includes(sk);
                  return (
                    <button
                      key={`goal-${sk}`}
                      type="button"
                      aria-pressed={selected}
                      onClick={() => toggleItem(learningGoals, setLearningGoals, sk)}
                      className={`min-h-[38px] px-3 py-1.5 rounded-xl text-xs font-semibold border cursor-pointer ${
                        selected
                          ? 'bg-[#116D63] text-white border-[#116D63]'
                          : 'bg-[#FFFDF6] text-[#0F2544] border-[#0F2544]/15'
                      }`}
                    >
                      {sk}
                    </button>
                  );
                })}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  aria-label="Add another skill to learn"
                  value={customGoalInput}
                  onChange={(e) => setCustomGoalInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addCustomChip(customGoalInput, setCustomGoalInput, learningGoals, setLearningGoals);
                    }
                  }}
                  placeholder="Add a skill you want to learn..."
                  className="flex-1 min-h-[42px] px-3.5 py-2 rounded-xl border border-[#0F2544]/20 text-sm"
                />
                <button
                  type="button"
                  onClick={() =>
                    addCustomChip(customGoalInput, setCustomGoalInput, learningGoals, setLearningGoals)
                  }
                  className="min-h-[42px] px-3.5 rounded-xl border border-[#0F2544]/20 text-xs font-bold inline-flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>Add</span>
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() => goToStep(2)}
                className="inline-flex items-center gap-1.5 min-h-[44px] px-4 py-2 rounded-xl border border-[#0F2544]/20 text-sm font-semibold cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" aria-hidden="true" />
                <span>Back</span>
              </button>
              <button
                type="button"
                onClick={() => goToStep(4)}
                className="inline-flex items-center gap-2 min-h-[44px] px-6 py-2.5 rounded-xl bg-[#416FD2] text-white font-bold text-sm hover:bg-[#1E4EB8] cursor-pointer"
              >
                <span>Next: Goals & Triggers</span>
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: Scroll Triggers & Real-World Goal */}
        {step === 4 && (
          <div className="space-y-6">
            <div>
              <span className="block text-sm font-bold mb-2">
                What usually nudges you to open social feeds?
              </span>
              <div className="flex flex-wrap gap-2">
                {SCROLL_TRIGGERS.map((t) => {
                  const selected = scrollTriggers.includes(t);
                  return (
                    <button
                      key={t}
                      type="button"
                      aria-pressed={selected}
                      onClick={() => toggleItem(scrollTriggers, setScrollTriggers, t)}
                      className={`min-h-[40px] px-3.5 py-2 rounded-xl text-sm font-medium border cursor-pointer ${
                        selected
                          ? 'bg-[#B83A1C] text-white border-[#B83A1C]'
                          : 'bg-[#FFFDF6] text-[#0F2544] border-[#0F2544]/15'
                      }`}
                    >
                      {t}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label htmlFor="ob-goal" className="block text-sm font-bold mb-1.5">
                One personal goal or real-world project you would enjoy working toward
              </label>
              <textarea
                id="ob-goal"
                rows={3}
                value={aspiration}
                onChange={(e) => setAspiration(e.target.value)}
                placeholder="e.g. Fill a small sketchbook, cook dinner with friends weekly, or build a neighbourhood book box."
                className="w-full px-4 py-2.5 rounded-xl border border-[#0F2544]/20 text-sm"
              />
            </div>

            {error && (
              <p role="alert" className="text-sm text-red-700 bg-red-50 px-3.5 py-2.5 rounded-xl">
                {error}
              </p>
            )}

            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() => goToStep(3)}
                className="inline-flex items-center gap-1.5 min-h-[44px] px-4 py-2 rounded-xl border border-[#0F2544]/20 text-sm font-semibold cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" aria-hidden="true" />
                <span>Back</span>
              </button>
              <button
                type="button"
                disabled={saving}
                onClick={handleFinish}
                className="inline-flex items-center gap-2 min-h-[44px] px-6 py-2.5 rounded-xl bg-[#9BE52E] text-[#0F2544] font-extrabold text-sm hover:bg-[#8cd620] cursor-pointer disabled:opacity-60"
              >
                <span>{saving ? 'Saving Your World...' : 'Enter My World'}</span>
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>
          </div>
        )}
        </motion.div>
      </div>
    </div>
  );
}

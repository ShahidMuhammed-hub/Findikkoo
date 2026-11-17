import React, { useEffect, useState } from 'react';
import { Clock, Pause, Play, Sparkles, CheckCircle2, XCircle, ChevronDown, ChevronUp, MapPin, Package, ArrowRight } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';
import type { Activity, ActivityCategory, MissionSession, MoodType, WorldElementId } from '../shared/types';
import { WORLD_ELEMENTS_META, type WorldGrowthState } from '../shared/rules';
import { BrushHeading } from '../illustrations/BrushTypography';
import type { AppRoute } from '../layouts/AppShell';

const CATEGORIES: ('All' | ActivityCategory)[] = [
  'All',
  'Creativity',
  'Learning',
  'Nature',
  'Fitness',
  'Reading',
  'Family',
  'Friendship',
  'Kindness',
  'Community',
];

const MOODS: { id: MoodType; label: string }[] = [
  { id: 'curious', label: 'Curious' },
  { id: 'bored', label: 'Restless / Bored' },
  { id: 'stressed', label: 'Overloaded / Stressed' },
  { id: 'lonely', label: 'Want Company' },
  { id: 'tired', label: 'Low Energy' },
];

const TIME_OPTIONS = [10, 20, 30, 45];

export function LetMeChoosePage({
  preselectedActivity,
  onClearPreselected,
  onNavigate,
}: {
  preselectedActivity?: Activity | null;
  onClearPreselected?: () => void;
  onNavigate?: (route: AppRoute) => void;
}) {
  const { user, setUser } = useAuth();
  const [mood, setMood] = useState<MoodType>('curious');
  const [availableMinutes, setAvailableMinutes] = useState<number>(user?.onboarding.dailyFreeMinutes || 20);
  const [category, setCategory] = useState<'All' | ActivityCategory>('All');
  const [showAllCategories, setShowAllCategories] = useState(false);

  const [recommended, setRecommended] = useState<Activity[]>([]);
  const [allActivities, setAllActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  const [aiIdeas, setAiIdeas] = useState<
    {
      title: string;
      description: string;
      category: string;
      durationMinutes: number;
      materialsNeeded: string;
      outdoors: boolean;
      firstStep: string;
    }[]
  >([]);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState('');

  // Selected Activity & Self-Reported Offline Timer
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(preselectedActivity || null);
  const [activeSession, setActiveSession] = useState<MissionSession | null>(null);
  const [timerSecondsLeft, setTimerSecondsLeft] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [whatDidYouDo, setWhatDidYouDo] = useState('');
  const [whatDidYouLearn, setWhatDidYouLearn] = useState('');
  const [howDidYouFeel, setHowDidYouFeel] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [completionInfo, setCompletionInfo] = useState<{
    message: string;
    elementId: WorldElementId;
    worldGrowth?: WorldGrowthState;
  } | null>(null);
  const [formError, setFormError] = useState('');

  useEffect(() => {
    if (preselectedActivity) {
      setSelectedActivity(preselectedActivity);
      onClearPreselected?.();
    }
  }, [preselectedActivity, onClearPreselected]);

  // Restore active offline session if user stepped away and returned
  useEffect(() => {
    let active = true;
    Promise.all([api.missions.history(), api.activities.list()])
      .then(([histRes, actRes]) => {
        if (!active) return;
        const ongoing = histRes.sessions.find((s) => s.status === 'active');
        if (!ongoing) return;
        const matchedActivity = actRes.activities.find((a) => a.id === ongoing.activityId);
        const startedMs = new Date(ongoing.startedAt).getTime();
        const elapsed = Number.isFinite(startedMs)
          ? Math.max(0, Math.floor((Date.now() - startedMs) / 1000))
          : 0;
        const totalPlannedSecs = ongoing.plannedMinutes * 60;
        setActiveSession(ongoing);
        setElapsedSeconds(elapsed);
        setTimerSecondsLeft(Math.max(0, totalPlannedSecs - elapsed));
        setTimerRunning(true);
        if (matchedActivity) {
          setSelectedActivity(matchedActivity);
        }
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setLoadError('');
    Promise.all([
      api.activities.recommended({ mood, minutes: availableMinutes, limit: 3 }),
      showAllCategories
        ? api.activities.list({ category: category === 'All' ? undefined : category })
        : Promise.resolve({ activities: [] as Activity[] }),
    ])
      .then(([rec, list]) => {
        if (!active) return;
        setRecommended(rec.activities.slice(0, 3));
        setAllActivities(list.activities);
      })
      .catch((err) => {
        if (!active) return;
        setLoadError(err instanceof Error ? err.message : 'Unable to load offline activities.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [mood, availableMinutes, category, showAllCategories]);

  useEffect(() => {
    if (!timerRunning) return;
    const interval = window.setInterval(() => {
      setTimerSecondsLeft((prev) => (prev > 0 ? prev - 1 : 0));
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);
    return () => window.clearInterval(interval);
  }, [timerRunning]);

  const beginMissionTimer = async (act: Activity, customMinutes?: number) => {
    const mins = customMinutes || act.durationMinutes;
    setCompletionInfo(null);
    setFormError('');
    try {
      const res = await api.missions.start(act.id, mins);
      setActiveSession(res.session);
      setSelectedActivity(act);
      setTimerSecondsLeft(mins * 60);
      setElapsedSeconds(0);
      setTimerRunning(true);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Unable to start offline timer.');
    }
  };

  const completeMission = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeSession) return;
    setFormError('');
    setSubmitting(true);
    try {
      const res = await api.missions.complete(activeSession.id, {
        whatDidYouDo,
        whatDidYouLearn,
        howDidYouFeel,
        elapsedSeconds: Math.max(elapsedSeconds, 60),
      });
      const elName = WORLD_ELEMENTS_META[res.session.worldElement].name;
      setUser(res.user);
      setTimerRunning(false);
      setActiveSession(null);
      setSelectedActivity(null);
      setWhatDidYouDo('');
      setWhatDidYouLearn('');
      setHowDidYouFeel('');
      setCompletionInfo({
        message: `Self-reported session and reflection saved to your journal. ${elName} grew from your real-world time.`,
        elementId: res.session.worldElement,
        worldGrowth: res.worldGrowth,
      });
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Please briefly share what you did offline.');
    } finally {
      setSubmitting(false);
    }
  };

  const cancelMission = async () => {
    if (!activeSession) return;
    await api.missions.complete(activeSession.id, { status: 'cancelled' }).catch(() => {});
    setTimerRunning(false);
    setActiveSession(null);
  };

  const askGeminiIdeas = async () => {
    setAiLoading(true);
    setAiError('');
    try {
      const res = await api.ai.recommendActivities({ mood, availableMinutes });
      setAiIdeas(res.suggestions.slice(0, 3));
    } catch (err) {
      setAiError(err instanceof Error ? err.message : 'Fresh ideas unavailable right now.');
    } finally {
      setAiLoading(false);
    }
  };

  const formatMMSS = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const elementBadge = (el: WorldElementId) => {
    if (el === 'tree') return { label: 'Grows The Tree', cls: 'text-[#2D6A1E] bg-[#9BE52E]/25' };
    if (el === 'car') return { label: 'Grows The Car', cls: 'text-[#1E4EB8] bg-[#416FD2]/12' };
    return { label: 'Grows The House', cls: 'text-[#B83A1C] bg-[#FFF0C9]' };
  };

  const displayedActivities = showAllCategories && category !== 'All' ? allActivities : recommended;
  const completedStage = completionInfo?.worldGrowth?.[completionInfo.elementId];

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-3xl font-extrabold">
            <BrushHeading accentColor="#C83E1B">LET ME CHOOSE.</BrushHeading>
          </h2>
          <p className="text-sm text-[#465873] max-w-2xl">
            Pick how you feel and how many minutes you have. We suggest up to 3 practical offline activities so you can step away immediately.
          </p>
        </div>

        <button
          type="button"
          disabled={aiLoading}
          onClick={askGeminiIdeas}
          className="inline-flex items-center justify-center gap-2 min-h-[44px] px-4 py-2.5 rounded-xl bg-[#1E4EB8] text-white text-sm font-semibold hover:bg-[#126EB2] cursor-pointer disabled:opacity-60 shrink-0"
        >
          <Sparkles className="w-4 h-4" aria-hidden="true" />
          <span>{aiLoading ? 'Generating...' : 'Suggest 3 Fresh Ideas'}</span>
        </button>
      </div>

      {/* World Growth Completion Card */}
      {completionInfo && (
        <div
          role="status"
          className="p-5 sm:p-6 rounded-3xl bg-[#9BE52E]/20 border border-[#78C943] space-y-3"
        >
          <div className="flex items-start gap-2.5 text-sm font-semibold text-[#0F2544]">
            <CheckCircle2 className="w-5 h-5 text-[#2D6A1E] shrink-0 mt-0.5" aria-hidden="true" />
            <span>{completionInfo.message}</span>
          </div>
          {completedStage && (
            <div className="bg-white rounded-2xl p-4 border border-[#0F2544]/10 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-[#126EB2]">
                  {WORLD_ELEMENTS_META[completionInfo.elementId].name} · {completedStage.stageTitle}
                </span>
                <span className="text-[#465873] tabular-nums">Stage {completedStage.stage}/4</span>
              </div>
              <div className="h-2 rounded-full bg-[#FFF0C9] overflow-hidden">
                <div
                  className="h-full bg-[#22BFAE] rounded-full transition-all duration-300"
                  style={{ width: `${completedStage.progressPercent}%` }}
                />
              </div>
              <p className="text-xs text-[#465873]">{completedStage.nextMilestoneText}</p>
            </div>
          )}
          {onNavigate && (
            <div className="flex flex-wrap gap-3 pt-1">
              <button
                type="button"
                onClick={() => onNavigate('world')}
                className="inline-flex items-center gap-1.5 min-h-[40px] px-4 py-2 rounded-xl bg-[#1E4EB8] text-white text-xs font-bold hover:bg-[#126EB2] cursor-pointer"
              >
                <span>See Growth in My World</span>
                <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={() => onNavigate('journal')}
                className="inline-flex items-center gap-1.5 min-h-[40px] px-4 py-2 rounded-xl bg-white border border-[#0F2544]/15 text-[#0F2544] text-xs font-semibold hover:bg-[#FFF0C9]/50 cursor-pointer"
              >
                <span>View Reflection in Journal</span>
              </button>
            </div>
          )}
        </div>
      )}

      {loadError && (
        <div role="alert" className="p-4 rounded-2xl bg-red-50 border border-red-200 text-sm text-red-800">
          {loadError}
        </div>
      )}

      {/* Active Offline Timer Panel */}
      {activeSession && (
        <section
          aria-label="Active offline timer"
          className="bg-[#1E4EB8] text-white rounded-3xl p-6 sm:p-8 space-y-6 shadow-md"
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <p className="text-xs font-bold tracking-wide text-[#FFF0C9]">
                SELF-REPORTED OFFLINE SESSION · {activeSession.category.toUpperCase()}
              </p>
              <h3 className="text-2xl sm:text-3xl font-extrabold">
                Put the screen down and go live it.
              </h3>
              <p className="text-sm text-white/90">
                Activity: <strong>{selectedActivity?.title || activeSession.activityTitle}</strong>
              </p>
              <p className="text-xs text-white/75">
                Note: Findikoo never tracks your phone or monitors background apps. Your reflection logs this session.
              </p>
            </div>
            <div className="text-4xl sm:text-5xl font-extrabold font-mono tabular-nums bg-white/15 px-6 py-4 rounded-2xl text-center">
              {formatMMSS(timerSecondsLeft)}
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => setTimerRunning((r) => !r)}
              className="inline-flex items-center gap-2 min-h-[44px] px-4 py-2 rounded-xl bg-white text-[#0F2544] text-sm font-bold cursor-pointer"
            >
              {timerRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              <span>{timerRunning ? 'Pause Timer' : 'Resume Timer'}</span>
            </button>
            <button
              type="button"
              onClick={cancelMission}
              className="inline-flex items-center gap-2 min-h-[44px] px-4 py-2 rounded-xl bg-white/15 text-white text-sm font-semibold hover:bg-white/25 cursor-pointer"
            >
              <XCircle className="w-4 h-4" />
              <span>Cancel Session</span>
            </button>
          </div>

          <form onSubmit={completeMission} className="bg-white text-[#0F2544] rounded-2xl p-5 sm:p-6 space-y-4">
            <h4 className="font-bold text-base">
              When you return, log your self-reported offline reflection:
            </h4>
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label htmlFor="m-did" className="block text-xs font-bold mb-1">
                  What did you actually do? *
                </label>
                <input
                  id="m-did"
                  type="text"
                  required
                  value={whatDidYouDo}
                  onChange={(e) => setWhatDidYouDo(e.target.value)}
                  placeholder="e.g. Sketched two trees outside"
                  className="w-full min-h-[44px] px-3.5 py-2 rounded-xl border border-[#0F2544]/20 text-sm"
                />
              </div>
              <div>
                <label htmlFor="m-learned" className="block text-xs font-bold mb-1">
                  Optional note or takeaway
                </label>
                <input
                  id="m-learned"
                  type="text"
                  value={whatDidYouLearn}
                  onChange={(e) => setWhatDidYouLearn(e.target.value)}
                  placeholder="e.g. Felt noticeably calmer afterward"
                  className="w-full min-h-[44px] px-3.5 py-2 rounded-xl border border-[#0F2544]/20 text-sm"
                />
              </div>
              <div>
                <label htmlFor="m-feel" className="block text-xs font-bold mb-1">
                  How did you feel?
                </label>
                <input
                  id="m-feel"
                  type="text"
                  value={howDidYouFeel}
                  onChange={(e) => setHowDidYouFeel(e.target.value)}
                  placeholder="e.g. Grounded and present"
                  className="w-full min-h-[44px] px-3.5 py-2 rounded-xl border border-[#0F2544]/20 text-sm"
                />
              </div>
            </div>
            {formError && (
              <p role="alert" className="text-xs text-red-700 font-semibold">
                {formError}
              </p>
            )}
            <button
              type="submit"
              disabled={submitting}
              className="min-h-[44px] px-5 py-2.5 rounded-xl bg-[#9BE52E] text-[#0F2544] font-extrabold text-sm hover:bg-[#8cd620] cursor-pointer disabled:opacity-60"
            >
              {submitting ? 'Saving...' : 'Complete Session & Grow My World'}
            </button>
          </form>
        </section>
      )}

      {/* Activity Details & First Action Panel */}
      {selectedActivity && !activeSession && (
        <section className="bg-[#FFF0C9] rounded-3xl p-6 sm:p-7 border border-[#F4C324]/50 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2 text-xs font-bold text-[#126EB2]">
                <span>{selectedActivity.category}</span>
                <span aria-hidden="true">·</span>
                <span>{WORLD_ELEMENTS_META[selectedActivity.worldElement].name} Growth</span>
                <span aria-hidden="true">·</span>
                <span>{selectedActivity.difficulty}</span>
              </div>
              <h3 className="text-2xl font-extrabold">{selectedActivity.title}</h3>
            </div>
            <button
              type="button"
              onClick={() => setSelectedActivity(null)}
              className="self-start min-h-[40px] px-3 py-1.5 rounded-lg text-xs font-semibold text-[#0F2544] hover:bg-white/60 cursor-pointer"
            >
              Close details
            </button>
          </div>

          <p className="text-sm text-[#0F2544]/85">{selectedActivity.description}</p>

          <div className="grid sm:grid-cols-2 gap-3 text-xs">
            <div className="bg-white/80 rounded-xl p-3 flex items-center gap-2">
              <Package className="w-4 h-4 text-[#126EB2] shrink-0" aria-hidden="true" />
              <span>
                <strong>Materials:</strong> {selectedActivity.materialsNeeded}
              </span>
            </div>
            <div className="bg-white/80 rounded-xl p-3 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-[#2D6A1E] shrink-0" aria-hidden="true" />
              <span>
                <strong>Setting:</strong> {selectedActivity.outdoors ? 'Outdoors' : 'Indoors'} ·{' '}
                {selectedActivity.durationMinutes} min recommended
              </span>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-bold text-[#0F2544] mb-1.5">First steps to begin:</h4>
            <ol className="space-y-1 text-sm text-[#0F2544]/85 list-decimal list-inside">
              {selectedActivity.instructions.map((step, i) => (
                <li key={i}>{step}</li>
              ))}
            </ol>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 pt-2">
            <button
              type="button"
              onClick={() => beginMissionTimer(selectedActivity, selectedActivity.durationMinutes)}
              className="inline-flex items-center gap-2 min-h-[44px] px-5 py-2.5 rounded-xl bg-[#1E4EB8] text-white text-sm font-bold hover:bg-[#126EB2] cursor-pointer"
            >
              <Clock className="w-4 h-4" aria-hidden="true" />
              <span>Start {selectedActivity.durationMinutes}m Offline Timer</span>
            </button>
            {TIME_OPTIONS.filter((m) => m !== selectedActivity.durationMinutes).map((mins) => (
              <button
                key={mins}
                type="button"
                onClick={() => beginMissionTimer(selectedActivity, mins)}
                className="min-h-[44px] px-3.5 py-2 rounded-xl bg-white hover:bg-[#416FD2] hover:text-white text-xs font-bold border border-[#0F2544]/15 transition-colors cursor-pointer tabular-nums"
              >
                Or {mins}m
              </button>
            ))}
          </div>
        </section>
      )}

      {/* Simplified Mood & Minutes Filter (Hick–Hyman Law) */}
      <section className="bg-white rounded-3xl border border-[#0F2544]/10 p-5 sm:p-6 space-y-5">
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <span className="text-xs font-bold text-[#465873]">1. HOW DO YOU FEEL?</span>
            <div className="flex flex-wrap gap-2">
              {MOODS.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  aria-pressed={mood === m.id}
                  onClick={() => setMood(m.id)}
                  className={`min-h-[40px] px-3.5 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                    mood === m.id
                      ? 'bg-[#1E4EB8] text-white'
                      : 'bg-[#FFFDF6] border border-[#0F2544]/15 text-[#0F2544]'
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <span className="text-xs font-bold text-[#465873]">2. HOW MUCH TIME DO YOU HAVE?</span>
            <div className="flex flex-wrap gap-2">
              {TIME_OPTIONS.map((mins) => (
                <button
                  key={mins}
                  type="button"
                  aria-pressed={availableMinutes === mins}
                  onClick={() => setAvailableMinutes(mins)}
                  className={`min-h-[40px] px-3.5 py-2 rounded-xl text-xs font-semibold tabular-nums transition-colors cursor-pointer ${
                    availableMinutes === mins
                      ? 'bg-[#116D63] text-white'
                      : 'bg-[#FFFDF6] border border-[#0F2544]/15 text-[#0F2544]'
                  }`}
                >
                  {mins} min
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Progressive disclosure for browsing all categories */}
        <div className="pt-3 border-t border-[#0F2544]/10">
          <button
            type="button"
            onClick={() => setShowAllCategories((v) => !v)}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#1E4EB8] hover:underline cursor-pointer"
          >
            {showAllCategories ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            <span>{showAllCategories ? 'Hide category browser' : 'Browse by specific category instead'}</span>
          </button>

          {showAllCategories && (
            <div className="flex flex-wrap gap-1.5 mt-3">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  className={`min-h-[36px] px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer ${
                    category === cat
                      ? 'bg-[#FFF0C9] text-[#0F2544] font-bold'
                      : 'text-[#465873] hover:text-[#0F2544]'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Optional Gemini Suggestions */}
      {aiError && (
        <div role="alert" className="p-4 rounded-2xl bg-red-50 border border-red-200 text-sm text-red-800">
          {aiError}
        </div>
      )}
      {aiIdeas.length > 0 && (
        <section className="space-y-3">
          <h3 className="text-lg font-bold text-[#126EB2]">Fresh Offline Suggestions</h3>
          <div className="grid md:grid-cols-3 gap-4">
            {aiIdeas.map((idea, idx) => (
              <div key={idx} className="bg-[#E8F6FC] rounded-2xl p-5 space-y-2 border border-[#126EB2]/20">
                <div className="text-xs font-semibold text-[#126EB2]">
                  {idea.category} · {idea.durationMinutes} min · {idea.outdoors ? 'Outdoors' : 'Indoors'}
                </div>
                <h4 className="font-bold text-base">{idea.title}</h4>
                <p className="text-xs text-[#0F2544]/85">{idea.description}</p>
                <p className="text-xs text-[#465873]">Materials: {idea.materialsNeeded}</p>
                <p className="text-xs font-semibold text-[#0F2544] pt-1">
                  First step: {idea.firstStep}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Curated Recommendations (Max 3 initially) */}
      <section className="space-y-4">
        <div className="flex items-baseline justify-between gap-2">
          <h3 className="text-xl font-extrabold">
            {showAllCategories && category !== 'All'
              ? `${category} Activities`
              : '3 Curated Choices Right Now'}
          </h3>
          <span className="text-xs text-[#465873]">Small list on purpose—pick one and step away</span>
        </div>

        {loading ? (
          <div className="grid md:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-52 rounded-3xl bg-white border border-[#0F2544]/10 animate-pulse" />
            ))}
          </div>
        ) : displayedActivities.length === 0 ? (
          <div className="bg-white rounded-3xl border border-[#0F2544]/10 p-6 text-sm text-[#465873]">
            No activities matched that exact category filter. Try switching back to curated recommendations.
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {displayedActivities.map((act) => {
              const badge = elementBadge(act.worldElement);
              return (
                <article
                  key={act.id}
                  className="bg-white rounded-3xl border border-[#0F2544]/10 p-6 flex flex-col justify-between space-y-4 hover:border-[#1E4EB8]/40 transition-colors"
                >
                  <div className="space-y-2.5">
                    <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                      <span className="font-bold text-[#126EB2]">
                        {act.category} · {act.durationMinutes} min
                      </span>
                      <span className={`px-2.5 py-0.5 rounded-lg font-bold ${badge.cls}`}>
                        {badge.label}
                      </span>
                    </div>
                    <h4 className="text-lg font-extrabold leading-snug">{act.title}</h4>
                    <p className="text-sm text-[#465873] leading-relaxed">{act.description}</p>
                    <div className="text-xs text-[#0F2544]/80 space-y-1 pt-1">
                      <div>
                        <strong>Materials:</strong> {act.materialsNeeded}
                      </div>
                      <div>
                        <strong>Why now:</strong> {act.relevanceReason}
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setSelectedActivity(act)}
                    className="w-full min-h-[44px] inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-[#1E4EB8] text-white text-xs font-bold hover:bg-[#126EB2] cursor-pointer"
                  >
                    <Clock className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>View Steps &amp; Start Timer</span>
                  </button>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}

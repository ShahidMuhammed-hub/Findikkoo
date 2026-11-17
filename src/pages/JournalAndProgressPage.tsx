import React, { useEffect, useState } from 'react';
import { Trees, Home, Car, BookOpen, Sparkles, CheckCircle2, Award } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';
import { computeWorldGrowth, type MilestoneDefinition, type WorldGrowthState } from '../shared/rules';
import type { JournalEntry, NotificationItem } from '../shared/types';
import { BrushHeading } from '../illustrations/BrushTypography';

const INITIAL_GROWTH: WorldGrowthState = computeWorldGrowth({
  treeMissions: 0,
  houseMissions: 0,
  carMissions: 0,
  skillsCount: 0,
  skillPracticeSessions: 0,
  approvedChallenges: 0,
  projectsCount: 0,
  projectUpdatesCount: 0,
  approvedProjects: 0,
  connectionsCount: 0,
  communityJoinedCount: 0,
  journalCount: 0,
});

export function JournalAndProgressPage() {
  const { refreshUser } = useAuth();
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [milestones, setMilestones] = useState<MilestoneDefinition[]>([]);
  const [worldGrowth, setWorldGrowth] = useState<WorldGrowthState>(INITIAL_GROWTH);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [stats, setStats] = useState({
    completedMissions: 0,
    declaredOfflineMinutes: 0,
    skillsCount: 0,
    skillPracticeSessions: 0,
    challengesSubmitted: 0,
    challengesVerified: 0,
    projectsCreated: 0,
    projectsVerified: 0,
    communityJoined: 0,
    connectionsCount: 0,
    journalCount: 0,
  });
  const [loadingData, setLoadingData] = useState(true);
  const [loadError, setLoadError] = useState('');

  // Journal form
  const [title, setTitle] = useState('');
  const [activityDone, setActivityDone] = useState('');
  const [learned, setLearned] = useState('');
  const [feeling, setFeeling] = useState('');
  const [privacy, setPrivacy] = useState<'private' | 'connections'>('private');
  const [savedMsg, setSavedMsg] = useState('');
  const [saveError, setSaveError] = useState('');
  const [savingJournal, setSavingJournal] = useState(false);

  // Weekly Reflection
  const [weeklySummary, setWeeklySummary] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState('');

  useEffect(() => {
    setLoadingData(true);
    Promise.all([api.journal.list(), api.progress.get()])
      .then(([jr, prog]) => {
        setEntries(jr.entries);
        setStats(prog.stats);
        setWorldGrowth(prog.worldGrowth);
        setMilestones(prog.milestones);
        setNotifications(prog.notifications);
      })
      .catch((err) => {
        setLoadError(err instanceof Error ? err.message : 'Unable to load journal and progress.');
      })
      .finally(() => {
        setLoadingData(false);
      });
  }, []);

  const handleSaveJournal = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavedMsg('');
    setSaveError('');
    setSavingJournal(true);
    try {
      const res = await api.journal.create({
        title,
        activityDone,
        learned,
        feeling,
        privacy,
      });
      setEntries((prev) => [res.entry, ...prev]);
      const prog = await api.progress.get();
      setStats(prog.stats);
      setWorldGrowth(prog.worldGrowth);
      setMilestones(prog.milestones);
      await refreshUser();
      setTitle('');
      setActivityDone('');
      setLearned('');
      setFeeling('');
      setSavedMsg('Journal reflection saved privately. The House grew.');
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Unable to save journal reflection.');
    } finally {
      setSavingJournal(false);
    }
  };

  const handleGenerateWeeklyReport = async () => {
    setAiLoading(true);
    setAiError('');
    try {
      const res = await api.ai.weeklySummary();
      setWeeklySummary(res.summary);
    } catch (err) {
      setAiError(err instanceof Error ? err.message : 'Weekly reflection unavailable right now.');
    } finally {
      setAiLoading(false);
    }
  };

  const handleMarkRead = async () => {
    try {
      await api.progress.markNotificationsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch {
      // ignore read failure silently
    }
  };

  return (
    <div className="space-y-10">
      <div className="space-y-1">
        <h2 className="text-3xl font-extrabold">
          <BrushHeading accentColor="#124E96">JOURNAL &amp; PROGRESS.</BrushHeading>
        </h2>
        <p className="text-sm text-[#465873]">
          Honest reflections and meaningful offline milestones—zero streak anxiety, guilt counters, or virtual currencies.
        </p>
      </div>

      {loadError && (
        <div role="alert" className="p-4 rounded-2xl bg-red-50 border border-red-200 text-sm text-red-800">
          {loadError}
        </div>
      )}

      {/* Honest Self-Reported & Verified Progress Strip */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-[#0F2544]/10 p-4">
          <div className="text-xs text-[#465873]">Offline Minutes (self-reported)</div>
          <div className="text-2xl font-extrabold tabular-nums mt-1">{stats.declaredOfflineMinutes}</div>
        </div>
        <div className="bg-white rounded-2xl border border-[#0F2544]/10 p-4">
          <div className="text-xs text-[#465873]">Activities Completed (self-reported)</div>
          <div className="text-2xl font-extrabold tabular-nums mt-1">{stats.completedMissions}</div>
        </div>
        <div className="bg-white rounded-2xl border border-[#0F2544]/10 p-4">
          <div className="text-xs text-[#465873]">Skills &amp; Practice Sessions</div>
          <div className="text-2xl font-extrabold tabular-nums mt-1">
            {stats.skillsCount} ({stats.skillPracticeSessions} sessions)
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-[#0F2544]/10 p-4">
          <div className="text-xs text-[#465873]">Reviewer-Verified Work</div>
          <div className="text-2xl font-extrabold tabular-nums mt-1 text-[#2D6A1E]">
            {stats.challengesVerified + stats.projectsVerified}
          </div>
          <div className="text-[11px] text-[#465873] mt-0.5">
            {stats.projectsCreated} project{stats.projectsCreated === 1 ? '' : 's'} started total
          </div>
        </div>
      </section>

      {/* World Growth Summary Strip (Tree, House, Car) */}
      <section className="grid sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-[#0F2544]/10 p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#9BE52E]/25 flex items-center justify-center shrink-0">
            <Trees className="w-5 h-5 text-[#2D6A1E]" aria-hidden="true" />
          </div>
          <div>
            <div className="text-xs font-bold text-[#2D6A1E]">The Tree · Stage {worldGrowth.tree.stage}/4</div>
            <div className="font-bold text-sm">{worldGrowth.tree.stageTitle}</div>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-[#0F2544]/10 p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#FFF0C9] flex items-center justify-center shrink-0">
            <Home className="w-5 h-5 text-[#B83A1C]" aria-hidden="true" />
          </div>
          <div>
            <div className="text-xs font-bold text-[#B83A1C]">The House · Stage {worldGrowth.house.stage}/4</div>
            <div className="font-bold text-sm">{worldGrowth.house.stageTitle}</div>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-[#0F2544]/10 p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#416FD2]/12 flex items-center justify-center shrink-0">
            <Car className="w-5 h-5 text-[#1E4EB8]" aria-hidden="true" />
          </div>
          <div>
            <div className="text-xs font-bold text-[#1E4EB8]">The Car · Stage {worldGrowth.car.stage}/4</div>
            <div className="font-bold text-sm">{worldGrowth.car.stageTitle}</div>
          </div>
        </div>
      </section>

      {/* Weekly Reflection + Notifications */}
      <section className="grid lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-7 bg-[#E8F6FC] rounded-3xl border border-[#126EB2]/20 p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-xl font-extrabold">Weekly Reflection</h3>
              <p className="text-xs text-[#465873]">
                A gentle look at where your offline time and craft went.
              </p>
            </div>
            <button
              type="button"
              disabled={aiLoading}
              onClick={handleGenerateWeeklyReport}
              className="inline-flex items-center gap-2 min-h-[42px] px-4 py-2 rounded-xl bg-[#1E4EB8] text-white text-xs font-bold hover:bg-[#126EB2] cursor-pointer disabled:opacity-60 shrink-0"
            >
              <Sparkles className="w-3.5 h-3.5" aria-hidden="true" />
              <span>{aiLoading ? 'Summarizing...' : 'Generate Reflection'}</span>
            </button>
          </div>

          {aiError && <p role="alert" className="text-xs text-red-700 font-medium">{aiError}</p>}
          {weeklySummary ? (
            <div className="bg-white rounded-2xl p-4 text-sm text-[#0F2544]/90 whitespace-pre-line leading-relaxed">
              {weeklySummary}
            </div>
          ) : (
            <div className="bg-white/80 rounded-2xl p-4 text-sm text-[#0F2544]/85">
              So far you have logged <strong>{stats.completedMissions}</strong> self-reported offline activities ({stats.declaredOfflineMinutes} min), tracked <strong>{stats.skillsCount}</strong> skills, and started <strong>{stats.projectsCreated}</strong> original projects.
            </div>
          )}
        </div>

        <div className="lg:col-span-5 bg-white rounded-3xl border border-[#0F2544]/10 p-6 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-extrabold">Review &amp; Activity Updates</h3>
            {notifications.length > 0 && (
              <button
                type="button"
                onClick={handleMarkRead}
                className="text-xs font-semibold text-[#1E4EB8] hover:underline cursor-pointer"
              >
                Mark all read
              </button>
            )}
          </div>
          {notifications.length === 0 ? (
            <p className="text-sm text-[#465873]">No updates yet—no intrusive alerts here.</p>
          ) : (
            <div className="space-y-2.5">
              {notifications.map((n) => (
                <div
                  key={n.id}
                  className={`p-3 rounded-2xl text-xs border ${
                    n.read ? 'bg-[#FFFDF6] border-[#0F2544]/10' : 'bg-[#FFF0C9]/60 border-[#F4C324]'
                  }`}
                >
                  <div className="font-bold">{n.title}</div>
                  <div className="text-[#465873] mt-0.5">{n.message}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* World Growth Milestones */}
      <section className="space-y-4">
        <h3 className="text-2xl font-extrabold flex items-center gap-2">
          <Award className="w-6 h-6 text-[#1E4EB8]" aria-hidden="true" />
          <span>World Growth Milestones</span>
        </h3>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {milestones.map((m) => (
            <div
              key={m.id}
              className={`rounded-2xl p-4 border space-y-1 ${
                m.earned
                  ? 'bg-[#FFF0C9]/65 border-[#F4C324]'
                  : 'bg-white border-[#0F2544]/10'
              }`}
            >
              <div className={`text-xs font-bold ${m.earned ? 'text-[#2D6A1E]' : 'text-[#465873]'}`}>
                {m.earned ? 'Reached' : 'Not yet reached'} · Grows {m.worldElement.toUpperCase()}
              </div>
              <div className="font-bold text-sm">{m.name}</div>
              <p className="text-xs text-[#465873]">{m.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Private Journal */}
      <section className="grid lg:grid-cols-12 gap-6 items-start">
        <form
          onSubmit={handleSaveJournal}
          className="lg:col-span-5 bg-white rounded-3xl border border-[#0F2544]/10 p-6 space-y-3.5"
        >
          <h3 className="text-xl font-extrabold flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-[#116D63]" aria-hidden="true" />
            <span>Write in Your Private Journal</span>
          </h3>
          <div>
            <label htmlFor="jr-title" className="block text-xs font-bold mb-1">
              Memory Title *
            </label>
            <input
              id="jr-title"
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Afternoon walk without headphones"
              className="w-full min-h-[42px] px-3.5 py-2 rounded-xl border border-[#0F2544]/20 text-sm"
            />
          </div>
          <div>
            <label htmlFor="jr-did" className="block text-xs font-bold mb-1">
              What did you do or experience? *
            </label>
            <textarea
              id="jr-did"
              required
              rows={2}
              value={activityDone}
              onChange={(e) => setActivityDone(e.target.value)}
              placeholder="Record your real-life activity..."
              className="w-full px-3.5 py-2 rounded-xl border border-[#0F2544]/20 text-sm"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="jr-learn" className="block text-xs font-bold mb-1">
                What did you notice?
              </label>
              <input
                id="jr-learn"
                type="text"
                value={learned}
                onChange={(e) => setLearned(e.target.value)}
                className="w-full min-h-[42px] px-3 py-2 rounded-xl border border-[#0F2544]/20 text-sm"
              />
            </div>
            <div>
              <label htmlFor="jr-feel" className="block text-xs font-bold mb-1">
                How did you feel?
              </label>
              <input
                id="jr-feel"
                type="text"
                value={feeling}
                onChange={(e) => setFeeling(e.target.value)}
                className="w-full min-h-[42px] px-3 py-2 rounded-xl border border-[#0F2544]/20 text-sm"
              />
            </div>
          </div>
          <div>
            <label htmlFor="jr-privacy" className="block text-xs font-bold mb-1">
              Entry Privacy
            </label>
            <select
              id="jr-privacy"
              value={privacy}
              onChange={(e) => setPrivacy(e.target.value as 'private' | 'connections')}
              className="w-full min-h-[42px] px-3 py-2 rounded-xl border border-[#0F2544]/20 text-sm bg-white"
            >
              <option value="private">Private (Only Me)</option>
              <option value="connections">My Real-World Circle</option>
            </select>
          </div>
          {saveError && <p role="alert" className="text-xs text-red-700 font-semibold">{saveError}</p>}
          {savedMsg && (
            <p role="status" className="text-xs font-semibold text-[#2D6A1E] flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 shrink-0" aria-hidden="true" />
              <span>{savedMsg}</span>
            </p>
          )}
          <button
            type="submit"
            disabled={savingJournal}
            className="w-full min-h-[44px] py-2.5 px-4 rounded-xl bg-[#116D63] text-white text-sm font-bold hover:bg-[#0D564E] cursor-pointer disabled:opacity-60"
          >
            {savingJournal ? 'Saving...' : 'Save Private Reflection'}
          </button>
        </form>

        <div className="lg:col-span-7 space-y-3">
          <h3 className="text-xl font-extrabold">Saved Reflections</h3>
          {loadingData ? (
            <div className="h-32 rounded-2xl bg-white border border-[#0F2544]/10 animate-pulse" />
          ) : entries.length === 0 ? (
            <div className="bg-white rounded-2xl border border-[#0F2544]/10 p-6 text-sm text-[#465873]">
              No journal entries yet. Your offline reflections are private to you and help The House grow.
            </div>
          ) : (
            entries.map((entry) => (
              <article key={entry.id} className="bg-white rounded-2xl border border-[#0F2544]/10 p-5 space-y-1.5">
                <div className="flex items-center justify-between text-xs text-[#465873]">
                  <span className="capitalize font-semibold">{entry.privacy} · Self-reported</span>
                  <span>{new Date(entry.createdAt).toLocaleDateString()}</span>
                </div>
                <h4 className="font-bold text-base">{entry.title}</h4>
                <p className="text-sm text-[#0F2544]/85">{entry.activityDone}</p>
                {entry.learned && (
                  <p className="text-xs text-[#126EB2]">Reflection: {entry.learned}</p>
                )}
              </article>
            ))
          )}
        </div>
      </section>
    </div>
  );
}

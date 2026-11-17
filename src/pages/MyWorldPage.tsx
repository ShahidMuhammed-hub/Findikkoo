import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { ArrowRight, Compass, Sparkles, Trees, Home, Car, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { MyWorldMap } from '../illustrations/MyWorldMap';
import { BrushHeading } from '../illustrations/BrushTypography';
import { api } from '../services/api';
import { WORLD_ELEMENTS_META, computeWorldGrowth, type WorldGrowthState } from '../shared/rules';
import type { Activity, WorldElementId } from '../shared/types';
import type { AppRoute } from '../layouts/AppShell';

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

export function MyWorldPage({
  onNavigate,
  onStartActivity,
}: {
  onNavigate: (route: AppRoute) => void;
  onStartActivity: (activity: Activity) => void;
}) {
  const { user } = useAuth();
  const [selectedId, setSelectedId] = useState<WorldElementId>('tree');
  const [worldGrowth, setWorldGrowth] = useState<WorldGrowthState>(INITIAL_GROWTH);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [stats, setStats] = useState({
    completedMissions: 0,
    declaredOfflineMinutes: 0,
    skillsCount: 0,
    projectsCreated: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError('');
    Promise.all([api.progress.get(), api.activities.list()])
      .then(([prog, actRes]) => {
        if (!active) return;
        setWorldGrowth(prog.worldGrowth);
        setStats({
          completedMissions: prog.stats.completedMissions,
          declaredOfflineMinutes: prog.stats.declaredOfflineMinutes,
          skillsCount: prog.stats.skillsCount,
          projectsCreated: prog.stats.projectsCreated,
        });
        setActivities(actRes.activities);
      })
      .catch((err) => {
        if (!active) return;
        setError(err instanceof Error ? err.message : 'Unable to load your personal world.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [user?.id, user?.declaredOfflineMinutes, user?.completedActivityIds.length]);

  if (!user) return null;

  const selectedMeta = WORLD_ELEMENTS_META[selectedId];
  const selectedStage = worldGrowth[selectedId];
  const matchingActivities = activities.filter((a) => a.worldElement === selectedId).slice(0, 2);

  const elementCards: {
    id: WorldElementId;
    title: string;
    focus: string;
    icon: typeof Trees;
    accentBg: string;
    accentText: string;
  }[] = [
    {
      id: 'tree',
      title: 'The Tree',
      focus: 'Personal growth & skills',
      icon: Trees,
      accentBg: 'bg-[#9BE52E]/25',
      accentText: 'text-[#2D6A1E]',
    },
    {
      id: 'house',
      title: 'The House',
      focus: 'Offline life & relationships',
      icon: Home,
      accentBg: 'bg-[#FFF0C9]',
      accentText: 'text-[#B83A1C]',
    },
    {
      id: 'car',
      title: 'The Car',
      focus: 'Original projects & creation',
      icon: Car,
      accentBg: 'bg-[#416FD2]/12',
      accentText: 'text-[#1E4EB8]',
    },
  ];

  return (
    <div className="space-y-6">
      {/* World Header */}
      <section className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-1">
          <p className="text-xs font-bold tracking-wide text-[#1E4EB8]">
            WORLD GROWTH ONLY · {user.isDemoAccount ? 'DEMONSTRATION PROFILE' : 'PERSONAL WORLD (18+)'}
          </p>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            <BrushHeading accentColor="#124E96">YOUR LIVING WORLD.</BrushHeading>
          </h2>
          <p className="text-sm text-[#465873] max-w-2xl">
            Select your Tree, House, or Car in the scene below to see what is growing and pick your next offline step.
          </p>
        </div>

        <div className="flex flex-wrap gap-3 shrink-0">
          <button
            type="button"
            onClick={() => onNavigate('choose')}
            className="inline-flex items-center gap-2 min-h-[44px] px-5 py-2.5 rounded-xl bg-[#1E4EB8] text-white text-sm font-semibold hover:bg-[#126EB2] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Compass className="w-4 h-4" aria-hidden="true" />
            <span>Choose Offline Activity</span>
          </button>
        </div>
      </section>

      {error && (
        <div role="alert" className="p-4 rounded-2xl bg-red-50 border border-red-200 text-sm font-medium text-red-800">
          {error}
        </div>
      )}

      {/* Primary Focal Anchor: Interactive World Map + Selected Element Inspector */}
      <section className="grid lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-8 space-y-4">
          {loading ? (
            <div className="h-[340px] sm:h-[440px] rounded-3xl bg-[#FFF0C9]/50 border border-[#0F2544]/10 animate-pulse" />
          ) : (
            <MyWorldMap
              worldGrowth={worldGrowth}
              selectedId={selectedId}
              onSelect={(id) => setSelectedId(id)}
            />
          )}

          {/* Element Stage Quick Switcher Row Directly Below Map */}
          <div aria-label="World elements summary" className="grid sm:grid-cols-3 gap-3">
            {elementCards.map((card) => {
              const Icon = card.icon;
              const stageInfo = worldGrowth[card.id];
              const isSelected = selectedId === card.id;
              return (
                <button
                  key={card.id}
                  type="button"
                  aria-pressed={isSelected}
                  onClick={() => setSelectedId(card.id)}
                  className={`text-left rounded-2xl border p-4 transition-all cursor-pointer space-y-2 ${
                    isSelected
                      ? 'bg-white border-[#1E4EB8] ring-2 ring-[#1E4EB8]/30 shadow-xs'
                      : 'bg-white border-[#0F2544]/10 hover:border-[#1E4EB8]/40'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className={`w-8 h-8 rounded-xl ${card.accentBg} flex items-center justify-center`}>
                      <Icon className={`w-4 h-4 ${card.accentText}`} aria-hidden="true" />
                    </div>
                    <span className="text-xs font-bold text-[#465873] tabular-nums">
                      Stage {stageInfo.stage}/4
                    </span>
                  </div>
                  <div>
                    <div className="font-extrabold text-sm text-[#0F2544]">{card.title}</div>
                    <div className="text-xs font-semibold text-[#126EB2] truncate">{stageInfo.stageTitle}</div>
                    <div className="text-[11px] text-[#465873] mt-0.5">{card.focus}</div>
                  </div>
                  <div className="h-1.5 rounded-full bg-[#FFF0C9] overflow-hidden">
                    <div
                      className="h-full bg-[#22BFAE] rounded-full transition-all duration-300"
                      style={{ width: `${stageInfo.progressPercent}%` }}
                    />
                  </div>
                </button>
              );
            })}
          </div>

          {/* Honest Self-Reported & Offline Summary Strip */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-white rounded-2xl border border-[#0F2544]/10 p-4">
              <div className="text-xs text-[#465873]">Self-reported offline time</div>
              <div className="text-xl font-extrabold tabular-nums mt-0.5">
                {stats.declaredOfflineMinutes} min
              </div>
            </div>
            <div className="bg-white rounded-2xl border border-[#0F2544]/10 p-4">
              <div className="text-xs text-[#465873]">Activities completed</div>
              <div className="text-xl font-extrabold tabular-nums mt-0.5">
                {stats.completedMissions}
              </div>
            </div>
            <div className="bg-white rounded-2xl border border-[#0F2544]/10 p-4">
              <div className="text-xs text-[#465873]">Skills &amp; projects</div>
              <div className="text-xl font-extrabold tabular-nums mt-0.5">
                {stats.skillsCount + stats.projectsCreated}
              </div>
            </div>
          </div>
        </div>

        {/* Selected Element Inspector */}
        <motion.aside
          key={selectedId}
          initial={{ opacity: 0.85, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
          className="lg:col-span-4 bg-white rounded-3xl border border-[#0F2544]/10 p-6 space-y-5"
        >
          <div className="space-y-1.5">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-bold text-[#126EB2]">{selectedMeta.pillar}</span>
              <span className="text-xs font-semibold text-[#465873] tabular-nums">
                Stage {selectedStage.stage} / 4
              </span>
            </div>
            <h3 className="text-2xl font-extrabold">{selectedMeta.name}</h3>
            <p className="text-xs font-semibold text-[#116D63]">{selectedStage.stageTitle}</p>
            <p className="text-sm text-[#465873] leading-relaxed">{selectedMeta.role}</p>
            <p className="text-xs text-[#0F2544] bg-[#FFFDF6] border border-[#0F2544]/10 rounded-xl p-3">
              <strong>Current state:</strong> {selectedStage.visualDescription}
            </p>
          </div>

          <div className="space-y-2">
            <h4 className="text-xs font-bold tracking-wide text-[#465873]">
              REAL ACTIONS NURTURING {selectedMeta.name.toUpperCase()}
            </h4>
            {selectedStage.accomplishments.length === 0 ? (
              <p className="text-xs text-[#465873] leading-relaxed">
                Nothing logged here yet—start with one small real-world action below to watch {selectedMeta.name.toLowerCase()} grow.
              </p>
            ) : (
              <ul className="space-y-1.5">
                {selectedStage.accomplishments.map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-[#0F2544]">
                    <CheckCircle2 className="w-4 h-4 text-[#2D6A1E] shrink-0 mt-0.5" aria-hidden="true" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="p-3.5 rounded-2xl bg-[#FFF0C9]/70 border border-[#F4C324]/40 space-y-1.5">
            <div className="text-xs font-bold text-[#0F2544]">Next meaningful step</div>
            <p className="text-xs text-[#0F2544]/85 leading-relaxed">{selectedStage.nextMilestoneText}</p>
          </div>

          <button
            type="button"
            onClick={() => onNavigate(selectedMeta.actionRoute)}
            className="w-full min-h-[44px] inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#1E4EB8] text-white text-sm font-bold hover:bg-[#126EB2] transition-colors cursor-pointer"
          >
            <span>{selectedMeta.actionLabel}</span>
            <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </button>

          {matchingActivities.length > 0 && (
            <div className="space-y-2.5 pt-2 border-t border-[#0F2544]/10">
              <h4 className="text-xs font-bold tracking-wide text-[#465873]">
                CURATED FOR {selectedMeta.name.toUpperCase()}
              </h4>
              {matchingActivities.map((act) => (
                <div
                  key={act.id}
                  className="p-3.5 rounded-2xl bg-[#FFFDF6] border border-[#0F2544]/10 space-y-2"
                >
                  <div className="font-bold text-sm">{act.title}</div>
                  <div className="text-xs text-[#465873]">
                    {act.durationMinutes} min · {act.outdoors ? 'Outdoors' : 'Indoors'} · {act.materialsNeeded}
                  </div>
                  <button
                    type="button"
                    onClick={() => onStartActivity(act)}
                    className="inline-flex items-center gap-1.5 min-h-[40px] px-3.5 py-1.5 rounded-xl bg-[#FFF0C9] text-[#0F2544] text-xs font-bold hover:bg-[#F4C324]/60 cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-[#B83A1C]" aria-hidden="true" />
                    <span>Open Offline Session</span>
                  </button>
                </div>
              ))}
            </div>
          )}
        </motion.aside>
      </section>
    </div>
  );
}

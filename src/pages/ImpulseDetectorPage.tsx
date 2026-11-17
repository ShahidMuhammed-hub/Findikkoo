import { useEffect, useState } from 'react';
import { PauseCircle, ArrowRight, RefreshCw, ArrowLeft } from 'lucide-react';
import { api } from '../services/api';
import type { Activity, ImpulseTrigger } from '../shared/types';
import { WORLD_ELEMENTS_META } from '../shared/rules';
import { RoyalSkyScene } from '../illustrations/RoyalSkyScene';

const TRIGGERS: { id: ImpulseTrigger; label: string; hint: string }[] = [
  { id: 'bored', label: 'I feel bored', hint: 'Try a tactile 20-minute project or sketch.' },
  { id: 'stressed', label: 'I feel stressed', hint: 'Step away to quiet air or unhurried reading.' },
  { id: 'lonely', label: 'I feel lonely', hint: 'Reach out to one real person you care about.' },
  { id: 'habit', label: 'I opened my phone out of habit', hint: 'Reset attention with one small physical step.' },
  { id: 'break', label: 'I need a real break', hint: 'Give your eyes and mind screen-free rest.' },
];

export function ImpulseDetectorPage({
  onLaunchMission,
  onExit,
}: {
  onLaunchMission: (activity: Activity) => void;
  onExit: () => void;
}) {
  const [selectedTrigger, setSelectedTrigger] = useState<ImpulseTrigger | null>(null);
  const [pauseSeconds, setPauseSeconds] = useState<number | null>(null);
  const [alternatives, setAlternatives] = useState<Activity[]>([]);
  const [altIndex, setAltIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (pauseSeconds === null || pauseSeconds <= 0) return;
    const t = window.setTimeout(() => setPauseSeconds((s) => (s !== null ? s - 1 : null)), 1000);
    return () => window.clearTimeout(t);
  }, [pauseSeconds]);

  const handleSelectTrigger = async (trigger: ImpulseTrigger) => {
    setSelectedTrigger(trigger);
    setAltIndex(0);
    setLoading(true);
    setError('');
    try {
      const res = await api.activities.recommended({ impulse: trigger, limit: 3 });
      setAlternatives(res.activities);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load offline alternative.');
    } finally {
      setLoading(false);
    }
  };

  const primaryAlternative = alternatives[altIndex] ?? null;

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={onExit}
          className="inline-flex items-center gap-1.5 min-h-[40px] px-3 py-1.5 rounded-xl text-sm font-semibold text-[#1E4EB8] hover:bg-[#416FD2]/10 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" aria-hidden="true" />
          <span>Return to My World</span>
        </button>
      </div>

      {/* Calm Grounding Header */}
      <section className="relative rounded-3xl overflow-hidden bg-[#416FD2] text-white p-7 sm:p-10">
        <RoyalSkyScene showCyclist={false} />
        <div className="relative z-10 max-w-2xl space-y-4">
          <p className="text-xs font-bold tracking-wide text-[#FFF0C9]">CALM PAUSE · NO GUILT</p>
          <h2 className="text-3xl sm:text-4xl font-extrabold">
            Take a moment before you scroll.
          </h2>
          <p className="text-sm sm:text-base text-white/95 leading-relaxed">
            Reaching for a feed is often a signal, not a failure. Take a five-second breath if helpful, name what you need, and step into one practical alternative.
          </p>

          <div className="pt-1">
            <button
              type="button"
              onClick={() => setPauseSeconds(5)}
              className="inline-flex items-center gap-2 min-h-[44px] px-5 py-2.5 rounded-xl bg-[#9BE52E] text-[#0F2544] font-bold text-sm hover:bg-[#aaef3f] cursor-pointer"
            >
              <PauseCircle className="w-4 h-4" aria-hidden="true" />
              <span>
                {pauseSeconds && pauseSeconds > 0
                  ? `Breathe slowly... ${pauseSeconds}s`
                  : pauseSeconds === 0
                  ? 'Breath Complete — Choose One Option Below'
                  : 'Optional 5-Second Breath'}
              </span>
            </button>
          </div>
        </div>
      </section>

      {/* 5 Non-Judgmental Trigger Options */}
      <section className="space-y-3">
        <h3 className="text-lg font-bold">What pulled you here right now?</h3>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {TRIGGERS.map((t) => (
            <button
              key={t.id}
              type="button"
              aria-pressed={selectedTrigger === t.id}
              onClick={() => handleSelectTrigger(t.id)}
              className={`p-4 min-h-[76px] rounded-2xl border text-left transition-colors cursor-pointer space-y-1 ${
                selectedTrigger === t.id
                  ? 'bg-[#FFF0C9] border-[#B83A1C] ring-2 ring-[#B83A1C]/20'
                  : 'bg-white border-[#0F2544]/10 hover:border-[#1E4EB8]/40'
              }`}
            >
              <div className="font-bold text-sm sm:text-base text-[#0F2544]">{t.label}</div>
              <div className="text-xs text-[#465873]">{t.hint}</div>
            </button>
          ))}
        </div>
      </section>

      {error && (
        <div role="alert" className="p-4 rounded-2xl bg-red-50 border border-red-200 text-sm text-red-800">
          {error}
        </div>
      )}

      {/* Single Primary Practical Alternative */}
      {selectedTrigger && (
        <section className="space-y-3">
          <h3 className="text-lg font-extrabold">One practical alternative right now</h3>
          {loading ? (
            <div className="h-44 rounded-3xl bg-white border border-[#0F2544]/10 animate-pulse" />
          ) : primaryAlternative ? (
            <article className="bg-white rounded-3xl border border-[#0F2544]/12 p-6 sm:p-8 space-y-4 shadow-xs">
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                <span className="font-bold text-[#126EB2]">
                  {primaryAlternative.category} · {primaryAlternative.durationMinutes} min ·{' '}
                  {primaryAlternative.outdoors ? 'Outdoors' : 'Indoors'}
                </span>
                <span className="font-semibold text-[#465873]">
                  Grows {WORLD_ELEMENTS_META[primaryAlternative.worldElement].name}
                </span>
              </div>
              <h4 className="text-2xl font-extrabold">{primaryAlternative.title}</h4>
              <p className="text-sm text-[#465873] leading-relaxed">{primaryAlternative.description}</p>
              <p className="text-xs text-[#0F2544]">
                <strong>Materials:</strong> {primaryAlternative.materialsNeeded}
              </p>
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => onLaunchMission(primaryAlternative)}
                  className="inline-flex items-center gap-2 min-h-[44px] px-5 py-2.5 rounded-xl bg-[#1E4EB8] text-white text-sm font-bold hover:bg-[#126EB2] cursor-pointer"
                >
                  <span>Start {primaryAlternative.durationMinutes}m Offline Timer</span>
                  <ArrowRight className="w-4 h-4" aria-hidden="true" />
                </button>
                {alternatives.length > 1 && (
                  <button
                    type="button"
                    onClick={() => setAltIndex((i) => (i + 1) % alternatives.length)}
                    className="inline-flex items-center gap-1.5 min-h-[44px] px-4 py-2.5 rounded-xl border border-[#0F2544]/15 text-xs font-semibold text-[#0F2544] hover:bg-[#FFF0C9]/50 cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>Show another idea</span>
                  </button>
                )}
              </div>
            </article>
          ) : null}
        </section>
      )}
    </div>
  );
}

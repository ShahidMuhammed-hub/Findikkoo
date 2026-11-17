import { useState } from 'react';
import { ArrowLeft, ShieldCheck } from 'lucide-react';
import type { AppRoute } from '../layouts/AppShell';
import { FindikooWordmark } from '../components/FindikooWordmark';

export function AboutAndLegalPage({
  initialTab = 'mission',
  onNavigate,
}: {
  initialTab?: string;
  onNavigate: (route: AppRoute) => void;
}) {
  const [tab, setTab] = useState<'mission' | 'pillars' | 'privacy' | 'terms'>(
    initialTab === 'privacy'
      ? 'privacy'
      : initialTab === 'terms'
      ? 'terms'
      : initialTab === 'pillars'
      ? 'pillars'
      : 'mission'
  );

  return (
    <div className="min-h-screen bg-[#FFFDF6] text-[#0F2544]">
      <header className="border-b border-[#0F2544]/10 bg-white px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={() => onNavigate('landing')}
            className="inline-flex items-center gap-2 min-h-[40px] text-sm font-semibold text-[#1E4EB8] hover:underline cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" aria-hidden="true" />
            <span>Back to Findikoo</span>
          </button>
          <FindikooWordmark size="sm" className="hidden sm:inline-flex" />
          <button
            type="button"
            onClick={() => onNavigate('auth')}
            className="min-h-[40px] px-4 py-2 rounded-xl text-sm font-semibold bg-[#1E4EB8] text-white hover:bg-[#126EB2] cursor-pointer"
          >
            Create Account (18+)
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-12 space-y-8">
        <div className="space-y-2">
          <h1 className="text-3xl sm:text-4xl font-extrabold">About Findikoo</h1>
          <p className="text-[#465873]">
            MAKE IT YOUR OWN. Less scrolling. More living. Built to move attention from passive feeds into real-world living, personal skill building, and human connection.
          </p>
        </div>

        <div className="flex flex-wrap gap-2 p-1 bg-[#FFF0C9]/60 rounded-xl w-fit">
          {[
            { id: 'mission', label: 'Mission & Honesty' },
            { id: 'pillars', label: 'Three Pillars & World' },
            { id: 'privacy', label: 'Privacy & 18+ Policy' },
            { id: 'terms', label: 'World Growth Only Policy' },
          ].map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setTab(item.id as typeof tab)}
              className={`min-h-[38px] px-4 py-2 rounded-lg text-sm font-semibold transition-colors cursor-pointer ${
                tab === item.id ? 'bg-white text-[#0F2544] shadow-xs' : 'text-[#465873] hover:text-[#0F2544]'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {tab === 'mission' && (
          <section className="bg-white rounded-3xl border border-[#0F2544]/10 p-8 space-y-5">
            <h2 className="text-2xl font-bold">From Passive Feeds to Living</h2>
            <p className="leading-relaxed text-[#0F2544]/85">
              Findikoo is designed as the deliberate opposite of endless social media feeds. Rather than keeping you scrolling, our Offline Timer invites you to put down your device and spend real minutes sketching, learning, cooking, walking, creating, and meeting people around you.
            </p>
            <div className="grid sm:grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-2xl bg-[#FFFDF6] border border-[#0F2544]/10">
                <h3 className="font-bold">Ethical Architecture</h3>
                <p className="text-sm text-[#465873] mt-1">
                  No infinite scrolling, no follower counts, no popularity rankings, no manipulative notifications, and no anxiety-inducing streak counters.
                </p>
              </div>
              <div className="p-4 rounded-2xl bg-[#FFFDF6] border border-[#0F2544]/10">
                <h3 className="font-bold">Honest Verification</h3>
                <p className="text-sm text-[#465873] mt-1">
                  Offline timer sessions and reflections are clearly marked <strong>Self-reported</strong>. Findikoo never claims background phone surveillance. Skill challenges and projects marked <strong>Reviewer-verified</strong> have been reviewed by a supervisor.
                </p>
              </div>
            </div>
          </section>
        )}

        {tab === 'pillars' && (
          <section className="bg-white rounded-3xl border border-[#0F2544]/10 p-8 space-y-5">
            <h2 className="text-2xl font-bold">Three Pillars &amp; Three World Elements</h2>
            <ul className="space-y-3 text-[#0F2544]/85">
              <li>
                <strong>LET ME CHOOSE:</strong> Finite 3-card offline suggestions tailored to your mood and minutes, plus a calm Impulse Pause when you feel pulled to scroll.
              </li>
              <li>
                <strong>LET ME GROW (The Tree):</strong> Practical learning paths, skill practice logs, and peer-reviewed challenges that grow your Tree from a sapling to a grove.
              </li>
              <li>
                <strong>LET ME CONNECT (The House) &amp; LET ME CREATE (The Car):</strong> Offline experiences, real-world connections, and original hands-on projects that grow your House and Car.
              </li>
            </ul>
          </section>
        )}

        {tab === 'privacy' && (
          <section className="bg-white rounded-3xl border border-[#0F2544]/10 p-8 space-y-4">
            <div className="flex items-center gap-2 text-[#126EB2]">
              <ShieldCheck className="w-6 h-6" aria-hidden="true" />
              <h2 className="text-2xl font-bold">Privacy &amp; Adult (18+) Eligibility</h2>
            </div>
            <p className="text-[#0F2544]/85 leading-relaxed">
              Findikoo MVP is designed exclusively for adults aged 18 and older. New accounts require explicit 18+ confirmation and enforce 8+ character passwords with signed HTTP-only session cookies.
            </p>
            <p className="text-sm text-[#465873]">
              Personal journal entries default to private and are never shared unless you explicitly choose your real-world circle.
            </p>
          </section>
        )}

        {tab === 'terms' && (
          <section className="bg-white rounded-3xl border border-[#0F2544]/10 p-8 space-y-4">
            <h2 className="text-2xl font-bold">World Growth Only Policy</h2>
            <p className="text-[#0F2544]/85 leading-relaxed">
              Your reward in Findikoo is <strong>World Growth Only</strong>: as you complete offline experiences, practice skills, and build original projects, your personal Tree, House, and Car visually evolve. Findikoo contains no cash rewards, paid marketplaces, or virtual currency loops.
            </p>
          </section>
        )}
      </main>
    </div>
  );
}

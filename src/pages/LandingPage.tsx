import { useState } from 'react';
import { ArrowRight, TreeDeciduous, Home, Car } from 'lucide-react';
import { HeroLandscapeScene } from '../illustrations/HeroLandscapeScene';
import { MakeItYourOwnBrush } from '../illustrations/BrushTypography';
import { MyWorldMap } from '../illustrations/MyWorldMap';
import { FindikooWordmark } from '../components/FindikooWordmark';
import { computeWorldGrowth } from '../shared/rules';
import type { WorldElementId } from '../shared/types';
import type { AppRoute } from '../layouts/AppShell';
import { useAuth } from '../contexts/AuthContext';

interface LandingPageProps {
  onNavigate: (
    route: AppRoute,
    options?: { authMode?: 'signin' | 'signup'; aboutTab?: string }
  ) => void;
}

const PREVIEW_WORLD = computeWorldGrowth({
  treeMissions: 2,
  houseMissions: 2,
  carMissions: 1,
  skillsCount: 2,
  skillPracticeSessions: 2,
  approvedChallenges: 0,
  projectsCount: 1,
  projectUpdatesCount: 1,
  approvedProjects: 0,
  connectionsCount: 2,
  communityJoinedCount: 1,
  journalCount: 2,
});

export function LandingPage({ onNavigate }: LandingPageProps) {
  const { user } = useAuth();
  const [previewId, setPreviewId] = useState<WorldElementId>('tree');

  return (
    <div className="min-h-screen bg-[#FFFDF6] text-[#0F2544] overflow-x-hidden flex flex-col">
      {/* Clean 3-Zone Header */}
      <header className="sticky top-0 z-40 bg-[#FFF0C9]/95 border-b border-[#0F2544]/10">
        <div className="max-w-[1160px] mx-auto px-6 py-3.5 flex items-center justify-between gap-6">
          <a href="#top" className="shrink-0" aria-label="Findikoo home">
            <FindikooWordmark size="md" />
          </a>

          <nav
            aria-label="Primary landing navigation"
            className="hidden sm:flex items-center gap-6 text-sm font-medium text-[#0F2544]"
          >
            <a href="#your-world" className="hover:text-[#1E4EB8] hover:underline whitespace-nowrap">
              Your World
            </a>
            <button
              type="button"
              onClick={() => onNavigate('about')}
              className="hover:text-[#1E4EB8] hover:underline whitespace-nowrap cursor-pointer"
            >
              About
            </button>
          </nav>

          <div className="flex items-center gap-3 shrink-0">
            {!user && (
              <button
                type="button"
                onClick={() => onNavigate('auth', { authMode: 'signin' })}
                className="min-h-[40px] px-3 py-2 text-sm font-semibold text-[#0F2544] hover:text-[#1E4EB8] transition-colors whitespace-nowrap cursor-pointer"
              >
                Sign In
              </button>
            )}
            <button
              type="button"
              onClick={() =>
                onNavigate(user ? 'world' : 'auth', user ? undefined : { authMode: 'signup' })
              }
              className="min-h-[40px] px-5 py-2 rounded-xl text-sm font-semibold bg-[#416FD2] text-white hover:bg-[#1E4EB8] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              {user ? 'Open My World' : 'Get Started'}
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Focused Hero Section */}
        <section id="top" className="relative min-h-[540px] lg:min-h-[600px] flex items-center">
          <HeroLandscapeScene />

          <div className="relative z-10 max-w-[1160px] mx-auto w-full px-6 py-12 lg:py-16">
            <div className="max-w-lg space-y-5 bg-[#FFFDF6]/95 p-7 sm:p-9 rounded-3xl border border-[#0F2544]/10 shadow-sm">
              <p className="text-xs sm:text-sm font-bold text-[#126EB2]">
                Adults 18+ · Less scrolling. More living.
              </p>

              <h1 className="sr-only">Findikoo — Make it your own. Less scrolling, more living.</h1>
              <MakeItYourOwnBrush variant="hero-light" size="md" />

              <p className="text-base text-[#0F2544]/90 leading-relaxed">
                Step away from passive feeds into real offline activities, hands-on skill practice, and genuine connection. Grow your personal Tree, House, and Car at your own pace.
              </p>

              <div className="space-y-2.5 pt-1">
                <button
                  type="button"
                  onClick={() =>
                    onNavigate(user ? 'world' : 'auth', user ? undefined : { authMode: 'signup' })
                  }
                  className="inline-flex items-center gap-2 min-h-[46px] px-6 py-3 rounded-2xl text-sm sm:text-base font-bold bg-[#416FD2] text-white hover:bg-[#1E4EB8] transition-colors whitespace-nowrap cursor-pointer"
                >
                  <span>{user ? 'Open My World' : 'Create Your World (18+)'}</span>
                  <ArrowRight className="w-4 h-4" aria-hidden="true" />
                </button>

                {!user && (
                  <p className="text-xs text-[#465873]">
                    Already have an account?{' '}
                    <button
                      type="button"
                      onClick={() => onNavigate('auth', { authMode: 'signin' })}
                      className="font-semibold text-[#1E4EB8] hover:underline cursor-pointer"
                    >
                      Sign in
                    </button>
                  </p>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Essential Supporting Section: Three Pillars & Living World */}
        <section id="your-world" className="py-16 sm:py-20 bg-[#FFFDF6] border-t border-[#0F2544]/10">
          <div className="max-w-[1160px] mx-auto px-6 grid lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-5 space-y-6">
              <div className="space-y-2">
                <p className="text-xs font-bold tracking-wide text-[#116D63]">
                  WORLD GROWTH ONLY
                </p>
                <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                  One quiet place for real-world living
                </h2>
                <p className="text-sm sm:text-base text-[#465873] leading-relaxed">
                  No infinite scroll, no streaks, and no popularity counters. Your offline actions nurture three personal symbols:
                </p>
              </div>

              <ul className="divide-y divide-[#0F2544]/10 text-sm">
                <li className="py-3.5 flex items-start gap-3">
                  <span className="w-9 h-9 rounded-xl bg-[#E9FAF6] text-[#2D6A1E] flex items-center justify-center shrink-0">
                    <TreeDeciduous className="w-5 h-5" aria-hidden="true" />
                  </span>
                  <div>
                    <div className="font-bold text-[#0F2544]">The Tree — Let Me Grow</div>
                    <p className="text-[#465873] mt-0.5">
                      Reading, reflection, and practical skills developed by doing.
                    </p>
                  </div>
                </li>
                <li className="py-3.5 flex items-start gap-3">
                  <span className="w-9 h-9 rounded-xl bg-[#FFF0C9] text-[#B83A1C] flex items-center justify-center shrink-0">
                    <Home className="w-5 h-5" aria-hidden="true" />
                  </span>
                  <div>
                    <div className="font-bold text-[#0F2544]">The House — Let Me Choose &amp; Connect</div>
                    <p className="text-[#465873] mt-0.5">
                      Screen-free moments, journaling, and real-world relationships.
                    </p>
                  </div>
                </li>
                <li className="py-3.5 flex items-start gap-3">
                  <span className="w-9 h-9 rounded-xl bg-[#E8F6FC] text-[#1E4EB8] flex items-center justify-center shrink-0">
                    <Car className="w-5 h-5" aria-hidden="true" />
                  </span>
                  <div>
                    <div className="font-bold text-[#0F2544]">The Car — Let Me Create</div>
                    <p className="text-[#465873] mt-0.5">
                      Original projects and tangible craft built at your own pace.
                    </p>
                  </div>
                </li>
              </ul>
            </div>

            <div className="lg:col-span-7 space-y-2.5">
              <MyWorldMap
                worldGrowth={PREVIEW_WORLD}
                selectedId={previewId}
                onSelect={(id) => setPreviewId(id)}
              />
              <p className="text-xs text-[#465873]">
                Sample preview — click the Tree, House, or Car to inspect. New accounts start fresh at Stage 1.
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Quiet Footer */}
      <footer className="bg-white border-t border-[#0F2544]/10 py-8">
        <div className="max-w-[1160px] mx-auto px-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-sm text-[#465873]">
          <div className="flex items-center gap-2.5">
            <FindikooWordmark size="sm" />
            <span aria-hidden="true">·</span>
            <span>Make It Your Own · Adults 18+</span>
          </div>
          <div className="flex flex-wrap items-center gap-5">
            <button
              type="button"
              onClick={() => onNavigate('about', { aboutTab: 'mission' })}
              className="hover:text-[#1E4EB8] hover:underline cursor-pointer"
            >
              About Findikoo
            </button>
            <button
              type="button"
              onClick={() => onNavigate('about', { aboutTab: 'privacy' })}
              className="hover:text-[#1E4EB8] hover:underline cursor-pointer"
            >
              Privacy &amp; 18+
            </button>
            <button
              type="button"
              onClick={() => onNavigate('about', { aboutTab: 'terms' })}
              className="hover:text-[#1E4EB8] hover:underline cursor-pointer"
            >
              World Growth Policy
            </button>
            <button
              type="button"
              onClick={() => onNavigate('auth', { authMode: 'signin' })}
              className="hover:text-[#1E4EB8] hover:underline cursor-pointer"
            >
              Sign In
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}

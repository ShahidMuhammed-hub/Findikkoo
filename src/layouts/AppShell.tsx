import React, { useEffect, useState } from 'react';
import {
  Compass,
  Sprout,
  Lightbulb,
  Users,
  BookOpen,
  ShieldCheck,
  User,
  PauseCircle,
  Map,
  LogOut,
  Menu,
  X,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { FindikooWordmark } from '../components/FindikooWordmark';

export type AppRoute =
  | 'landing'
  | 'about'
  | 'auth'
  | 'onboarding'
  | 'world'
  | 'choose'
  | 'impulse'
  | 'grow'
  | 'create'
  | 'connect'
  | 'journal'
  | 'profile'
  | 'admin';

interface AppShellProps {
  currentRoute: AppRoute;
  onNavigate: (route: AppRoute) => void;
  pageTitle: string;
  children: React.ReactNode;
}

interface NavGroup {
  heading: string;
  items: { id: AppRoute; label: string; icon: React.ComponentType<{ className?: string }> }[];
}

export function AppShell({ currentRoute, onNavigate, pageTitle, children }: AppShellProps) {
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (!mobileMenuOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileMenuOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [mobileMenuOpen]);

  if (!user) return null;

  const navGroups: NavGroup[] = [
    {
      heading: 'Daily Living',
      items: [
        { id: 'world', label: 'My World', icon: Map },
        { id: 'choose', label: 'Let Me Choose', icon: Compass },
        { id: 'impulse', label: 'Impulse Pause', icon: PauseCircle },
      ],
    },
    {
      heading: 'Growth & Reflection',
      items: [
        { id: 'grow', label: 'Let Me Grow', icon: Sprout },
        { id: 'create', label: 'Let Me Create', icon: Lightbulb },
        { id: 'connect', label: 'Let Me Connect', icon: Users },
        { id: 'journal', label: 'Journal & Progress', icon: BookOpen },
      ],
    },
    {
      heading: 'Account',
      items: [
        { id: 'profile', label: 'Profile & Settings', icon: User },
        ...(user.role === 'admin'
          ? [{ id: 'admin' as AppRoute, label: 'Supervisor Console', icon: ShieldCheck }]
          : []),
      ],
    },
  ];

  const mobilePrimaryTabs: {
    id: AppRoute;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
  }[] = [
    { id: 'world', label: 'World', icon: Map },
    { id: 'choose', label: 'Choose', icon: Compass },
    { id: 'impulse', label: 'Pause', icon: PauseCircle },
    { id: 'journal', label: 'Journal', icon: BookOpen },
  ];

  const handleNav = (id: AppRoute) => {
    onNavigate(id);
    setMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen flex bg-[#FFFDF6] text-[#0F2544]">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 shrink-0 border-r border-[#0F2544]/10 bg-white">
        <div className="px-6 py-5 border-b border-[#0F2544]/10">
          <button
            type="button"
            onClick={() => handleNav('landing')}
            className="hover:opacity-85 transition-opacity cursor-pointer text-left"
          >
            <FindikooWordmark size="md" />
          </button>
          <p className="mt-1 text-xs font-medium text-[#465873]">
            Less scrolling. More living.
          </p>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-5 overflow-y-auto" aria-label="Primary workspace navigation">
          {navGroups.map((group) => (
            <div key={group.heading} className="space-y-1">
              <div className="px-3.5 text-[11px] font-bold tracking-wide text-[#465873]">
                {group.heading}
              </div>
              {group.items.map((item) => {
                const Icon = item.icon;
                const active = currentRoute === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    aria-current={active ? 'page' : undefined}
                    onClick={() => handleNav(item.id)}
                    className={`w-full flex items-center gap-3 px-3.5 py-2.5 min-h-[40px] rounded-xl text-sm font-medium transition-colors cursor-pointer whitespace-nowrap ${
                      active
                        ? 'bg-[#416FD2] text-white'
                        : 'text-[#0F2544]/85 hover:bg-[#FFF0C9]/70 hover:text-[#0F2544]'
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0" aria-hidden="true" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          ))}
        </nav>

        <div className="p-4 border-t border-[#0F2544]/10 space-y-3">
          <div className="text-xs text-[#465873] space-y-1">
            <div className="font-semibold text-[#0F2544] truncate">{user.name}</div>
            {user.isDemoAccount && (
              <div className="text-[11px] font-semibold text-[#126EB2]">
                Demonstration Account
              </div>
            )}
            <div className="tabular-nums">
              {user.declaredOfflineMinutes} offline min logged
            </div>
          </div>
          <button
            type="button"
            onClick={async () => {
              await logout();
              onNavigate('landing');
            }}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 min-h-[40px] rounded-xl text-xs font-semibold border border-[#0F2544]/15 text-[#0F2544] hover:bg-[#0F2544]/5 transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-50 lg:hidden flex"
          role="dialog"
          aria-modal="true"
          aria-label="Workspace menu"
        >
          <div
            className="fixed inset-0 bg-[#0F2544]/40"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="relative z-10 w-72 max-w-[84vw] bg-white h-full flex flex-col p-5 shadow-xl">
            <div className="flex items-center justify-between pb-4 border-b border-[#0F2544]/10">
              <FindikooWordmark size="sm" />
              <button
                type="button"
                aria-label="Close navigation menu"
                onClick={() => setMobileMenuOpen(false)}
                className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl hover:bg-[#0F2544]/5 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <nav className="flex-1 py-4 space-y-4 overflow-y-auto" aria-label="Mobile navigation">
              {navGroups.map((group) => (
                <div key={group.heading} className="space-y-1">
                  <div className="px-3 text-[11px] font-bold text-[#465873]">
                    {group.heading}
                  </div>
                  {group.items.map((item) => {
                    const Icon = item.icon;
                    const active = currentRoute === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        aria-current={active ? 'page' : undefined}
                        onClick={() => handleNav(item.id)}
                        className={`w-full flex items-center gap-3 px-3.5 min-h-[44px] rounded-xl text-sm font-medium cursor-pointer ${
                          active ? 'bg-[#416FD2] text-white' : 'text-[#0F2544]/85 hover:bg-[#FFF0C9]/70'
                        }`}
                      >
                        <Icon className="w-4 h-4 shrink-0" aria-hidden="true" />
                        <span>{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              ))}
            </nav>
            <div className="pt-3 border-t border-[#0F2544]/10 space-y-2">
              <div className="text-xs text-[#465873] px-1 truncate">{user.name}</div>
              <button
                type="button"
                onClick={async () => {
                  await logout();
                  onNavigate('landing');
                }}
                className="w-full flex items-center justify-center gap-2 px-3 min-h-[44px] rounded-xl text-sm font-semibold border border-[#0F2544]/15 cursor-pointer"
              >
                <LogOut className="w-4 h-4" aria-hidden="true" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Column */}
      <div className="flex-1 flex flex-col min-w-0 pb-20 lg:pb-0">
        <header className="lg:sticky lg:top-0 z-30 bg-[#FFFDF6]/95 border-b border-[#0F2544]/10 px-4 sm:px-8 py-3.5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              aria-label="Open navigation menu"
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl border border-[#0F2544]/15 bg-white hover:bg-[#FFF0C9]/40 cursor-pointer"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="min-w-0">
              <h1 className="text-lg sm:text-xl font-bold tracking-tight truncate">
                {pageTitle}
              </h1>
              <p className="text-xs text-[#465873] truncate">
                {user.isDemoAccount ? 'Demonstration profile · ' : ''}World Growth Only
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {currentRoute !== 'impulse' && (
              <button
                type="button"
                onClick={() => onNavigate('impulse')}
                className="min-h-[40px] px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-[#B83A1C] text-white hover:bg-[#9E2F15] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                Need a Pause?
              </button>
            )}
          </div>
        </header>

        <main className="flex-1 px-4 sm:px-8 py-6 max-w-[1160px] w-full mx-auto">
          {children}
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar (<= 15% height, 44px+ touch targets) */}
      <nav
        aria-label="Mobile quick navigation"
        className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-white border-t border-[#0F2544]/10 px-2 py-1 grid grid-cols-5 gap-1"
      >
        {mobilePrimaryTabs.map((item) => {
          const Icon = item.icon;
          const active = currentRoute === item.id;
          return (
            <button
              key={item.id}
              type="button"
              aria-current={active ? 'page' : undefined}
              onClick={() => handleNav(item.id)}
              className={`min-h-[48px] flex flex-col items-center justify-center gap-0.5 rounded-xl text-[11px] font-semibold cursor-pointer ${
                active ? 'text-[#1E4EB8] bg-[#416FD2]/10' : 'text-[#465873]'
              }`}
            >
              <Icon className="w-4 h-4" aria-hidden="true" />
              <span>{item.label}</span>
            </button>
          );
        })}
        <button
          type="button"
          onClick={() => setMobileMenuOpen(true)}
          className="min-h-[48px] flex flex-col items-center justify-center gap-0.5 rounded-xl text-[11px] font-semibold text-[#465873] cursor-pointer"
        >
          <Menu className="w-4 h-4" aria-hidden="true" />
          <span>More</span>
        </button>
      </nav>
    </div>
  );
}

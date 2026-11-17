import { useEffect, useState } from 'react';
import { MotionConfig } from 'motion/react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { AppShell, type AppRoute } from './layouts/AppShell';
import { LandingPage } from './pages/LandingPage';
import { AboutAndLegalPage } from './pages/AboutAndLegalPage';
import { AuthPage } from './pages/AuthPage';
import { OnboardingPage } from './pages/OnboardingPage';
import { MyWorldPage } from './pages/MyWorldPage';
import { LetMeChoosePage } from './pages/LetMeChoosePage';
import { ImpulseDetectorPage } from './pages/ImpulseDetectorPage';
import { LetMeGrowPage } from './pages/LetMeGrowPage';
import { LetMeCreatePage } from './pages/LetMeCreatePage';
import { LetMeConnectPage } from './pages/LetMeConnectPage';
import { JournalAndProgressPage } from './pages/JournalAndProgressPage';
import { ProfileAndSettingsPage } from './pages/ProfileAndSettingsPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import type { Activity } from './shared/types';

const VALID_ROUTES: AppRoute[] = [
  'landing',
  'about',
  'auth',
  'onboarding',
  'world',
  'choose',
  'impulse',
  'grow',
  'create',
  'connect',
  'journal',
  'profile',
  'admin',
];

function getInitialRoute(): AppRoute {
  const hash = window.location.hash.replace(/^#\/?/, '') as AppRoute;
  if (VALID_ROUTES.includes(hash)) return hash;
  return 'landing';
}

function FindikooRouter() {
  const { user, loading, demoLogin } = useAuth();
  const [route, setRoute] = useState<AppRoute>(getInitialRoute);
  const [authInitialMode, setAuthInitialMode] = useState<'signin' | 'signup'>('signup');
  const [aboutTab, setAboutTab] = useState<string>('mission');
  const [preselectedActivity, setPreselectedActivity] = useState<Activity | null>(null);

  useEffect(() => {
    const onHashChange = () => {
      const next = getInitialRoute();
      setRoute(next);
    };
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('autostart') === '1' && !loading) {
      if (user) {
        if (route === 'landing' || route === 'auth') {
          setRoute('world');
          window.location.hash = '#/world';
        }
      } else {
        demoLogin('maya@findikoo.app')
          .then(() => {
            setRoute('world');
            window.location.hash = '#/world';
          })
          .catch(() => {});
      }
    }
  }, [user, loading, demoLogin, route]);

  const navigate = (
    nextRoute: AppRoute,
    options?: { authMode?: 'signin' | 'signup'; aboutTab?: string }
  ) => {
    if (options?.authMode) setAuthInitialMode(options.authMode);
    if (options?.aboutTab) setAboutTab(options.aboutTab);
    setRoute(nextRoute);
    window.location.hash = nextRoute === 'landing' ? '' : `#/${nextRoute}`;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const launchActivityInChoose = (activity: Activity) => {
    setPreselectedActivity(activity);
    navigate('choose');
  };

  if (route === 'landing') {
    return <LandingPage onNavigate={navigate} />;
  }

  if (route === 'about') {
    return <AboutAndLegalPage initialTab={aboutTab} onNavigate={navigate} />;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FFFDF6] flex items-center justify-center">
        <div className="text-center space-y-2">
          <div className="text-2xl font-extrabold text-[#1E4EB8]">Findikoo</div>
          <p className="text-sm text-[#465873]">Preparing your world...</p>
        </div>
      </div>
    );
  }

  if (route === 'auth' || !user) {
    return <AuthPage initialMode={authInitialMode} onNavigate={navigate} />;
  }

  if (route === 'onboarding') {
    return <OnboardingPage onNavigate={navigate} />;
  }

  const routeTitleMap: Record<AppRoute, string> = {
    landing: 'Findikoo',
    about: 'About Findikoo',
    auth: 'Sign In',
    onboarding: 'Personalize Your World',
    world: 'My World',
    choose: 'Let Me Choose',
    impulse: 'Impulse Pause',
    grow: 'Let Me Grow',
    create: 'Let Me Create',
    connect: 'Let Me Connect',
    journal: 'Journal & Progress',
    profile: 'Profile & Settings',
    admin: 'Supervisor Console',
  };

  return (
    <AppShell currentRoute={route} onNavigate={navigate} pageTitle={routeTitleMap[route]}>
      {route === 'world' && (
        <MyWorldPage onNavigate={navigate} onStartActivity={launchActivityInChoose} />
      )}
      {route === 'choose' && (
        <LetMeChoosePage
          preselectedActivity={preselectedActivity}
          onClearPreselected={() => setPreselectedActivity(null)}
          onNavigate={navigate}
        />
      )}
      {route === 'impulse' && (
        <ImpulseDetectorPage
          onLaunchMission={launchActivityInChoose}
          onExit={() => navigate('world')}
        />
      )}
      {route === 'grow' && <LetMeGrowPage />}
      {route === 'create' && <LetMeCreatePage />}
      {route === 'connect' && <LetMeConnectPage />}
      {route === 'journal' && <JournalAndProgressPage />}
      {route === 'profile' && <ProfileAndSettingsPage onNavigate={navigate} />}
      {route === 'admin' &&
        (user.role === 'admin' ? (
          <AdminDashboardPage />
        ) : (
          <div className="bg-white rounded-3xl p-8 border border-[#0F2544]/10 space-y-3">
            <h2 className="text-xl font-bold">Supervisor Access Required</h2>
            <p className="text-sm text-[#465873]">
              This section is restricted to authorized Findikoo supervisors and reviewers.
            </p>
          </div>
        ))}
    </AppShell>
  );
}

export default function App() {
  return (
    <MotionConfig reducedMotion="user">
      <AuthProvider>
        <FindikooRouter />
      </AuthProvider>
    </MotionConfig>
  );
}

import type {
  Activity,
  AuditLogEntry,
  ChallengeSubmission,
  CommunityMission,
  ConnectionRecord,
  ImpulseTrigger,
  JournalEntry,
  MissionSession,
  MoodType,
  NotificationItem,
  OriginalProject,
  PracticeChallenge,
  ProjectStatus,
  PublicUser,
  RealExperienceCard,
  SubmissionStatus,
  UserSkill,
  WorldElementId,
} from '../shared/types';
import type { MilestoneDefinition, WorldGrowthState } from '../shared/rules';

const TOKEN_STORAGE_KEY = 'findikoo_auth_token';
const LEGACY_TOKEN_STORAGE_KEY = 'unscroll_auth_token';

export function getStoredToken(): string | null {
  try {
    return (
      localStorage.getItem(TOKEN_STORAGE_KEY) ||
      localStorage.getItem(LEGACY_TOKEN_STORAGE_KEY)
    );
  } catch {
    return null;
  }
}

export function setStoredToken(token: string | null) {
  try {
    if (token) {
      localStorage.setItem(TOKEN_STORAGE_KEY, token);
      localStorage.removeItem(LEGACY_TOKEN_STORAGE_KEY);
    } else {
      localStorage.removeItem(TOKEN_STORAGE_KEY);
      localStorage.removeItem(LEGACY_TOKEN_STORAGE_KEY);
    }
  } catch {
    // ignore storage errors
  }
}

async function apiFetch<T>(url: string, options: RequestInit = {}): Promise<T> {
  const token = getStoredToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...((options.headers as Record<string, string>) || {}),
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(url, {
    ...options,
    headers,
    credentials: 'include',
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || `Request failed (${res.status})`);
  }
  return data as T;
}

export const api = {
  auth: {
    register: (payload: {
      name: string;
      email: string;
      password: string;
      adultConfirmed: boolean;
    }) =>
      apiFetch<{ user: PublicUser; token: string }>('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify(payload),
      }),
    login: (payload: { email: string; password: string }) =>
      apiFetch<{ user: PublicUser; token: string }>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify(payload),
      }),
    demoLogin: (email: string) =>
      apiFetch<{ user: PublicUser; token: string }>('/api/auth/demo-login', {
        method: 'POST',
        body: JSON.stringify({ email }),
      }),
    logout: () => apiFetch<{ ok: boolean }>('/api/auth/logout', { method: 'POST' }),
    forgotPassword: (email: string) =>
      apiFetch<{ resetSupported?: boolean; devResetCode?: string; message: string }>(
        '/api/auth/forgot-password',
        {
          method: 'POST',
          body: JSON.stringify({ email }),
        }
      ),
    resetPassword: (payload: { email: string; code: string; newPassword: string }) =>
      apiFetch<{ ok: boolean; message: string }>('/api/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify(payload),
      }),
    me: () => apiFetch<{ user: PublicUser | null }>('/api/users/me'),
  },
  users: {
    updateProfile: (payload: { name?: string; privacyMode?: string }) =>
      apiFetch<{ user: PublicUser }>('/api/users/me', {
        method: 'PATCH',
        body: JSON.stringify(payload),
      }),
    changePassword: (payload: { currentPassword: string; newPassword: string }) =>
      apiFetch<{ ok: boolean; message: string }>('/api/users/me/password', {
        method: 'PATCH',
        body: JSON.stringify(payload),
      }),
    saveOnboarding: (payload: Record<string, unknown>) =>
      apiFetch<{ user: PublicUser }>('/api/users/me/onboarding', {
        method: 'PATCH',
        body: JSON.stringify(payload),
      }),
  },
  activities: {
    list: (params?: { category?: string; worldElement?: WorldElementId }) => {
      const qs = new URLSearchParams();
      if (params?.category) qs.set('category', params.category);
      if (params?.worldElement) qs.set('worldElement', params.worldElement);
      return apiFetch<{ activities: Activity[] }>(`/api/activities?${qs.toString()}`);
    },
    recommended: (params?: {
      mood?: MoodType;
      impulse?: ImpulseTrigger;
      minutes?: number;
      limit?: number;
    }) => {
      const qs = new URLSearchParams();
      if (params?.mood) qs.set('mood', params.mood);
      if (params?.impulse) qs.set('impulse', params.impulse);
      if (params?.minutes) qs.set('minutes', String(params.minutes));
      if (params?.limit) qs.set('limit', String(params.limit));
      return apiFetch<{ activities: Activity[] }>(`/api/activities/recommended?${qs.toString()}`);
    },
  },
  missions: {
    start: (activityId: string, plannedMinutes?: number) =>
      apiFetch<{ session: MissionSession }>('/api/missions/start', {
        method: 'POST',
        body: JSON.stringify({ activityId, plannedMinutes }),
      }),
    complete: (
      sessionId: string,
      payload: {
        whatDidYouDo?: string;
        whatDidYouLearn?: string;
        howDidYouFeel?: string;
        elapsedSeconds?: number;
        status?: 'completed' | 'cancelled';
      }
    ) =>
      apiFetch<{ session: MissionSession; user: PublicUser; worldGrowth?: WorldGrowthState }>(
        `/api/missions/${sessionId}/complete`,
        { method: 'PATCH', body: JSON.stringify(payload) }
      ),
    history: () => apiFetch<{ sessions: MissionSession[] }>('/api/missions/history'),
  },
  skills: {
    list: () => apiFetch<{ skills: UserSkill[] }>('/api/skills'),
    add: (payload: { name: string; category: string; level: string; goal: string }) =>
      apiFetch<{ skill: UserSkill }>('/api/skills', {
        method: 'POST',
        body: JSON.stringify(payload),
      }),
    logPractice: (skillId: string, minutes: number) =>
      apiFetch<{ skill: UserSkill; user: PublicUser }>(`/api/skills/${skillId}/practice`, {
        method: 'POST',
        body: JSON.stringify({ minutes }),
      }),
  },
  challenges: {
    list: () => apiFetch<{ challenges: PracticeChallenge[] }>('/api/challenges'),
    mySubmissions: () => apiFetch<{ submissions: ChallengeSubmission[] }>('/api/submissions/mine'),
    submit: (
      challengeId: string,
      payload: { summary: string; workUrlOrArtifact: string; reflection?: string }
    ) =>
      apiFetch<{ submission: ChallengeSubmission }>(`/api/challenges/${challengeId}/submit`, {
        method: 'POST',
        body: JSON.stringify(payload),
      }),
  },
  projects: {
    list: () =>
      apiFetch<{ myProjects: OriginalProject[]; portfolioProjects: OriginalProject[] }>('/api/projects'),
    create: (payload: {
      title: string;
      category: string;
      problemStatement: string;
      solutionIdea: string;
      description?: string;
      artifactSummary?: string;
      impactNotes?: string;
    }) =>
      apiFetch<{ project: OriginalProject }>('/api/projects', {
        method: 'POST',
        body: JSON.stringify(payload),
      }),
    addUpdate: (projectId: string, payload: { updateText: string; impactNotes?: string }) =>
      apiFetch<{ project: OriginalProject }>(`/api/projects/${projectId}`, {
        method: 'PATCH',
        body: JSON.stringify(payload),
      }),
  },
  connect: {
    overview: () =>
      apiFetch<{
        connections: ConnectionRecord[];
        communityMissions: CommunityMission[];
        experiences: RealExperienceCard[];
      }>('/api/connections'),
    requestConnection: (payload: {
      peerName: string;
      relationType: string;
      sharedInterest: string;
    }) =>
      apiFetch<{ connection: ConnectionRecord }>('/api/connections/request', {
        method: 'POST',
        body: JSON.stringify(payload),
      }),
    joinCommunityMission: (missionId: string) =>
      apiFetch<{ mission: CommunityMission }>(`/api/community-missions/${missionId}/join`, {
        method: 'POST',
      }),
    shareExperience: (payload: { type: string; headline: string; story: string }) =>
      apiFetch<{ experience: RealExperienceCard }>('/api/experiences', {
        method: 'POST',
        body: JSON.stringify(payload),
      }),
  },
  journal: {
    list: () => apiFetch<{ entries: JournalEntry[] }>('/api/journal'),
    create: (payload: {
      title: string;
      activityDone: string;
      learned?: string;
      feeling?: string;
      helpedSomeone?: string;
      futureGoal?: string;
      privacy?: string;
    }) =>
      apiFetch<{ entry: JournalEntry }>('/api/journal', {
        method: 'POST',
        body: JSON.stringify(payload),
      }),
  },
  progress: {
    get: () =>
      apiFetch<{
        user: PublicUser;
        stats: {
          completedMissions: number;
          declaredOfflineMinutes: number;
          skillsCount: number;
          skillPracticeSessions: number;
          challengesSubmitted: number;
          challengesVerified: number;
          projectsCreated: number;
          projectsVerified: number;
          communityJoined: number;
          connectionsCount: number;
          journalCount: number;
        };
        worldGrowth: WorldGrowthState;
        milestones: MilestoneDefinition[];
        notifications: NotificationItem[];
      }>('/api/progress'),
    markNotificationsRead: () =>
      apiFetch<{ ok: boolean }>('/api/notifications/read', { method: 'PATCH' }),
  },
  ai: {
    recommendActivities: (payload: {
      mood?: MoodType;
      impulseTrigger?: ImpulseTrigger;
      availableMinutes?: number;
    }) =>
      apiFetch<{
        suggestions: {
          title: string;
          description: string;
          category: string;
          durationMinutes: number;
          materialsNeeded: string;
          outdoors: boolean;
          firstStep: string;
        }[];
      }>('/api/ai/recommend-activities', { method: 'POST', body: JSON.stringify(payload) }),
    suggestSkills: (learningGoal: string) =>
      apiFetch<{
        roadmap: {
          headline: string;
          antiConsumptionTip: string;
          steps: { stepTitle: string; practiceTask: string; estimatedMinutes: number }[];
        };
      }>('/api/ai/suggest-skills', { method: 'POST', body: JSON.stringify({ learningGoal }) }),
    brainstormProject: (communityProblem: string) =>
      apiFetch<{
        ideas: {
          title: string;
          category: string;
          problemStatement: string;
          solutionIdea: string;
          firstWeekendStep: string;
        }[];
      }>('/api/ai/brainstorm-project', { method: 'POST', body: JSON.stringify({ communityProblem }) }),
    weeklySummary: () => apiFetch<{ summary: string }>('/api/ai/weekly-summary', { method: 'POST' }),
  },
  admin: {
    dashboard: () =>
      apiFetch<{
        totals: {
          users: number;
          assignedUsers: number;
          activities: number;
          challenges: number;
          completedMissions: number;
          pendingSubmissions: number;
          pendingProjects: number;
        };
        users: PublicUser[];
        submissions: ChallengeSubmission[];
        projects: OriginalProject[];
        auditLogs: AuditLogEntry[];
      }>('/api/admin/dashboard'),
    getUserProgress: (userId: string) =>
      apiFetch<{
        user: PublicUser;
        stats: {
          completedMissions: number;
          declaredOfflineMinutes: number;
          skillsCount: number;
          skillPracticeSessions: number;
          challengesSubmitted: number;
          challengesVerified: number;
          projectsCreated: number;
          projectsVerified: number;
          communityJoined: number;
          connectionsCount: number;
          journalCount: number;
        };
        worldGrowth: WorldGrowthState;
        milestones: MilestoneDefinition[];
        skills: UserSkill[];
        recentMissions: {
          id: string;
          activityTitle: string;
          category: string;
          worldElement: WorldElementId;
          plannedMinutes: number;
          whatDidYouDo?: string;
          completedAt?: string;
        }[];
        submissions: ChallengeSubmission[];
        projects: OriginalProject[];
      }>(`/api/admin/users/${userId}/progress`),
    updateSupervision: (userId: string, assigned: boolean) =>
      apiFetch<{ user: PublicUser }>(`/api/admin/users/${userId}/supervision`, {
        method: 'PATCH',
        body: JSON.stringify({ assigned }),
      }),
    reviewSubmission: (id: string, status: SubmissionStatus, reviewerNotes: string) =>
      apiFetch<{ submission: ChallengeSubmission }>(`/api/admin/submissions/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status, reviewerNotes }),
      }),
    reviewProject: (id: string, status: ProjectStatus, reviewerFeedback: string) =>
      apiFetch<{ project: OriginalProject }>(`/api/admin/projects/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status, reviewerFeedback }),
      }),
    createActivity: (payload: {
      title: string;
      description: string;
      category: string;
      durationMinutes: number;
      worldElement: WorldElementId;
      materialsNeeded: string;
      outdoors: boolean;
    }) =>
      apiFetch<{ activity: Activity }>('/api/admin/activities', {
        method: 'POST',
        body: JSON.stringify(payload),
      }),
  },
};

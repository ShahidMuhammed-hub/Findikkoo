export type AgeGroup = '18+';
export type UserRole = 'user' | 'admin';

export type WorldElementId = 'tree' | 'house' | 'car';

export type ActivityCategory =
  | 'Creativity'
  | 'Learning'
  | 'Nature'
  | 'Fitness'
  | 'Reading'
  | 'Family'
  | 'Friendship'
  | 'Kindness'
  | 'Community'
  | 'Personal Development';

export type MoodType = 'bored' | 'stressed' | 'lonely' | 'curious' | 'energetic' | 'tired';

export type ImpulseTrigger =
  | 'bored'
  | 'stressed'
  | 'lonely'
  | 'habit'
  | 'break';

export type SubmissionStatus =
  | 'accepted'
  | 'submitted'
  | 'approved'
  | 'revision_requested'
  | 'rejected';

export type ProjectStatus = 'draft' | 'submitted' | 'approved' | 'revision_requested';

export interface OnboardingProfile {
  completed: boolean;
  interests: string[];
  currentSkills: string[];
  learningGoals: string[];
  personalGoals: string[];
  dailyFreeMinutes: number;
  enjoyedActivities: string[];
  scrollTriggers: string[];
  aspiration: string;
}

export interface UserRecord {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  ageGroup: AgeGroup;
  adultConfirmed: boolean;
  declaredOfflineMinutes: number;
  completedActivityIds: string[];
  onboarding: OnboardingProfile;
  privacyMode: 'private' | 'connections' | 'community';
  assignedSupervisorId?: string | null;
  createdAt: string;
  isDemoAccount?: boolean;
}

export type PublicUser = Omit<UserRecord, 'passwordHash'>;

export interface Activity {
  id: string;
  title: string;
  description: string;
  category: ActivityCategory;
  durationMinutes: number;
  difficulty: 'Gentle' | 'Moderate' | 'Deep Focus';
  worldElement: WorldElementId;
  materialsNeeded: string;
  outdoors: boolean;
  relevanceReason: string;
  moods: MoodType[];
  instructions: string[];
  offlineRequired: boolean;
}

export interface MissionSession {
  id: string;
  userId: string;
  activityId: string;
  activityTitle: string;
  category: ActivityCategory;
  worldElement: WorldElementId;
  plannedMinutes: number;
  elapsedSeconds: number;
  status: 'active' | 'paused' | 'completed' | 'cancelled';
  verificationType: 'self_reported';
  whatDidYouDo?: string;
  whatDidYouLearn?: string;
  howDidYouFeel?: string;
  startedAt: string;
  completedAt?: string;
}

export interface UserSkill {
  id: string;
  userId: string;
  name: string;
  category: string;
  level: 'Beginner' | 'Developing' | 'Capable' | 'Mentor';
  goal: string;
  hoursPracticed: number;
  practiceSessions: number;
}

export interface PracticeChallenge {
  id: string;
  title: string;
  description: string;
  category: string;
  requiredSkills: string[];
  difficulty: 'Starter' | 'Intermediate' | 'Challenge';
  estimatedMinutes: number;
  worldElement: WorldElementId;
  materialsNeeded: string;
  instructions: string[];
  submissionRequirements: string;
}

export interface ChallengeSubmission {
  id: string;
  challengeId: string;
  challengeTitle: string;
  userId: string;
  userName: string;
  summary: string;
  workUrlOrArtifact: string;
  reflection: string;
  status: SubmissionStatus;
  verificationType: 'reviewer_verified' | 'pending_review';
  reviewerNotes?: string;
  submittedAt: string;
  reviewedAt?: string;
}

export interface OriginalProject {
  id: string;
  userId: string;
  userName: string;
  title: string;
  category: string;
  problemStatement: string;
  solutionIdea: string;
  description: string;
  updates: { id: string; text: string; createdAt: string }[];
  artifactSummary: string;
  impactNotes: string;
  status: ProjectStatus;
  verificationType: 'self_reported' | 'reviewer_verified';
  reviewerFeedback?: string;
  publishedToPortfolio: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ConnectionRecord {
  id: string;
  userId: string;
  peerName: string;
  relationType: 'Friend' | 'Family' | 'Mentor' | 'Study Partner';
  sharedInterest: string;
  status: 'approved' | 'pending';
  createdAt: string;
}

export interface CommunityMission {
  id: string;
  title: string;
  description: string;
  category: string;
  participantsCount: number;
  joinedUserIds: string[];
  impactGoal: string;
  locationLabel: string;
}

export interface RealExperienceCard {
  id: string;
  userId: string;
  authorName: string;
  type: 'Created' | 'Learned' | 'Explored' | 'Helped' | 'Achieved';
  headline: string;
  story: string;
  createdAt: string;
}

export interface JournalEntry {
  id: string;
  userId: string;
  title: string;
  activityDone: string;
  learned: string;
  feeling: string;
  helpedSomeone?: string;
  futureGoal?: string;
  privacy: 'private' | 'connections';
  verificationType: 'self_reported';
  createdAt: string;
}

export interface NotificationItem {
  id: string;
  userId: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}

export interface AuditLogEntry {
  id: string;
  actorId: string;
  actorEmail: string;
  action: string;
  targetType: string;
  targetId: string;
  details: string;
  createdAt: string;
}

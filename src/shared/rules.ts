import type {
  Activity,
  ImpulseTrigger,
  MoodType,
  SubmissionStatus,
  UserRole,
  WorldElementId,
} from './types';

export interface WorldElementStage {
  stage: 1 | 2 | 3 | 4;
  stageTitle: string;
  visualDescription: string;
  nextMilestoneText: string;
  points: number;
  nextStageThreshold: number | null;
  progressPercent: number;
  accomplishments: string[];
}

export interface WorldGrowthState {
  tree: WorldElementStage;
  house: WorldElementStage;
  car: WorldElementStage;
  totalGrowthStage: number;
}

export interface WorldGrowthInput {
  treeMissions: number;
  houseMissions: number;
  carMissions: number;
  skillsCount: number;
  skillPracticeSessions: number;
  approvedChallenges: number;
  projectsCount: number;
  projectUpdatesCount: number;
  approvedProjects: number;
  connectionsCount: number;
  communityJoinedCount: number;
  journalCount: number;
}

function computeStageForPoints(
  points: number,
  stages: { threshold: number; title: string; visual: string; hint: string }[]
): {
  stage: 1 | 2 | 3 | 4;
  stageTitle: string;
  visualDescription: string;
  nextMilestoneText: string;
  nextStageThreshold: number | null;
  progressPercent: number;
} {
  let idx = 0;
  for (let i = 0; i < stages.length; i++) {
    if (points >= stages[i].threshold) {
      idx = i;
    }
  }
  const current = stages[idx];
  const next = stages[idx + 1] ?? null;

  let progressPercent = 100;
  if (next) {
    const span = Math.max(1, next.threshold - current.threshold);
    progressPercent = Math.min(100, Math.max(0, Math.round(((points - current.threshold) / span) * 100)));
  }

  return {
    stage: (idx + 1) as 1 | 2 | 3 | 4,
    stageTitle: current.title,
    visualDescription: current.visual,
    nextMilestoneText: next
      ? `${next.hint} (${next.threshold - points} more growth ${next.threshold - points === 1 ? 'action' : 'actions'} to reach ${next.title})`
      : 'Fully flourishing — keep nurturing your real-world craft at your own pace.',
    nextStageThreshold: next ? next.threshold : null,
    progressPercent,
  };
}

export function computeWorldGrowth(input: WorldGrowthInput): WorldGrowthState {
  const treePoints =
    input.treeMissions +
    input.skillsCount +
    input.skillPracticeSessions +
    input.approvedChallenges * 2;

  const housePoints =
    input.houseMissions +
    input.connectionsCount +
    input.communityJoinedCount * 2 +
    input.journalCount;

  const carPoints =
    input.carMissions +
    input.projectsCount * 2 +
    input.projectUpdatesCount +
    input.approvedProjects * 2;

  const treeStage = computeStageForPoints(treePoints, [
    {
      threshold: 0,
      title: 'Planted Sapling',
      visual: 'A young sapling taking root in warm soil.',
      hint: 'Practice a skill or complete a learning/reading mission',
    },
    {
      threshold: 2,
      title: 'Growing Sapling',
      visual: 'Fresh emerald leaves and sturdy young branches.',
      hint: 'Log another skill practice session or learning mission',
    },
    {
      threshold: 5,
      title: 'Blossoming Canopy',
      visual: 'Full leafy crown dotted with warm blossoms.',
      hint: 'Complete a reviewed skill challenge or deeper study',
    },
    {
      threshold: 9,
      title: 'Flourishing Grove Tree',
      visual: 'Deep roots, shaded branches, and vibrant seasonal fruit.',
      hint: 'Continue practicing skills',
    },
  ]);

  const houseStage = computeStageForPoints(housePoints, [
    {
      threshold: 0,
      title: 'Quiet Sanctuary',
      visual: 'A simple timber cottage resting beside the meadow.',
      hint: 'Log an offline experience, reflection, or real-world connection',
    },
    {
      threshold: 2,
      title: 'Warm Porch & Garden',
      visual: 'A welcoming porch with flowering planter boxes and warm windows.',
      hint: 'Join a shared offline mission or invite someone you know',
    },
    {
      threshold: 5,
      title: 'Lived-In Gathering Home',
      visual: 'Expanded studio eaves, garden pergola, and glowing hearth.',
      hint: 'Keep nurturing offline moments and community participation',
    },
    {
      threshold: 9,
      title: 'Open Community Hearth',
      visual: 'A vibrant home surrounded by lush garden beds and lantern-lit paths.',
      hint: 'Continue meaningful offline living',
    },
  ]);

  const carStage = computeStageForPoints(carPoints, [
    {
      threshold: 0,
      title: 'Workshop Frame',
      visual: 'A clean chassis waiting in the open air for your first original idea.',
      hint: 'Start an original project or finish a creative mission',
    },
    {
      threshold: 2,
      title: 'Hand-Painted Roadster',
      visual: 'Bright cobalt bodywork and fresh wheels ready for local ideas.',
      hint: 'Log a project update or publish an original creation',
    },
    {
      threshold: 5,
      title: 'Maker Touring Car',
      visual: 'Equipped with roof-rack sketchbooks, tools, and project gear.',
      hint: 'Get an original project reviewed or ship another milestone',
    },
    {
      threshold: 9,
      title: 'Horizon Expedition Van',
      visual: 'A custom-built mobile studio carrying tangible community projects.',
      hint: 'Continue building original real-world work',
    },
  ]);

  const treeAccomplishments: string[] = [];
  if (input.skillsCount > 0) treeAccomplishments.push(`${input.skillsCount} skill${input.skillsCount === 1 ? '' : 's'} tracked`);
  if (input.skillPracticeSessions > 0) treeAccomplishments.push(`${input.skillPracticeSessions} hands-on practice session${input.skillPracticeSessions === 1 ? '' : 's'}`);
  if (input.treeMissions > 0) treeAccomplishments.push(`${input.treeMissions} learning/growth offline mission${input.treeMissions === 1 ? '' : 's'}`);
  if (input.approvedChallenges > 0) treeAccomplishments.push(`${input.approvedChallenges} reviewer-verified skill challenge${input.approvedChallenges === 1 ? '' : 's'}`);

  const houseAccomplishments: string[] = [];
  if (input.houseMissions > 0) houseAccomplishments.push(`${input.houseMissions} offline life & nature mission${input.houseMissions === 1 ? '' : 's'}`);
  if (input.journalCount > 0) houseAccomplishments.push(`${input.journalCount} personal journal reflection${input.journalCount === 1 ? '' : 's'}`);
  if (input.connectionsCount > 0) houseAccomplishments.push(`${input.connectionsCount} real-life connection${input.connectionsCount === 1 ? '' : 's'}`);
  if (input.communityJoinedCount > 0) houseAccomplishments.push(`${input.communityJoinedCount} shared community mission${input.communityJoinedCount === 1 ? '' : 's'}`);

  const carAccomplishments: string[] = [];
  if (input.projectsCount > 0) carAccomplishments.push(`${input.projectsCount} original project${input.projectsCount === 1 ? '' : 's'} started`);
  if (input.projectUpdatesCount > 0) carAccomplishments.push(`${input.projectUpdatesCount} project progress update${input.projectUpdatesCount === 1 ? '' : 's'}`);
  if (input.carMissions > 0) carAccomplishments.push(`${input.carMissions} creative offline mission${input.carMissions === 1 ? '' : 's'}`);
  if (input.approvedProjects > 0) carAccomplishments.push(`${input.approvedProjects} reviewer-verified original project${input.approvedProjects === 1 ? '' : 's'}`);

  return {
    tree: { ...treeStage, points: treePoints, accomplishments: treeAccomplishments },
    house: { ...houseStage, points: housePoints, accomplishments: houseAccomplishments },
    car: { ...carStage, points: carPoints, accomplishments: carAccomplishments },
    totalGrowthStage: treeStage.stage + houseStage.stage + carStage.stage,
  };
}

export interface WorldElementMeta {
  id: WorldElementId;
  name: string;
  pillar: string;
  role: string;
  actionRoute: 'grow' | 'choose' | 'create' | 'connect';
  actionLabel: string;
}

export const WORLD_ELEMENTS_META: Record<WorldElementId, WorldElementMeta> = {
  tree: {
    id: 'tree',
    name: 'The Tree',
    pillar: 'LET ME GROW',
    role: 'Personal growth, practical learning, and steady skill development.',
    actionRoute: 'grow',
    actionLabel: 'Practice a Skill',
  },
  house: {
    id: 'house',
    name: 'The House',
    pillar: 'LET ME CONNECT',
    role: 'Meaningful offline life, personal reflections, and real relationships.',
    actionRoute: 'connect',
    actionLabel: 'Explore Offline Life & Connection',
  },
  car: {
    id: 'car',
    name: 'The Car',
    pillar: 'LET ME CREATE',
    role: 'Original projects, hands-on creativity, and tangible achievements.',
    actionRoute: 'create',
    actionLabel: 'Build an Original Project',
  },
};

export interface RecommendationQuery {
  interests: string[];
  mood?: MoodType;
  availableMinutes?: number;
  completedActivityIds?: string[];
  impulseTrigger?: ImpulseTrigger;
  limit?: number;
}

const IMPULSE_TO_MOOD: Record<ImpulseTrigger, MoodType> = {
  bored: 'bored',
  stressed: 'stressed',
  lonely: 'lonely',
  habit: 'curious',
  break: 'tired',
};

export function recommendActivities(
  activities: Activity[],
  query: RecommendationQuery
): Activity[] {
  const targetMood = query.impulseTrigger
    ? IMPULSE_TO_MOOD[query.impulseTrigger]
    : query.mood;

  const completedSet = new Set(query.completedActivityIds ?? []);
  const interestLower = query.interests.map((i) => i.toLowerCase());

  const scored = activities.map((activity) => {
    let score = 0;

    if (!completedSet.has(activity.id)) {
      score += 15;
    }

    if (targetMood && activity.moods.includes(targetMood)) {
      score += 30;
    }

    if (query.availableMinutes !== undefined) {
      if (activity.durationMinutes <= query.availableMinutes) {
        score += 25;
      } else if (activity.durationMinutes <= query.availableMinutes + 10) {
        score += 8;
      } else {
        score -= 20;
      }
    }

    const catLower = activity.category.toLowerCase();
    const titleLower = activity.title.toLowerCase();
    for (const interest of interestLower) {
      if (catLower.includes(interest) || titleLower.includes(interest)) {
        score += 18;
      }
    }

    if (query.impulseTrigger === 'lonely' && ['Family', 'Friendship', 'Community', 'Kindness'].includes(activity.category)) {
      score += 25;
    }
    if (query.impulseTrigger === 'bored' && ['Creativity', 'Learning'].includes(activity.category)) {
      score += 20;
    }
    if (query.impulseTrigger === 'stressed' && ['Nature', 'Reading'].includes(activity.category)) {
      score += 22;
    }

    return { activity, score };
  });

  scored.sort((a, b) => b.score - a.score);
  const limit = query.limit ?? 3;
  return scored.slice(0, limit).map((s) => s.activity);
}

export interface MilestoneDefinition {
  id: string;
  name: string;
  description: string;
  worldElement: WorldElementId;
  earned: boolean;
}

export interface MilestoneInput {
  completedMissions: number;
  declaredOfflineMinutes: number;
  skillsCount: number;
  approvedChallenges: number;
  projectsCount: number;
  communityJoinedCount: number;
  journalCount: number;
}

export function evaluateMilestones(input: MilestoneInput): MilestoneDefinition[] {
  return [
    {
      id: 'first-offline-step',
      name: 'First Offline Step',
      description: 'Completed your first intentional screen-free activity.',
      worldElement: 'house',
      earned: input.completedMissions >= 1,
    },
    {
      id: 'rooted-learner',
      name: 'Rooted Learner',
      description: 'Added or practiced at least 2 real-world skills.',
      worldElement: 'tree',
      earned: input.skillsCount >= 2 || input.completedMissions >= 2,
    },
    {
      id: 'original-maker',
      name: 'Original Maker',
      description: 'Started an original project instead of copying trends.',
      worldElement: 'car',
      earned: input.projectsCount >= 1,
    },
    {
      id: 'verified-craft',
      name: 'Reviewer-Verified Practice',
      description: 'Completed and received human feedback on a practice challenge.',
      worldElement: 'tree',
      earned: input.approvedChallenges >= 1,
    },
    {
      id: 'present-hour',
      name: '60 Offline Minutes',
      description: 'Reported 60+ minutes spent in real-world activities.',
      worldElement: 'house',
      earned: input.declaredOfflineMinutes >= 60,
    },
    {
      id: 'community-neighbor',
      name: 'Community Participant',
      description: 'Joined a shared neighbourhood or family offline activity.',
      worldElement: 'house',
      earned: input.communityJoinedCount >= 1,
    },
  ];
}

export function canTransitionSubmissionStatus(
  current: SubmissionStatus,
  next: SubmissionStatus,
  actorRole: UserRole
): boolean {
  if (actorRole !== 'admin') {
    if (current === 'accepted' && next === 'submitted') {
      return true;
    }
    return false;
  }

  const allowedAdminTargets: SubmissionStatus[] = [
    'approved',
    'revision_requested',
    'rejected',
  ];
  return (
    (current === 'submitted' || current === 'revision_requested') &&
    allowedAdminTargets.includes(next)
  );
}

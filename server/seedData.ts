import type {
  Activity,
  AuditLogEntry,
  ChallengeSubmission,
  CommunityMission,
  ConnectionRecord,
  JournalEntry,
  MissionSession,
  NotificationItem,
  OriginalProject,
  PracticeChallenge,
  RealExperienceCard,
  UserRecord,
  UserSkill,
} from '../src/shared/types';
import { hashPassword } from './auth';

export interface PasswordResetRecord {
  id: string;
  userId: string;
  email: string;
  codeHash: string;
  expiresAt: number;
  used: boolean;
}

export interface DatabaseState {
  schemaVersion: number;
  users: UserRecord[];
  activities: Activity[];
  missionSessions: MissionSession[];
  skills: UserSkill[];
  practiceChallenges: PracticeChallenge[];
  submissions: ChallengeSubmission[];
  projects: OriginalProject[];
  connections: ConnectionRecord[];
  communityMissions: CommunityMission[];
  experiences: RealExperienceCard[];
  journalEntries: JournalEntry[];
  notifications: NotificationItem[];
  auditLogs: AuditLogEntry[];
  passwordResets: PasswordResetRecord[];
}

export const CURRENT_SCHEMA_VERSION = 3;

export function createInitialDatabase(): DatabaseState {
  const demoPass = hashPassword('findikoo-demo-2026');
  const adminPass = hashPassword('findikoo-admin-2026');

  const users: UserRecord[] = [
    {
      id: 'user-maya',
      name: 'Maya Lin (Demo)',
      email: 'maya@findikoo.app',
      passwordHash: demoPass,
      role: 'user',
      ageGroup: '18+',
      adultConfirmed: true,
      declaredOfflineMinutes: 85,
      completedActivityIds: ['act-sketch-local-tree', 'act-quiet-reading'],
      onboarding: {
        completed: true,
        interests: ['Design', 'Nature', 'Photography', 'Writing'],
        currentSkills: ['Graphic Design', 'Illustration'],
        learningGoals: ['Visual Storytelling', 'Botanical Sketching'],
        personalGoals: ['Create original projects instead of passive scrolling'],
        dailyFreeMinutes: 30,
        enjoyedActivities: ['Sketching outdoors', 'Walking without my phone'],
        scrollTriggers: ['Boredom in the evening', 'Habitual phone checks'],
        aspiration: 'Build real local craft and spend unhurried evenings offline.',
      },
      privacyMode: 'connections',
      assignedSupervisorId: 'user-admin',
      createdAt: '2026-11-10T09:00:00.000Z',
      isDemoAccount: true,
    },
    {
      id: 'user-admin',
      name: 'Arjun Nair (Supervisor Demo)',
      email: 'admin@findikoo.app',
      passwordHash: adminPass,
      role: 'admin',
      ageGroup: '18+',
      adultConfirmed: true,
      declaredOfflineMinutes: 140,
      completedActivityIds: ['act-quiet-reading'],
      onboarding: {
        completed: true,
        interests: ['Education', 'Community', 'Design'],
        currentSkills: ['Creative Review', 'Community Moderation'],
        learningGoals: ['Curriculum Design'],
        personalGoals: ['Support authentic original creators'],
        dailyFreeMinutes: 30,
        enjoyedActivities: ['Reviewing community projects'],
        scrollTriggers: ['Late evening'],
        aspiration: 'Keep Findikoo human, grounded, and honest.',
      },
      privacyMode: 'private',
      assignedSupervisorId: null,
      createdAt: '2026-11-01T08:00:00.000Z',
      isDemoAccount: true,
    },
  ];

  const activities: Activity[] = [
    {
      id: 'act-sketch-local-tree',
      title: 'Draw a Real Tree From Observation',
      description: 'Step outside with paper and pen—no reference photos, no tutorials. Study the branches and shadows around you.',
      category: 'Creativity',
      durationMinutes: 20,
      difficulty: 'Gentle',
      worldElement: 'car',
      materialsNeeded: 'Plain paper and a pen or pencil',
      outdoors: true,
      relevanceReason: 'Sharpens observational craft away from visual feeds.',
      moods: ['bored', 'curious'],
      instructions: [
        'Grab any plain sheet of paper and a pen or pencil.',
        'Step near a window, yard, or park and leave your phone in your pocket.',
        'Spend 15 minutes drawing just the shape of one tree or plant.',
      ],
      offlineRequired: true,
    },
    {
      id: 'act-plant-seed',
      title: 'Plant & Label a Kitchen Scrap Herb',
      description: 'Use a pot, cup, or garden patch to root an herb cutting or seed and care for it over the week.',
      category: 'Nature',
      durationMinutes: 15,
      difficulty: 'Gentle',
      worldElement: 'house',
      materialsNeeded: 'Small pot or jar, soil or water, kitchen herb cutting',
      outdoors: true,
      relevanceReason: 'Grounds attention in tactile care and brings life to your space.',
      moods: ['stressed', 'bored', 'curious'],
      instructions: [
        'Find a small container with drainage or a sunny windowsill jar.',
        'Plant seeds or place a fresh basil/mint stem in clean water.',
        'Write a hand-lettered date marker and place it in natural light.',
      ],
      offlineRequired: true,
    },
    {
      id: 'act-quiet-reading',
      title: '25-Minute Uninterrupted Book Chapter',
      description: 'Read a physical book or printed essay in another room from your phone.',
      category: 'Reading',
      durationMinutes: 25,
      difficulty: 'Gentle',
      worldElement: 'tree',
      materialsNeeded: 'A physical book or printed article',
      outdoors: false,
      relevanceReason: 'Restores deep reading focus after fragmented feed browsing.',
      moods: ['stressed', 'tired', 'curious'],
      instructions: [
        'Place your phone on silent in another room.',
        'Read one full chapter or 15 pages at your own pace.',
        'Jot down one idea afterwards that surprised you.',
      ],
      offlineRequired: true,
    },
    {
      id: 'act-kindness-note',
      title: 'Write & Deliver a Real Handwritten Note',
      description: 'Replace a quick reaction emoji with a thoughtful handwritten note for family, a friend, or a neighbour.',
      category: 'Kindness',
      durationMinutes: 15,
      difficulty: 'Gentle',
      worldElement: 'house',
      materialsNeeded: 'Card or folded paper and a pen',
      outdoors: false,
      relevanceReason: 'Turns passive loneliness into real human warmth.',
      moods: ['lonely', 'stressed'],
      instructions: [
        'Think of someone you appreciate or have not checked on recently.',
        'Write 4–6 honest sentences on paper.',
        'Leave it on their table, slip it under their door, or mail it.',
      ],
      offlineRequired: true,
    },
    {
      id: 'act-design-sprint',
      title: 'Sketch 3 Original Poster Layouts on Paper',
      description: 'Pick a real neighbourhood event or personal idea and sketch 3 original visual compositions without looking at templates.',
      category: 'Learning',
      durationMinutes: 30,
      difficulty: 'Moderate',
      worldElement: 'car',
      materialsNeeded: 'Notebook or A4 paper and two pens',
      outdoors: false,
      relevanceReason: 'Builds original layout thinking before opening any screen.',
      moods: ['bored', 'curious', 'energetic'],
      instructions: [
        'Choose a real local event, club, or personal project.',
        'Draw 3 distinct thumbnail compositions with bold hand-lettered hierarchy.',
        'Select your strongest concept to refine later.',
      ],
      offlineRequired: true,
    },
    {
      id: 'act-outdoor-walk',
      title: 'Phone-Free Brisk Walk & Sensory Reset',
      description: 'Move your body outside for 20 minutes without podcasts or scrolling, noticing your surroundings.',
      category: 'Fitness',
      durationMinutes: 20,
      difficulty: 'Gentle',
      worldElement: 'house',
      materialsNeeded: 'Comfortable walking shoes',
      outdoors: true,
      relevanceReason: 'Clears mental fog and resets nervous energy naturally.',
      moods: ['stressed', 'tired', 'energetic'],
      instructions: [
        'Stretch shoulders and calves for 2 minutes.',
        'Walk briskly outdoors without headphones or scrolling.',
        'Notice 3 sounds and 2 colors you had not spotted before.',
      ],
      offlineRequired: true,
    },
    {
      id: 'act-nature-field-notes',
      title: 'Field Notes Walk: Document Local Plants',
      description: 'Explore a park or street tree canopy and record 5 species or leaf textures in a pocket notebook.',
      category: 'Nature',
      durationMinutes: 45,
      difficulty: 'Deep Focus',
      worldElement: 'tree',
      materialsNeeded: 'Pocket notebook and pencil',
      outdoors: true,
      relevanceReason: 'Combines outdoor movement with patient personal study.',
      moods: ['curious', 'stressed'],
      instructions: [
        'Bring a pocket notebook (leave phone on silent or at home).',
        'Observe 5 plants, birds, or bark textures closely.',
        'Write brief field observations on what makes each distinctive.',
      ],
      offlineRequired: true,
    },
    {
      id: 'act-shared-meal',
      title: 'Cook a Simple Dish Together From Scratch',
      description: 'Spend 30 minutes preparing a meal or tea with someone in your household or a friend.',
      category: 'Family',
      durationMinutes: 30,
      difficulty: 'Moderate',
      worldElement: 'house',
      materialsNeeded: 'Basic kitchen ingredients already at home',
      outdoors: false,
      relevanceReason: 'Replaces solitary evening scrolling with shared everyday life.',
      moods: ['lonely', 'bored'],
      instructions: [
        'Choose a recipe using ingredients already in your kitchen.',
        'Invite a partner, housemate, or friend to cook alongside you.',
        'Eat together with phones kept in another room.',
      ],
      offlineRequired: true,
    },
    {
      id: 'act-practical-guide',
      title: 'Draft a 1-Page Practical Guide From Experience',
      description: 'Turn something you genuinely know how to do into a clear beginner guide on paper.',
      category: 'Personal Development',
      durationMinutes: 40,
      difficulty: 'Deep Focus',
      worldElement: 'tree',
      materialsNeeded: 'Notebook and pen',
      outdoors: false,
      relevanceReason: 'Consolidates what you have learned through real practice.',
      moods: ['curious', 'lonely'],
      instructions: [
        'Pick one real-world skill you have practiced.',
        'Outline 5 practical mistakes beginners make and how to avoid them.',
        'Keep it as a reference or share with someone learning.',
      ],
      offlineRequired: true,
    },
  ];

  const missionSessions: MissionSession[] = [
    {
      id: 'ms-seed-1',
      userId: 'user-maya',
      activityId: 'act-sketch-local-tree',
      activityTitle: 'Draw a Real Tree From Observation',
      category: 'Creativity',
      worldElement: 'car',
      plannedMinutes: 20,
      elapsedSeconds: 1320,
      status: 'completed',
      verificationType: 'self_reported',
      whatDidYouDo: 'Sketched the jacaranda tree outside my studio window with a fountain pen.',
      whatDidYouLearn: 'Branch angles repeat in smaller rhythms—observing beats copying references.',
      howDidYouFeel: 'Calm, focused, and did not check my phone once.',
      startedAt: '2026-11-15T16:00:00.000Z',
      completedAt: '2026-11-15T16:22:00.000Z',
    },
    {
      id: 'ms-seed-2',
      userId: 'user-maya',
      activityId: 'act-quiet-reading',
      activityTitle: '25-Minute Uninterrupted Book Chapter',
      category: 'Reading',
      worldElement: 'tree',
      plannedMinutes: 25,
      elapsedSeconds: 1500,
      status: 'completed',
      verificationType: 'self_reported',
      whatDidYouDo: 'Read two chapters of Ways of Seeing on the balcony.',
      whatDidYouLearn: 'How visual framing shapes what people notice.',
      howDidYouFeel: 'Mentally clear instead of foggy.',
      startedAt: '2026-11-16T08:15:00.000Z',
      completedAt: '2026-11-16T08:40:00.000Z',
    },
  ];

  const skills: UserSkill[] = [
    {
      id: 'sk-1',
      userId: 'user-maya',
      name: 'Graphic Design & Poster Layout',
      category: 'Graphic Design',
      level: 'Developing',
      goal: 'Design 3 original flyers for local community gatherings',
      hoursPracticed: 6,
      practiceSessions: 3,
    },
    {
      id: 'sk-2',
      userId: 'user-maya',
      name: 'Observational Sketching',
      category: 'Creative Arts',
      level: 'Beginner',
      goal: 'Fill 10 pages drawing local trees and architecture from life',
      hoursPracticed: 2,
      practiceSessions: 2,
    },
  ];

  const practiceChallenges: PracticeChallenge[] = [
    {
      id: 'ch-poster-garden',
      title: 'Hand-Lettered Community Seed Swap Poster',
      description: 'Design an inviting print-ready poster concept for a Saturday seed exchange using original motifs—no trend templates.',
      category: 'Graphic Design',
      requiredSkills: ['Typography', 'Layout', 'Illustration'],
      difficulty: 'Starter',
      estimatedMinutes: 60,
      worldElement: 'tree',
      materialsNeeded: 'Paper, markers or design software',
      instructions: [
        'Focus on warm organic hierarchy and clear event details (Date, Location, What to Bring).',
        'Include an original botanical or hand-drawn motif.',
        'Summarize your design choices for human reviewer feedback.',
      ],
      submissionRequirements: 'Submit concept notes, layout choices, and artifact reference for independent reviewer feedback.',
    },
    {
      id: 'ch-book-swap-page',
      title: 'Accessible Neighbourhood Book-Swap List',
      description: 'Build a clean, distraction-free single-page form or printed sheet helping neighbours list books they want to lend.',
      category: 'Programming',
      requiredSkills: ['HTML/CSS', 'UI Clarity'],
      difficulty: 'Challenge',
      estimatedMinutes: 90,
      worldElement: 'car',
      materialsNeeded: 'Code editor or paper wireframe',
      instructions: [
        'Keep contrast crisp and navigation minimal.',
        'Avoid vanity counters or social badges.',
        'Explain how a local library or hallway board could use it.',
      ],
      submissionRequirements: 'Repository or prototype summary + short explanation for reviewer verification.',
    },
    {
      id: 'ch-photo-essay',
      title: '5-Frame Photo Essay: Everyday Craftspeople',
      description: 'Photograph and caption 5 people working with their hands (bakers, gardeners, cobblers, teachers) with their consent.',
      category: 'Photography',
      requiredSkills: ['Observation', 'Storytelling', 'Composition'],
      difficulty: 'Intermediate',
      estimatedMinutes: 75,
      worldElement: 'car',
      materialsNeeded: 'Camera or phone on airplane mode',
      instructions: [
        'Ask permission warmly before photographing anyone.',
        'Capture natural light and the tools of their craft.',
        'Write a 2-sentence story caption for each frame.',
      ],
      submissionRequirements: '5-frame notes or gallery reference + consent confirmation.',
    },
    {
      id: 'ch-written-guide',
      title: 'Write a Practical 500-Word How-To Field Note',
      description: 'Teach one hands-on skill you practice in plain, encouraging prose without relying on video clips.',
      category: 'Writing',
      requiredSkills: ['Clarity', 'Structuring'],
      difficulty: 'Starter',
      estimatedMinutes: 45,
      worldElement: 'tree',
      materialsNeeded: 'Notebook or distraction-free editor',
      instructions: [
        'Choose one skill you have practiced firsthand.',
        'Include materials needed, common pitfalls, and a 15-minute first exercise.',
        'Read it aloud once to check clarity.',
      ],
      submissionRequirements: 'Paste or link your guide summary for reviewer feedback.',
    },
  ];

  const submissions: ChallengeSubmission[] = [
    {
      id: 'sub-seed-1',
      challengeId: 'ch-poster-garden',
      challengeTitle: 'Hand-Lettered Community Seed Swap Poster',
      userId: 'user-maya',
      userName: 'Maya Lin (Demo)',
      summary: 'Hand-lettered brush headline with terracotta pot and sprouting leaves on warm cream paper.',
      workUrlOrArtifact: 'seed-swap-poster-sketch-v1.pdf',
      reflection: 'Practiced balancing large expressive display text with legible small event times.',
      status: 'submitted',
      verificationType: 'pending_review',
      submittedAt: '2026-11-16T18:20:00.000Z',
    },
  ];

  const projects: OriginalProject[] = [
    {
      id: 'proj-seed-1',
      userId: 'user-maya',
      userName: 'Maya Lin (Demo)',
      title: 'Neighbourhood Repair Cafe Visual Wayfinding Kit',
      category: 'Design',
      problemStatement: 'Visitors at our monthly community repair cafe felt unsure which table fixes electronics vs. textiles.',
      solutionIdea: 'Created hand-illustrated table banners and clear tool icons printed on recycled cardstock.',
      description: 'An original visual signage kit built for real volunteers instead of creating another design Reel.',
      updates: [
        {
          id: 'upd-1',
          text: 'Tested paper mockups at the Saturday community hall—volunteers found the color-coded zones immediately helpful.',
          createdAt: '2026-11-15T11:00:00.000Z',
        },
      ],
      artifactSummary: '6 printable illustrated banners + volunteer guide sheet',
      impactNotes: 'Helped neighbours find the right repair table calmly.',
      status: 'submitted',
      verificationType: 'self_reported',
      publishedToPortfolio: true,
      createdAt: '2026-11-12T10:00:00.000Z',
      updatedAt: '2026-11-15T11:00:00.000Z',
    },
  ];

  const connections: ConnectionRecord[] = [
    {
      id: 'conn-1',
      userId: 'user-maya',
      peerName: 'Samir Rao',
      relationType: 'Friend',
      sharedInterest: 'Weekend Sketching & Walking',
      status: 'approved',
      createdAt: '2026-11-09T12:00:00.000Z',
    },
    {
      id: 'conn-2',
      userId: 'user-maya',
      peerName: 'Elena Brooks',
      relationType: 'Mentor',
      sharedInterest: 'Community Design & Writing',
      status: 'approved',
      createdAt: '2026-11-12T15:00:00.000Z',
    },
  ];

  const communityMissions: CommunityMission[] = [
    {
      id: 'cm-1',
      title: 'Saturday Park Sketch & Clean-Up Morning',
      description: 'Spend 30 minutes picking up litter in a local park, then 20 minutes sketching something you noticed.',
      category: 'Environment',
      participantsCount: 14,
      joinedUserIds: [],
      impactGoal: 'Care for shared green spaces while practicing slow observation.',
      locationLabel: 'Your Local Park',
    },
    {
      id: 'cm-2',
      title: 'Open Skill Swap: Teach One Practical Thing',
      description: 'Host a 30-minute coffee or library table session teaching a friend or neighbour a practical skill you know.',
      category: 'Skill Sharing',
      participantsCount: 9,
      joinedUserIds: ['user-maya'],
      impactGoal: 'Replace passive tutorial watching with real human mentorship.',
      locationLabel: 'Community Library / Neighbourhood',
    },
    {
      id: 'cm-3',
      title: 'Screen-Free Sunday Table',
      description: 'Cook a meal, play a board game, or share stories with family or housemates for 45 phone-free minutes.',
      category: 'Family & Friends',
      participantsCount: 22,
      joinedUserIds: [],
      impactGoal: 'Build warm offline memories together.',
      locationLabel: 'At Home',
    },
  ];

  const experiences: RealExperienceCard[] = [
    {
      id: 'exp-1',
      userId: 'user-maya',
      authorName: 'Maya Lin (Demo)',
      type: 'Created',
      headline: 'Printed physical signage for our local repair cafe',
      story: 'First time seeing my illustrations taped up in a real room helping real people—far more fulfilling than chasing online views.',
      createdAt: '2026-11-16T13:00:00.000Z',
    },
  ];

  const journalEntries: JournalEntry[] = [
    {
      id: 'jr-1',
      userId: 'user-maya',
      title: 'First weekend without morning doomscrolling',
      activityDone: 'Drew the tree outside my window and walked to the bakery without headphones.',
      learned: 'My mind comes up with original ideas when it is not fed someone else’s feed first thing in the morning.',
      feeling: 'Lighter, present, and calm.',
      helpedSomeone: 'Delivered a quick thank-you postcard to my neighbour.',
      futureGoal: 'Finish the repair cafe signage kit.',
      privacy: 'private',
      verificationType: 'self_reported',
      createdAt: '2026-11-15T19:00:00.000Z',
    },
  ];

  const notifications: NotificationItem[] = [
    {
      id: 'not-1',
      userId: 'user-maya',
      title: 'Your World Is Growing',
      message: 'This is a demonstration profile with sample entries. New accounts start fresh with Stage 1 Tree, House, and Car.',
      read: false,
      createdAt: '2026-11-16T09:00:00.000Z',
    },
  ];

  const auditLogs: AuditLogEntry[] = [
    {
      id: 'aud-1',
      actorId: 'user-admin',
      actorEmail: 'admin@findikoo.app',
      action: 'SYSTEM_SEED_INITIALIZED',
      targetType: 'system',
      targetId: 'findikoo-mvp',
      details: 'Initialized adult-only demonstration accounts, offline activities, practice challenges, supervision assignment, and review queue.',
      createdAt: '2026-11-16T08:00:00.000Z',
    },
  ];

  return {
    schemaVersion: CURRENT_SCHEMA_VERSION,
    users,
    activities,
    missionSessions,
    skills,
    practiceChallenges,
    submissions,
    projects,
    connections,
    communityMissions,
    experiences,
    journalEntries,
    notifications,
    auditLogs,
    passwordResets: [],
  };
}

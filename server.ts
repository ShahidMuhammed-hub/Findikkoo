import 'dotenv/config';
import crypto from 'node:crypto';
import express, { type NextFunction, type Response } from 'express';
import fs from 'node:fs';
import path from 'node:path';
import { createServer as createViteServer } from 'vite';
import {
  canTransitionSubmissionStatus,
  computeWorldGrowth,
  evaluateMilestones,
  recommendActivities,
} from './src/shared/rules';
import type {
  Activity,
  ImpulseTrigger,
  MoodType,
  OriginalProject,
  ProjectStatus,
  SubmissionStatus,
  WorldElementId,
} from './src/shared/types';
import {
  type AuthenticatedRequest,
  extractToken,
  hashPassword,
  hashResetCode,
  requireRole,
  signSessionToken,
  toPublicUser,
  verifyPassword,
  verifyResetCode,
  verifySessionToken,
} from './server/auth';
import {
  brainstormOriginalProject,
  generateActivitySuggestions,
  generateSkillRoadmap,
  generateWeeklySummary,
} from './server/gemini';
import { appendAuditLog, getDb, saveDb, uid } from './server/store';

const PORT = Number(process.env.PORT) || 3000;
const isProd = process.env.NODE_ENV === 'production';

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '2mb' }));

  app.use((req: AuthenticatedRequest, _res: Response, next: NextFunction) => {
    const token = extractToken(req);
    if (token) {
      const payload = verifySessionToken(token);
      if (payload) {
        const db = getDb();
        const found = db.users.find((u) => u.id === payload.userId);
        if (found) {
          req.authUser = found;
        }
      }
    }
    next();
  });

  function requireAuth(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) {
    if (!req.authUser) {
      res.status(401).json({ error: 'Please sign in to continue.' });
      return;
    }
    next();
  }

  function setSessionCookie(res: Response, token: string) {
    res.setHeader(
      'Set-Cookie',
      `findikoo_token=${encodeURIComponent(token)}; Path=/; HttpOnly; SameSite=Lax${isProd ? '; Secure' : ''}; Max-Age=604800`
    );
  }

  function buildProgressForUser(userId: string) {
    const db = getDb();
    const user = db.users.find((u) => u.id === userId)!;
    const completedSessions = db.missionSessions.filter(
      (s) => s.userId === user.id && s.status === 'completed'
    );
    const mySkills = db.skills.filter((s) => s.userId === user.id);
    const mySubmissions = db.submissions.filter((s) => s.userId === user.id);
    const approvedChallenges = mySubmissions.filter((s) => s.status === 'approved').length;
    const myProjects = db.projects.filter((p) => p.userId === user.id);
    const approvedProjects = myProjects.filter((p) => p.status === 'approved').length;
    const projectUpdatesCount = myProjects.reduce((acc, p) => acc + p.updates.length, 0);
    const myConnections = db.connections.filter((c) => c.userId === user.id);
    const joinedCommunity = db.communityMissions.filter((m) =>
      m.joinedUserIds.includes(user.id)
    ).length;
    const myJournals = db.journalEntries.filter((j) => j.userId === user.id);
    const notifications = db.notifications.filter((n) => n.userId === user.id);

    const treeMissions = completedSessions.filter((s) => s.worldElement === 'tree').length;
    const houseMissions = completedSessions.filter((s) => s.worldElement === 'house').length;
    const carMissions = completedSessions.filter((s) => s.worldElement === 'car').length;
    const skillPracticeSessions = mySkills.reduce((acc, s) => acc + (s.practiceSessions || 0), 0);

    const worldGrowth = computeWorldGrowth({
      treeMissions,
      houseMissions,
      carMissions,
      skillsCount: mySkills.length,
      skillPracticeSessions,
      approvedChallenges,
      projectsCount: myProjects.length,
      projectUpdatesCount,
      approvedProjects,
      connectionsCount: myConnections.length,
      communityJoinedCount: joinedCommunity,
      journalCount: myJournals.length,
    });

    const milestones = evaluateMilestones({
      completedMissions: completedSessions.length,
      declaredOfflineMinutes: user.declaredOfflineMinutes,
      skillsCount: mySkills.length,
      approvedChallenges,
      projectsCount: myProjects.length,
      communityJoinedCount: joinedCommunity,
      journalCount: myJournals.length,
    });

    return {
      user: toPublicUser(user),
      stats: {
        completedMissions: completedSessions.length,
        declaredOfflineMinutes: user.declaredOfflineMinutes,
        skillsCount: mySkills.length,
        skillPracticeSessions,
        challengesSubmitted: mySubmissions.length,
        challengesVerified: approvedChallenges,
        projectsCreated: myProjects.length,
        projectsVerified: approvedProjects,
        communityJoined: joinedCommunity,
        connectionsCount: myConnections.length,
        journalCount: myJournals.length,
      },
      worldGrowth,
      milestones,
      notifications,
    };
  }

  // ---------------- AUTH ----------------
  app.post('/api/auth/register', (req, res) => {
    const { name, email, password, adultConfirmed } = req.body ?? {};
    if (!name || typeof name !== 'string' || name.trim().length < 2) {
      res.status(400).json({ error: 'Please enter a display name (at least 2 characters).' });
      return;
    }
    if (!email || typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      res.status(400).json({ error: 'Please enter a valid email address.' });
      return;
    }
    if (!password || typeof password !== 'string' || password.length < 8) {
      res.status(400).json({ error: 'Password must be at least 8 characters.' });
      return;
    }
    if (adultConfirmed !== true) {
      res.status(400).json({
        error: 'Registration is restricted to adults aged 18 or older. Please confirm you are 18+.',
      });
      return;
    }

    const db = getDb();
    const normalizedEmail = email.trim().toLowerCase();
    if (db.users.some((u) => u.email.toLowerCase() === normalizedEmail)) {
      res.status(409).json({ error: 'An account with this email already exists.' });
      return;
    }

    const newUser = {
      id: uid('user'),
      name: name.trim().slice(0, 80),
      email: normalizedEmail,
      passwordHash: hashPassword(password),
      role: 'user' as const,
      ageGroup: '18+' as const,
      adultConfirmed: true,
      declaredOfflineMinutes: 0,
      completedActivityIds: [],
      onboarding: {
        completed: false,
        interests: [],
        currentSkills: [],
        learningGoals: [],
        personalGoals: [],
        dailyFreeMinutes: 20,
        enjoyedActivities: [],
        scrollTriggers: [],
        aspiration: '',
      },
      privacyMode: 'private' as const,
      assignedSupervisorId: null,
      createdAt: new Date().toISOString(),
      isDemoAccount: false,
    };

    db.users.push(newUser);
    db.notifications.unshift({
      id: uid('not'),
      userId: newUser.id,
      title: 'Welcome to Findikoo',
      message: 'Your personal world starts fresh with Stage 1 Tree, House, and Car. Complete onboarding to personalize your activities.',
      read: false,
      createdAt: new Date().toISOString(),
    });
    appendAuditLog(
      db,
      newUser.id,
      newUser.email,
      'USER_REGISTERED',
      'user',
      newUser.id,
      'Adult (18+) account created'
    );
    saveDb(db);

    const token = signSessionToken(newUser);
    setSessionCookie(res, token);
    res.status(201).json({ user: toPublicUser(newUser), token });
  });

  app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body ?? {};
    if (!email || !password) {
      res.status(400).json({ error: 'Email and password are required.' });
      return;
    }
    const db = getDb();
    const user = db.users.find(
      (u) => u.email.toLowerCase() === String(email).trim().toLowerCase()
    );
    if (!user || !verifyPassword(String(password), user.passwordHash)) {
      res.status(401).json({ error: 'Invalid email or password.' });
      return;
    }
    const token = signSessionToken(user);
    setSessionCookie(res, token);
    res.json({ user: toPublicUser(user), token });
  });

  app.post('/api/auth/demo-login', (req, res) => {
    const { email } = req.body ?? {};
    const requested = String(email || '').trim().toLowerCase();
    const mappedEmail = requested.endsWith('@unscroll.app')
      ? requested.replace('@unscroll.app', '@findikoo.app')
      : requested;
    const db = getDb();
    const user = db.users.find(
      (u) => u.isDemoAccount && u.email.toLowerCase() === mappedEmail
    );
    if (!user) {
      res.status(404).json({ error: 'Demonstration account not found.' });
      return;
    }
    const token = signSessionToken(user);
    setSessionCookie(res, token);
    res.json({ user: toPublicUser(user), token });
  });

  app.post('/api/auth/logout', (_req, res) => {
    res.setHeader('Set-Cookie', [
      `findikoo_token=; Path=/; HttpOnly; SameSite=Lax${isProd ? '; Secure' : ''}; Max-Age=0`,
      `unscroll_token=; Path=/; HttpOnly; SameSite=Lax${isProd ? '; Secure' : ''}; Max-Age=0`,
    ]);
    res.json({ ok: true });
  });

  app.post('/api/auth/forgot-password', (req, res) => {
    const { email } = req.body ?? {};
    const normalizedEmail = String(email || '').trim().toLowerCase();
    if (!normalizedEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      res.status(400).json({ error: 'Enter a valid email address.' });
      return;
    }
    const db = getDb();
    const user = db.users.find((u) => u.email.toLowerCase() === normalizedEmail);
    if (!user) {
      res.json({
        resetSupported: true,
        message: 'If an account matches that email, a one-time reset code has been prepared.',
      });
      return;
    }
    if (user.isDemoAccount) {
      res.status(400).json({
        error:
          'Shared demonstration accounts use fixed sample credentials and cannot be reset. Create a personal account to test password reset.',
      });
      return;
    }

    // Invalidate earlier unused reset codes for this user
    for (const r of db.passwordResets) {
      if (r.userId === user.id && !r.used) {
        r.used = true;
      }
    }

    const rawCode = crypto.randomBytes(4).toString('hex').toUpperCase();
    db.passwordResets.unshift({
      id: uid('rst'),
      userId: user.id,
      email: user.email,
      codeHash: hashResetCode(rawCode),
      expiresAt: Date.now() + 15 * 60 * 1000,
      used: false,
    });
    if (db.passwordResets.length > 100) {
      db.passwordResets = db.passwordResets.slice(0, 100);
    }
    appendAuditLog(
      db,
      user.id,
      user.email,
      'PASSWORD_RESET_REQUESTED',
      'user',
      user.id,
      'Generated single-use password reset code'
    );
    saveDb(db);

    res.json({
      resetSupported: true,
      ...(isProd ? {} : { devResetCode: rawCode }),
      message: isProd
        ? 'If an account matches that email, check your email for a one-time reset code.'
        : 'Reset code generated (local preview mode — email delivery is not configured, so your single-use code is shown below).',
    });
  });

  app.post('/api/auth/reset-password', (req, res) => {
    const { email, code, newPassword } = req.body ?? {};
    const normalizedEmail = String(email || '').trim().toLowerCase();
    if (!normalizedEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      res.status(400).json({ error: 'Enter a valid email address.' });
      return;
    }
    if (!code || typeof code !== 'string' || code.trim().length < 4) {
      res.status(400).json({ error: 'Enter the reset code.' });
      return;
    }
    if (!newPassword || typeof newPassword !== 'string' || newPassword.length < 8) {
      res.status(400).json({ error: 'New password must be at least 8 characters.' });
      return;
    }

    const db = getDb();
    const user = db.users.find((u) => u.email.toLowerCase() === normalizedEmail);
    if (!user || user.isDemoAccount) {
      res.status(400).json({ error: 'Invalid or expired reset code.' });
      return;
    }

    const now = Date.now();
    const resetRecord = db.passwordResets.find(
      (r) =>
        r.userId === user.id &&
        !r.used &&
        r.expiresAt > now &&
        verifyResetCode(code, r.codeHash)
    );
    if (!resetRecord) {
      res.status(400).json({ error: 'Invalid or expired reset code.' });
      return;
    }

    resetRecord.used = true;
    user.passwordHash = hashPassword(newPassword);
    appendAuditLog(
      db,
      user.id,
      user.email,
      'PASSWORD_RESET_COMPLETED',
      'user',
      user.id,
      'Password updated using reset code'
    );
    saveDb(db);
    res.json({ ok: true, message: 'Password updated. You can now sign in with your new password.' });
  });

  // ---------------- USERS ----------------
  app.get('/api/users/me', (req: AuthenticatedRequest, res) => {
    res.json({ user: req.authUser ? toPublicUser(req.authUser) : null });
  });

  app.patch('/api/users/me', requireAuth, (req: AuthenticatedRequest, res) => {
    const db = getDb();
    const user = db.users.find((u) => u.id === req.authUser!.id);
    if (!user) {
      res.status(404).json({ error: 'User not found.' });
      return;
    }
    const { name, privacyMode } = req.body ?? {};
    if (name !== undefined) {
      if (typeof name !== 'string' || name.trim().length < 2) {
        res.status(400).json({ error: 'Display name must be at least 2 characters.' });
        return;
      }
      user.name = name.trim().slice(0, 80);
    }
    if (privacyMode !== undefined) {
      if (!['private', 'connections', 'community'].includes(privacyMode)) {
        res.status(400).json({ error: 'Invalid privacy setting.' });
        return;
      }
      user.privacyMode = privacyMode;
    }
    saveDb(db);
    res.json({ user: toPublicUser(user) });
  });

  app.patch('/api/users/me/password', requireAuth, (req: AuthenticatedRequest, res) => {
    const { currentPassword, newPassword } = req.body ?? {};
    const db = getDb();
    const user = db.users.find((u) => u.id === req.authUser!.id);
    if (!user) {
      res.status(404).json({ error: 'User not found.' });
      return;
    }
    if (user.isDemoAccount) {
      res.status(400).json({
        error: 'Demonstration account passwords cannot be changed. Create a personal account to update passwords.',
      });
      return;
    }
    if (!currentPassword || !verifyPassword(String(currentPassword), user.passwordHash)) {
      res.status(401).json({ error: 'Current password is incorrect.' });
      return;
    }
    if (!newPassword || typeof newPassword !== 'string' || newPassword.length < 8) {
      res.status(400).json({ error: 'New password must be at least 8 characters.' });
      return;
    }
    user.passwordHash = hashPassword(newPassword);
    appendAuditLog(
      db,
      user.id,
      user.email,
      'USER_PASSWORD_CHANGED',
      'user',
      user.id,
      'User updated account password'
    );
    saveDb(db);
    res.json({ ok: true, message: 'Password updated successfully.' });
  });

  app.patch('/api/users/me/onboarding', requireAuth, (req: AuthenticatedRequest, res) => {
    const db = getDb();
    const user = db.users.find((u) => u.id === req.authUser!.id);
    if (!user) {
      res.status(404).json({ error: 'User not found.' });
      return;
    }
    const body = req.body ?? {};
    if (typeof body.name === 'string' && body.name.trim().length >= 2) {
      user.name = body.name.trim().slice(0, 80);
    }
    if (body.adultConfirmed === true) {
      user.adultConfirmed = true;
    }
    if (!user.adultConfirmed) {
      res.status(400).json({ error: 'Please confirm you are 18 years of age or older.' });
      return;
    }
    user.onboarding = {
      completed: true,
      interests: Array.isArray(body.interests) ? body.interests.slice(0, 12) : user.onboarding.interests,
      currentSkills: Array.isArray(body.currentSkills) ? body.currentSkills.slice(0, 12) : user.onboarding.currentSkills,
      learningGoals: Array.isArray(body.learningGoals) ? body.learningGoals.slice(0, 12) : user.onboarding.learningGoals,
      personalGoals: Array.isArray(body.personalGoals) ? body.personalGoals.slice(0, 8) : user.onboarding.personalGoals,
      dailyFreeMinutes: Math.min(180, Math.max(5, Number(body.dailyFreeMinutes) || user.onboarding.dailyFreeMinutes || 20)),
      enjoyedActivities: Array.isArray(body.enjoyedActivities) ? body.enjoyedActivities.slice(0, 10) : user.onboarding.enjoyedActivities,
      scrollTriggers: Array.isArray(body.scrollTriggers) ? body.scrollTriggers.slice(0, 10) : user.onboarding.scrollTriggers,
      aspiration: typeof body.aspiration === 'string' ? body.aspiration.trim().slice(0, 400) : user.onboarding.aspiration,
    };
    saveDb(db);
    res.json({ user: toPublicUser(user) });
  });

  // ---------------- ACTIVITIES & MISSIONS ----------------
  app.get('/api/activities', (req, res) => {
    const db = getDb();
    const category = req.query.category as string | undefined;
    const worldElement = req.query.worldElement as WorldElementId | undefined;
    let list = db.activities;
    if (category && category !== 'All') {
      list = list.filter((a) => a.category.toLowerCase() === category.toLowerCase());
    }
    if (worldElement && ['tree', 'house', 'car'].includes(worldElement)) {
      list = list.filter((a) => a.worldElement === worldElement);
    }
    res.json({ activities: list });
  });

  app.get('/api/activities/recommended', requireAuth, (req: AuthenticatedRequest, res) => {
    const db = getDb();
    const user = req.authUser!;
    const mood = req.query.mood as MoodType | undefined;
    const impulseTrigger = req.query.impulse as ImpulseTrigger | undefined;
    const availableMinutes = req.query.minutes ? Number(req.query.minutes) : user.onboarding.dailyFreeMinutes;
    const limit = Math.min(6, Math.max(1, Number(req.query.limit) || 3));

    const recommended = recommendActivities(db.activities, {
      interests: user.onboarding.interests,
      mood,
      impulseTrigger,
      availableMinutes,
      completedActivityIds: user.completedActivityIds,
      limit,
    });
    res.json({ activities: recommended });
  });

  app.post('/api/missions/start', requireAuth, (req: AuthenticatedRequest, res) => {
    const { activityId, plannedMinutes } = req.body ?? {};
    const db = getDb();
    const activity = db.activities.find((a) => a.id === activityId);
    if (!activity) {
      res.status(404).json({ error: 'Activity not found.' });
      return;
    }

    const session = {
      id: uid('ms'),
      userId: req.authUser!.id,
      activityId: activity.id,
      activityTitle: activity.title,
      category: activity.category,
      worldElement: activity.worldElement,
      plannedMinutes: Math.min(180, Math.max(5, Number(plannedMinutes) || activity.durationMinutes)),
      elapsedSeconds: 0,
      status: 'active' as const,
      verificationType: 'self_reported' as const,
      startedAt: new Date().toISOString(),
    };
    db.missionSessions.unshift(session);
    saveDb(db);
    res.status(201).json({ session });
  });

  app.patch('/api/missions/:id/complete', requireAuth, (req: AuthenticatedRequest, res) => {
    const db = getDb();
    const session = db.missionSessions.find((s) => s.id === req.params.id);
    if (!session || session.userId !== req.authUser!.id) {
      res.status(404).json({ error: 'Activity session not found.' });
      return;
    }
    const { whatDidYouDo, whatDidYouLearn, howDidYouFeel, elapsedSeconds, status } = req.body ?? {};
    if (status === 'cancelled') {
      session.status = 'cancelled';
      saveDb(db);
      res.json({ session, user: toPublicUser(req.authUser!) });
      return;
    }
    if (!whatDidYouDo || String(whatDidYouDo).trim().length < 3) {
      res.status(400).json({ error: 'Please share a brief note on what you did offline.' });
      return;
    }

    const user = db.users.find((u) => u.id === req.authUser!.id)!;

    session.status = 'completed';
    session.verificationType = 'self_reported';
    session.whatDidYouDo = String(whatDidYouDo).trim().slice(0, 500);
    session.whatDidYouLearn = String(whatDidYouLearn || '').trim().slice(0, 500);
    session.howDidYouFeel = String(howDidYouFeel || '').trim().slice(0, 300);
    const rawElapsed = Number(elapsedSeconds);
    session.elapsedSeconds = Number.isFinite(rawElapsed) && rawElapsed > 0
      ? Math.min(rawElapsed, 10800)
      : session.plannedMinutes * 60;
    session.completedAt = new Date().toISOString();

    const minutesCredited = Math.max(1, Math.round(session.elapsedSeconds / 60));
    user.declaredOfflineMinutes += minutesCredited;
    if (!user.completedActivityIds.includes(session.activityId)) {
      user.completedActivityIds.push(session.activityId);
    }

    db.journalEntries.unshift({
      id: uid('jr'),
      userId: user.id,
      title: session.activityTitle,
      activityDone: session.whatDidYouDo,
      learned: session.whatDidYouLearn || 'Self-reported offline session.',
      feeling: session.howDidYouFeel || 'Present',
      privacy: 'private',
      verificationType: 'self_reported',
      createdAt: new Date().toISOString(),
    });

    saveDb(db);
    const progress = buildProgressForUser(user.id);
    res.json({ session, user: progress.user, worldGrowth: progress.worldGrowth });
  });

  app.get('/api/missions/history', requireAuth, (req: AuthenticatedRequest, res) => {
    const db = getDb();
    const sessions = db.missionSessions.filter((s) => s.userId === req.authUser!.id);
    res.json({ sessions });
  });

  // ---------------- SKILLS & PRACTICE CHALLENGES ----------------
  app.get('/api/skills', requireAuth, (req: AuthenticatedRequest, res) => {
    const db = getDb();
    const skills = db.skills.filter((s) => s.userId === req.authUser!.id);
    res.json({ skills });
  });

  app.post('/api/skills', requireAuth, (req: AuthenticatedRequest, res) => {
    const { name, category, level, goal } = req.body ?? {};
    if (!name || String(name).trim().length < 2) {
      res.status(400).json({ error: 'Skill name must be at least 2 characters.' });
      return;
    }
    const db = getDb();
    const skill = {
      id: uid('sk'),
      userId: req.authUser!.id,
      name: String(name).trim().slice(0, 80),
      category: String(category || 'Creative Arts').trim(),
      level: (['Beginner', 'Developing', 'Capable', 'Mentor'].includes(level)
        ? level
        : 'Beginner') as 'Beginner' | 'Developing' | 'Capable' | 'Mentor',
      goal: String(goal || 'Apply this skill through regular hands-on practice.').trim().slice(0, 240),
      hoursPracticed: 0,
      practiceSessions: 0,
    };
    db.skills.unshift(skill);
    saveDb(db);
    res.status(201).json({ skill });
  });

  app.post('/api/skills/:id/practice', requireAuth, (req: AuthenticatedRequest, res) => {
    const db = getDb();
    const skill = db.skills.find((s) => s.id === req.params.id && s.userId === req.authUser!.id);
    if (!skill) {
      res.status(404).json({ error: 'Skill not found.' });
      return;
    }
    const minutes = Math.min(240, Math.max(5, Number(req.body?.minutes) || 20));
    skill.practiceSessions = (skill.practiceSessions || 0) + 1;
    skill.hoursPracticed = Number((skill.hoursPracticed + minutes / 60).toFixed(1));
    const user = db.users.find((u) => u.id === req.authUser!.id)!;
    user.declaredOfflineMinutes += minutes;
    saveDb(db);
    res.json({ skill, user: toPublicUser(user) });
  });

  app.get('/api/challenges', requireAuth, (_req, res) => {
    const db = getDb();
    res.json({ challenges: db.practiceChallenges });
  });

  app.get('/api/submissions/mine', requireAuth, (req: AuthenticatedRequest, res) => {
    const db = getDb();
    const subs = db.submissions.filter((s) => s.userId === req.authUser!.id);
    res.json({ submissions: subs });
  });

  app.post('/api/challenges/:id/submit', requireAuth, (req: AuthenticatedRequest, res) => {
    const user = req.authUser!;
    const db = getDb();
    const challenge = db.practiceChallenges.find((c) => c.id === req.params.id);
    if (!challenge) {
      res.status(404).json({ error: 'Practice challenge not found.' });
      return;
    }
    const { summary, workUrlOrArtifact, reflection } = req.body ?? {};
    if (!summary || String(summary).trim().length < 5) {
      res.status(400).json({ error: 'Please summarize the practice work you completed (at least 5 characters).' });
      return;
    }
    if (!workUrlOrArtifact || String(workUrlOrArtifact).trim().length < 3) {
      res.status(400).json({ error: 'Please include a work link or artifact reference.' });
      return;
    }

    const submission = {
      id: uid('sub'),
      challengeId: challenge.id,
      challengeTitle: challenge.title,
      userId: user.id,
      userName: user.name,
      summary: String(summary).trim().slice(0, 600),
      workUrlOrArtifact: String(workUrlOrArtifact).trim().slice(0, 300),
      reflection: String(reflection || '').trim().slice(0, 400),
      status: 'submitted' as SubmissionStatus,
      verificationType: 'pending_review' as const,
      submittedAt: new Date().toISOString(),
    };
    db.submissions.unshift(submission);
    saveDb(db);
    res.status(201).json({ submission });
  });

  // ---------------- ORIGINAL PROJECTS ----------------
  app.get('/api/projects', requireAuth, (req: AuthenticatedRequest, res) => {
    const db = getDb();
    const mine = db.projects.filter((p) => p.userId === req.authUser!.id);
    const portfolio = db.projects.filter((p) => p.publishedToPortfolio);
    res.json({ myProjects: mine, portfolioProjects: portfolio });
  });

  app.post('/api/projects', requireAuth, (req: AuthenticatedRequest, res) => {
    const { title, category, problemStatement, solutionIdea, description, artifactSummary, impactNotes } =
      req.body ?? {};
    if (!title || String(title).trim().length < 3) {
      res.status(400).json({ error: 'Project title is required (at least 3 characters).' });
      return;
    }
    if (!problemStatement || String(problemStatement).trim().length < 5) {
      res.status(400).json({ error: 'Describe the real-world problem or curiosity you are exploring.' });
      return;
    }
    if (!solutionIdea || String(solutionIdea).trim().length < 5) {
      res.status(400).json({ error: 'Explain your original solution or creation.' });
      return;
    }

    const db = getDb();
    const user = db.users.find((u) => u.id === req.authUser!.id)!;
    const project: OriginalProject = {
      id: uid('proj'),
      userId: user.id,
      userName: user.name,
      title: String(title).trim().slice(0, 120),
      category: String(category || 'Design').trim(),
      problemStatement: String(problemStatement).trim().slice(0, 500),
      solutionIdea: String(solutionIdea).trim().slice(0, 800),
      description: String(description || solutionIdea).trim().slice(0, 800),
      updates: [],
      artifactSummary: String(artifactSummary || 'Initial concept & notes').trim().slice(0, 240),
      impactNotes: String(impactNotes || '').trim().slice(0, 300),
      status: 'submitted',
      verificationType: 'self_reported',
      publishedToPortfolio: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    db.projects.unshift(project);
    saveDb(db);
    res.status(201).json({ project });
  });

  app.patch('/api/projects/:id', requireAuth, (req: AuthenticatedRequest, res) => {
    const db = getDb();
    const project = db.projects.find((p) => p.id === req.params.id);
    if (!project || project.userId !== req.authUser!.id) {
      res.status(404).json({ error: 'Project not found.' });
      return;
    }
    const { updateText, impactNotes } = req.body ?? {};
    if (!updateText || String(updateText).trim().length < 3) {
      res.status(400).json({ error: 'Write a brief progress update (at least 3 characters).' });
      return;
    }
    project.updates.unshift({
      id: uid('upd'),
      text: String(updateText).trim().slice(0, 500),
      createdAt: new Date().toISOString(),
    });
    if (typeof impactNotes === 'string' && impactNotes.trim()) {
      project.impactNotes = impactNotes.trim().slice(0, 300);
    }
    project.updatedAt = new Date().toISOString();
    saveDb(db);
    res.json({ project });
  });

  // ---------------- CONNECT & EXPERIENCES ----------------
  app.get('/api/connections', requireAuth, (req: AuthenticatedRequest, res) => {
    const db = getDb();
    const user = req.authUser!;
    const connections = db.connections.filter((c) => c.userId === user.id);
    const communityMissions = db.communityMissions;
    const experiences = db.experiences.filter((e) => {
      if (e.userId === user.id) return true;
      const author = db.users.find((u) => u.id === e.userId);
      return author ? author.privacyMode !== 'private' : false;
    });
    res.json({ connections, communityMissions, experiences });
  });

  app.post('/api/connections/request', requireAuth, (req: AuthenticatedRequest, res) => {
    const { peerName, relationType, sharedInterest } = req.body ?? {};
    if (!peerName || String(peerName).trim().length < 2) {
      res.status(400).json({ error: 'Please enter the person’s name (at least 2 characters).' });
      return;
    }
    const db = getDb();
    const user = req.authUser!;
    const conn = {
      id: uid('conn'),
      userId: user.id,
      peerName: String(peerName).trim().slice(0, 80),
      relationType: (['Friend', 'Family', 'Mentor', 'Study Partner'].includes(relationType)
        ? relationType
        : 'Friend') as 'Friend' | 'Family' | 'Mentor' | 'Study Partner',
      sharedInterest: String(sharedInterest || 'Shared Offline Activities').trim().slice(0, 120),
      status: 'approved' as const,
      createdAt: new Date().toISOString(),
    };
    db.connections.unshift(conn);
    saveDb(db);
    res.status(201).json({ connection: conn });
  });

  app.post('/api/community-missions/:id/join', requireAuth, (req: AuthenticatedRequest, res) => {
    const db = getDb();
    const mission = db.communityMissions.find((m) => m.id === req.params.id);
    if (!mission) {
      res.status(404).json({ error: 'Community activity not found.' });
      return;
    }
    const user = db.users.find((u) => u.id === req.authUser!.id)!;
    if (!mission.joinedUserIds.includes(user.id)) {
      mission.joinedUserIds.push(user.id);
      mission.participantsCount += 1;
    }
    saveDb(db);
    res.json({ mission });
  });

  app.post('/api/experiences', requireAuth, (req: AuthenticatedRequest, res) => {
    const { type, headline, story } = req.body ?? {};
    if (!headline || String(headline).trim().length < 4) {
      res.status(400).json({ error: 'Share a short headline for your real experience.' });
      return;
    }
    if (!story || String(story).trim().length < 6) {
      res.status(400).json({ error: 'Add a short reflection on what happened.' });
      return;
    }
    const db = getDb();
    const user = req.authUser!;
    const card = {
      id: uid('exp'),
      userId: user.id,
      authorName: user.name,
      type: (['Created', 'Learned', 'Explored', 'Helped', 'Achieved'].includes(type)
        ? type
        : 'Created') as 'Created' | 'Learned' | 'Explored' | 'Helped' | 'Achieved',
      headline: String(headline).trim().slice(0, 140),
      story: String(story).trim().slice(0, 600),
      createdAt: new Date().toISOString(),
    };
    db.experiences.unshift(card);
    saveDb(db);
    res.status(201).json({ experience: card });
  });

  // ---------------- JOURNAL & WORLD GROWTH PROGRESS ----------------
  app.get('/api/journal', requireAuth, (req: AuthenticatedRequest, res) => {
    const db = getDb();
    const entries = db.journalEntries.filter((j) => j.userId === req.authUser!.id);
    res.json({ entries });
  });

  app.post('/api/journal', requireAuth, (req: AuthenticatedRequest, res) => {
    const { title, activityDone, learned, feeling, helpedSomeone, futureGoal, privacy } =
      req.body ?? {};
    if (!title || String(title).trim().length < 2) {
      res.status(400).json({ error: 'Journal title is required.' });
      return;
    }
    if (!activityDone || String(activityDone).trim().length < 3) {
      res.status(400).json({ error: 'Describe what you did or experienced.' });
      return;
    }
    const db = getDb();
    const entry = {
      id: uid('jr'),
      userId: req.authUser!.id,
      title: String(title).trim().slice(0, 120),
      activityDone: String(activityDone).trim().slice(0, 600),
      learned: String(learned || '').trim().slice(0, 400),
      feeling: String(feeling || '').trim().slice(0, 200),
      helpedSomeone: String(helpedSomeone || '').trim().slice(0, 200),
      futureGoal: String(futureGoal || '').trim().slice(0, 200),
      privacy: (['private', 'connections'].includes(privacy)
        ? privacy
        : 'private') as 'private' | 'connections',
      verificationType: 'self_reported' as const,
      createdAt: new Date().toISOString(),
    };
    db.journalEntries.unshift(entry);
    saveDb(db);
    res.status(201).json({ entry });
  });

  app.get('/api/progress', requireAuth, (req: AuthenticatedRequest, res) => {
    res.json(buildProgressForUser(req.authUser!.id));
  });

  app.patch('/api/notifications/read', requireAuth, (req: AuthenticatedRequest, res) => {
    const db = getDb();
    for (const n of db.notifications) {
      if (n.userId === req.authUser!.id) {
        n.read = true;
      }
    }
    saveDb(db);
    res.json({ ok: true });
  });

  // ---------------- GEMINI AI ROUTES ----------------
  app.post('/api/ai/recommend-activities', requireAuth, async (req: AuthenticatedRequest, res) => {
    try {
      const user = req.authUser!;
      const { mood, impulseTrigger, availableMinutes } = req.body ?? {};
      const suggestions = await generateActivitySuggestions({
        interests: user.onboarding.interests,
        mood,
        impulseTrigger,
        availableMinutes: Number(availableMinutes) || user.onboarding.dailyFreeMinutes || 20,
      });
      res.json({ suggestions });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unable to generate suggestions.';
      res.status(502).json({ error: message });
    }
  });

  app.post('/api/ai/suggest-skills', requireAuth, async (req: AuthenticatedRequest, res) => {
    try {
      const user = req.authUser!;
      const { learningGoal } = req.body ?? {};
      if (!learningGoal || String(learningGoal).trim().length < 2) {
        res.status(400).json({ error: 'Specify a skill you want to practice.' });
        return;
      }
      const roadmap = await generateSkillRoadmap({
        currentSkills: user.onboarding.currentSkills,
        learningGoal: String(learningGoal).trim(),
      });
      res.json({ roadmap });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unable to generate skill roadmap.';
      res.status(502).json({ error: message });
    }
  });

  app.post('/api/ai/brainstorm-project', requireAuth, async (req: AuthenticatedRequest, res) => {
    try {
      const user = req.authUser!;
      const { communityProblem } = req.body ?? {};
      if (!communityProblem || String(communityProblem).trim().length < 4) {
        res.status(400).json({ error: 'Describe a curiosity or local problem to brainstorm around.' });
        return;
      }
      const ideas = await brainstormOriginalProject({
        interests: user.onboarding.interests,
        communityProblem: String(communityProblem).trim(),
      });
      res.json({ ideas });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unable to brainstorm project ideas.';
      res.status(502).json({ error: message });
    }
  });

  app.post('/api/ai/weekly-summary', requireAuth, async (req: AuthenticatedRequest, res) => {
    try {
      const db = getDb();
      const user = req.authUser!;
      const completed = db.missionSessions.filter(
        (s) => s.userId === user.id && s.status === 'completed'
      );
      const myProjects = db.projects.filter((p) => p.userId === user.id);
      const mySkills = db.skills.filter((s) => s.userId === user.id);
      const reflections = completed
        .slice(0, 3)
        .map((c) => c.whatDidYouLearn || c.whatDidYouDo || '')
        .filter(Boolean);

      const result = await generateWeeklySummary({
        name: user.name,
        completedMissions: completed.length,
        declaredOfflineMinutes: user.declaredOfflineMinutes,
        projectsCount: myProjects.length,
        skillsCount: mySkills.length,
        recentReflections: reflections,
      });
      res.json(result);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unable to generate weekly summary.';
      res.status(502).json({ error: message });
    }
  });

  // ---------------- ADMIN / SUPERVISOR CONSOLE ----------------
  app.get('/api/admin/dashboard', requireRole('admin'), (req: AuthenticatedRequest, res) => {
    const db = getDb();
    const supervisorId = req.authUser!.id;
    const pendingSubmissions = db.submissions.filter(
      (s) => s.status === 'submitted' || s.status === 'revision_requested'
    );
    const pendingProjects = db.projects.filter(
      (p) => p.status === 'submitted' || p.status === 'revision_requested'
    );
    const assignedUsers = db.users.filter((u) => u.assignedSupervisorId === supervisorId);

    res.json({
      totals: {
        users: db.users.length,
        assignedUsers: assignedUsers.length,
        activities: db.activities.length,
        challenges: db.practiceChallenges.length,
        completedMissions: db.missionSessions.filter((s) => s.status === 'completed').length,
        pendingSubmissions: pendingSubmissions.length,
        pendingProjects: pendingProjects.length,
      },
      users: db.users.map(toPublicUser),
      submissions: db.submissions,
      projects: db.projects,
      auditLogs: db.auditLogs,
    });
  });

  app.get('/api/admin/users/:id/progress', requireRole('admin'), (req: AuthenticatedRequest, res) => {
    const db = getDb();
    const targetUser = db.users.find((u) => u.id === req.params.id);
    if (!targetUser) {
      res.status(404).json({ error: 'User account not found.' });
      return;
    }

    const progress = buildProgressForUser(targetUser.id);
    const skills = db.skills.filter((s) => s.userId === targetUser.id);
    const recentMissions = db.missionSessions
      .filter((s) => s.userId === targetUser.id && s.status === 'completed')
      .slice(0, 8)
      .map((s) => ({
        id: s.id,
        activityTitle: s.activityTitle,
        category: s.category,
        worldElement: s.worldElement,
        plannedMinutes: s.plannedMinutes,
        whatDidYouDo: s.whatDidYouDo,
        completedAt: s.completedAt,
      }));
    const submissions = db.submissions.filter((s) => s.userId === targetUser.id);
    const projects = db.projects.filter((p) => p.userId === targetUser.id);

    res.json({
      user: progress.user,
      stats: progress.stats,
      worldGrowth: progress.worldGrowth,
      milestones: progress.milestones,
      skills,
      recentMissions,
      submissions,
      projects,
    });
  });

  app.patch('/api/admin/users/:id/supervision', requireRole('admin'), (req: AuthenticatedRequest, res) => {
    const db = getDb();
    const targetUser = db.users.find((u) => u.id === req.params.id);
    if (!targetUser) {
      res.status(404).json({ error: 'User account not found.' });
      return;
    }
    if (targetUser.id === req.authUser!.id) {
      res.status(400).json({ error: 'You cannot assign yourself as a supervised user.' });
      return;
    }

    const assigned = Boolean(req.body?.assigned);
    targetUser.assignedSupervisorId = assigned ? req.authUser!.id : null;

    appendAuditLog(
      db,
      req.authUser!.id,
      req.authUser!.email,
      assigned ? 'USER_SUPERVISION_ASSIGNED' : 'USER_SUPERVISION_UNASSIGNED',
      'user',
      targetUser.id,
      `${assigned ? 'Assigned' : 'Unassigned'} ${targetUser.email} to supervisor ${req.authUser!.email}`
    );
    saveDb(db);
    res.json({ user: toPublicUser(targetUser) });
  });

  app.patch('/api/admin/submissions/:id', requireRole('admin'), (req: AuthenticatedRequest, res) => {
    const db = getDb();
    const submission = db.submissions.find((s) => s.id === req.params.id);
    if (!submission) {
      res.status(404).json({ error: 'Submission not found.' });
      return;
    }
    const { status, reviewerNotes } = req.body ?? {};
    const targetStatus = status as SubmissionStatus;
    if (!canTransitionSubmissionStatus(submission.status, targetStatus, req.authUser!.role)) {
      res.status(400).json({ error: 'Invalid submission status transition.' });
      return;
    }

    submission.status = targetStatus;
    submission.reviewerNotes = String(reviewerNotes || '').trim();
    submission.reviewedAt = new Date().toISOString();
    submission.verificationType = targetStatus === 'approved' ? 'reviewer_verified' : 'pending_review';

    const submitter = db.users.find((u) => u.id === submission.userId);
    if (submitter) {
      db.notifications.unshift({
        id: uid('not'),
        userId: submitter.id,
        title: targetStatus === 'approved' ? 'Skill Practice Verified' : 'Skill Practice Feedback',
        message:
          targetStatus === 'approved'
            ? `"${submission.challengeTitle}" was verified by a reviewer and grew your Tree.`
            : submission.reviewerNotes || 'Check reviewer feedback on your submission.',
        read: false,
        createdAt: new Date().toISOString(),
      });
    }

    appendAuditLog(
      db,
      req.authUser!.id,
      req.authUser!.email,
      `SUBMISSION_${targetStatus.toUpperCase()}`,
      'submission',
      submission.id,
      `Reviewed "${submission.challengeTitle}" for ${submission.userName}`
    );
    saveDb(db);
    res.json({ submission });
  });

  app.patch('/api/admin/projects/:id', requireRole('admin'), (req: AuthenticatedRequest, res) => {
    const db = getDb();
    const project = db.projects.find((p) => p.id === req.params.id);
    if (!project) {
      res.status(404).json({ error: 'Project not found.' });
      return;
    }
    const { status, reviewerFeedback } = req.body ?? {};
    const valid: ProjectStatus[] = ['approved', 'revision_requested'];
    if (!valid.includes(status)) {
      res.status(400).json({ error: 'Invalid project review status.' });
      return;
    }
    project.status = status;
    project.reviewerFeedback = String(reviewerFeedback || '').trim();
    project.verificationType = status === 'approved' ? 'reviewer_verified' : 'self_reported';
    project.updatedAt = new Date().toISOString();

    const author = db.users.find((u) => u.id === project.userId);
    if (status === 'approved' && author) {
      project.publishedToPortfolio = true;
      db.notifications.unshift({
        id: uid('not'),
        userId: author.id,
        title: 'Original Project Verified',
        message: `"${project.title}" was verified by a reviewer and grew your Car.`,
        read: false,
        createdAt: new Date().toISOString(),
      });
    }

    appendAuditLog(
      db,
      req.authUser!.id,
      req.authUser!.email,
      `PROJECT_${status.toUpperCase()}`,
      'project',
      project.id,
      `Reviewed original project "${project.title}"`
    );
    saveDb(db);
    res.json({ project });
  });

  app.post('/api/admin/activities', requireRole('admin'), (req: AuthenticatedRequest, res) => {
    const { title, description, category, durationMinutes, worldElement, materialsNeeded, outdoors } =
      req.body ?? {};
    if (!title || !description) {
      res.status(400).json({ error: 'Title and description are required.' });
      return;
    }
    const db = getDb();
    const newActivity: Activity = {
      id: uid('act'),
      title: String(title).trim(),
      description: String(description).trim(),
      category: category || 'Creativity',
      durationMinutes: Math.min(180, Math.max(5, Number(durationMinutes) || 20)),
      difficulty: 'Moderate',
      worldElement: ['tree', 'house', 'car'].includes(worldElement) ? worldElement : 'house',
      materialsNeeded: String(materialsNeeded || 'Minimal everyday items').trim(),
      outdoors: Boolean(outdoors),
      relevanceReason: 'Curated offline activity.',
      moods: ['bored', 'curious'],
      instructions: ['Put your phone aside.', 'Start with small hands-on steps.', 'Reflect briefly afterwards.'],
      offlineRequired: true,
    };
    db.activities.unshift(newActivity);
    appendAuditLog(
      db,
      req.authUser!.id,
      req.authUser!.email,
      'ACTIVITY_CREATED',
      'activity',
      newActivity.id,
      newActivity.title
    );
    saveDb(db);
    res.status(201).json({ activity: newActivity });
  });

  // ---------------- VITE / STATIC ----------------
  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    if (fs.existsSync(distPath)) {
      app.use(express.static(distPath));
      app.get('/{*splat}', (_req, res) => {
        res.sendFile(path.join(distPath, 'index.html'));
      });
    }
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Findikoo server listening on http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start Findikoo server:', err);
  process.exit(1);
});

import test from 'node:test';
import assert from 'node:assert/strict';
import {
  canTransitionSubmissionStatus,
  computeWorldGrowth,
  evaluateMilestones,
  recommendActivities,
} from './rules';
import type { Activity } from './types';

test('computeWorldGrowth advances Tree, House, and Car independently from meaningful actions', () => {
  const empty = computeWorldGrowth({
    treeMissions: 0,
    houseMissions: 0,
    carMissions: 0,
    skillsCount: 0,
    skillPracticeSessions: 0,
    approvedChallenges: 0,
    projectsCount: 0,
    projectUpdatesCount: 0,
    approvedProjects: 0,
    connectionsCount: 0,
    communityJoinedCount: 0,
    journalCount: 0,
  });
  assert.equal(empty.tree.stage, 1);
  assert.equal(empty.house.stage, 1);
  assert.equal(empty.car.stage, 1);
  assert.equal(empty.tree.accomplishments.length, 0);

  const grown = computeWorldGrowth({
    treeMissions: 2,
    houseMissions: 2,
    carMissions: 1,
    skillsCount: 2,
    skillPracticeSessions: 2,
    approvedChallenges: 1,
    projectsCount: 2,
    projectUpdatesCount: 2,
    approvedProjects: 1,
    connectionsCount: 2,
    communityJoinedCount: 1,
    journalCount: 2,
  });
  assert.equal(grown.tree.stage, 3);
  assert.equal(grown.house.stage, 3);
  assert.equal(grown.car.stage, 4);
  assert.ok(grown.tree.accomplishments.length > 0);
});

test('recommendActivities limits selection per Hick-Hyman law and prioritizes mood, time, and interests', () => {
  const sample: Activity[] = [
    {
      id: 'a1',
      title: 'Sketch a Local Tree',
      description: 'Draw from observation outdoors.',
      category: 'Creativity',
      durationMinutes: 20,
      difficulty: 'Gentle',
      worldElement: 'car',
      materialsNeeded: 'Paper and pen',
      outdoors: true,
      relevanceReason: 'Matches curiosity and creative focus.',
      moods: ['bored', 'curious'],
      instructions: ['Grab paper and pen', 'Go outside'],
      offlineRequired: true,
    },
    {
      id: 'a2',
      title: 'Read a Physical Chapter',
      description: 'Uninterrupted reading.',
      category: 'Reading',
      durationMinutes: 45,
      difficulty: 'Moderate',
      worldElement: 'tree',
      materialsNeeded: 'Physical book',
      outdoors: false,
      relevanceReason: 'Supports quiet focus.',
      moods: ['tired'],
      instructions: ['Leave phone in another room'],
      offlineRequired: true,
    },
    {
      id: 'a3',
      title: 'Quick Walk Without Phone',
      description: 'Walk 15 minutes leaving phone behind.',
      category: 'Nature',
      durationMinutes: 15,
      difficulty: 'Gentle',
      worldElement: 'house',
      materialsNeeded: 'Comfortable shoes',
      outdoors: true,
      relevanceReason: 'Gentle stress relief.',
      moods: ['stressed', 'tired'],
      instructions: ['Leave phone at desk', 'Walk'],
      offlineRequired: true,
    },
    {
      id: 'a4',
      title: 'Write a Handwritten Note',
      description: 'Reach out offline.',
      category: 'Kindness',
      durationMinutes: 15,
      difficulty: 'Gentle',
      worldElement: 'house',
      materialsNeeded: 'Paper and pen',
      outdoors: false,
      relevanceReason: 'Builds real connection.',
      moods: ['lonely'],
      instructions: ['Write 4 sentences'],
      offlineRequired: true,
    },
  ];

  const results = recommendActivities(sample, {
    interests: ['Creativity'],
    availableMinutes: 20,
    impulseTrigger: 'bored',
    limit: 3,
  });

  assert.equal(results.length, 3);
  assert.equal(results[0].id, 'a1');
});

test('submission review status cannot be approved by regular users', () => {
  assert.equal(canTransitionSubmissionStatus('accepted', 'submitted', 'user'), true);
  assert.equal(canTransitionSubmissionStatus('submitted', 'approved', 'user'), false);
  assert.equal(canTransitionSubmissionStatus('submitted', 'approved', 'admin'), true);
  assert.equal(canTransitionSubmissionStatus('submitted', 'revision_requested', 'admin'), true);
});

test('evaluateMilestones awards expected world growth milestones accurately', () => {
  const milestones = evaluateMilestones({
    completedMissions: 2,
    declaredOfflineMinutes: 65,
    skillsCount: 2,
    approvedChallenges: 1,
    projectsCount: 1,
    communityJoinedCount: 1,
    journalCount: 1,
  });

  const earnedIds = milestones.filter((m) => m.earned).map((m) => m.id);
  assert.ok(earnedIds.includes('first-offline-step'));
  assert.ok(earnedIds.includes('present-hour'));
  assert.ok(earnedIds.includes('verified-craft'));
  assert.ok(earnedIds.includes('original-maker'));
});

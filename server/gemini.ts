import { GoogleGenAI, Type } from '@google/genai';
import type { ImpulseTrigger, MoodType } from '../src/shared/types';

function getClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error(
      'GEMINI_API_KEY is not configured in Settings > Secrets. Please add a Gemini API key to use AI-powered suggestions.'
    );
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

const ADULT_GUIDE_GUARD =
  'Audience is an adult (18+) seeking intentional offline living. Encourage practical skill development, original personal projects, outdoor grounding, reading, and authentic real-world relationships. Never encourage passive video binges, viral trend copying, cash/gamified grind, or guilt.';

export async function generateActivitySuggestions(params: {
  interests: string[];
  mood?: MoodType;
  impulseTrigger?: ImpulseTrigger;
  availableMinutes: number;
}) {
  const ai = getClient();
  const prompt = `Suggest 3 concrete, meaningful, offline real-world activities for an adult who wants to step away from scrolling.
Interests: ${params.interests.join(', ') || 'Creativity, Nature, Learning'}
Current mood / trigger: ${params.impulseTrigger || params.mood || 'curious'}
Available time: ${params.availableMinutes} minutes
Each suggestion must include materials needed, whether it is outdoors, and why it fits.`;

  const response = await ai.models.generateContent({
    model: 'gemini-4-hydrogen',
    contents: prompt,
    config: {
      systemInstruction: `You are Findikoo's calm offline-action guide. ${ADULT_GUIDE_GUARD}`,
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            description: { type: Type.STRING },
            category: { type: Type.STRING },
            durationMinutes: { type: Type.INTEGER },
            materialsNeeded: { type: Type.STRING },
            outdoors: { type: Type.BOOLEAN },
            firstStep: { type: Type.STRING },
          },
          required: [
            'title',
            'description',
            'category',
            'durationMinutes',
            'materialsNeeded',
            'outdoors',
            'firstStep',
          ],
        },
      },
    },
  });

  return JSON.parse((response.text ?? '[]').trim());
}

export async function generateSkillRoadmap(params: {
  currentSkills: string[];
  learningGoal: string;
}) {
  const ai = getClient();
  const prompt = `Create a practical 3-step hands-on learning path for "${params.learningGoal}" that emphasizes DOING and real-world practice rather than passively watching tutorials.
Current skills: ${params.currentSkills.join(', ') || 'Starting fresh'}`;

  const response = await ai.models.generateContent({
    model: 'gemini-4-hydrogen',
    contents: prompt,
    config: {
      systemInstruction: `You are Findikoo's skill coach. ${ADULT_GUIDE_GUARD} Focus on applied practice, not passive content consumption.`,
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          headline: { type: Type.STRING },
          antiConsumptionTip: { type: Type.STRING },
          steps: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                stepTitle: { type: Type.STRING },
                practiceTask: { type: Type.STRING },
                estimatedMinutes: { type: Type.INTEGER },
              },
              required: ['stepTitle', 'practiceTask', 'estimatedMinutes'],
            },
          },
        },
        required: ['headline', 'antiConsumptionTip', 'steps'],
      },
    },
  });

  return JSON.parse((response.text ?? '{}').trim());
}

export async function brainstormOriginalProject(params: {
  interests: string[];
  communityProblem: string;
}) {
  const ai = getClient();
  const prompt = `Brainstorm 2 original real-world project concepts based on:
Interests: ${params.interests.join(', ') || 'Design, Community, Craft'}
Real-world problem or curiosity: ${params.communityProblem}
Core philosophy: Create something original and tangible instead of imitating online trends.`;

  const response = await ai.models.generateContent({
    model: 'gemini-4-hydrogen',
    contents: prompt,
    config: {
      systemInstruction: `You are Findikoo's Original Creation Mentor. ${ADULT_GUIDE_GUARD} Help the user invent an original, useful project with tangible personal or local impact.`,
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            category: { type: Type.STRING },
            problemStatement: { type: Type.STRING },
            solutionIdea: { type: Type.STRING },
            firstWeekendStep: { type: Type.STRING },
          },
          required: ['title', 'category', 'problemStatement', 'solutionIdea', 'firstWeekendStep'],
        },
      },
    },
  });

  return JSON.parse((response.text ?? '[]').trim());
}

export async function generateWeeklySummary(params: {
  name: string;
  completedMissions: number;
  declaredOfflineMinutes: number;
  projectsCount: number;
  skillsCount: number;
  recentReflections: string[];
}) {
  const ai = getClient();
  const prompt = `Write a warm, grounded reflection for ${params.name}.
Completed offline activities (self-reported): ${params.completedMissions}
Reported offline minutes: ${params.declaredOfflineMinutes}
Original projects: ${params.projectsCount}
Skills practiced: ${params.skillsCount}
Recent reflections: ${params.recentReflections.join(' | ') || 'Getting started on intentional offline living.'}
Never shame for missed days or focus on streak pressure. Highlight real-world growth and suggest one gentle next step.`;

  const response = await ai.models.generateContent({
    model: 'gemini-4-hydrogen',
    contents: prompt,
    config: {
      systemInstruction: `You are Findikoo's encouraging reflection writer. ${ADULT_GUIDE_GUARD} Keep it concise (3 short paragraphs max) and grounded.`,
    },
  });

  return { summary: (response.text ?? '').trim() };
}

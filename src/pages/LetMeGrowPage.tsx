import React, { useEffect, useState } from 'react';
import { Plus, Sparkles, CheckCircle2, Clock, Send, Trees } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';
import type { ChallengeSubmission, PracticeChallenge, UserSkill } from '../shared/types';
import { BrushHeading } from '../illustrations/BrushTypography';

export function LetMeGrowPage() {
  const { setUser } = useAuth();
  const [skills, setSkills] = useState<UserSkill[]>([]);
  const [challenges, setChallenges] = useState<PracticeChallenge[]>([]);
  const [submissions, setSubmissions] = useState<ChallengeSubmission[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [loadError, setLoadError] = useState('');

  // Add skill form
  const [skillName, setSkillName] = useState('');
  const [skillCategory, setSkillCategory] = useState('Design');
  const [skillLevel, setSkillLevel] = useState('Beginner');
  const [skillGoal, setSkillGoal] = useState('');
  const [skillMsg, setSkillMsg] = useState('');
  const [skillError, setSkillError] = useState('');
  const [savingSkill, setSavingSkill] = useState(false);

  // Gemini skill path
  const [learningGoalQuery, setLearningGoalQuery] = useState('');
  const [roadmap, setRoadmap] = useState<{
    headline: string;
    antiConsumptionTip: string;
    steps: { stepTitle: string; practiceTask: string; estimatedMinutes: number }[];
  } | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState('');

  // Practice challenge submission form
  const [activeChallenge, setActiveChallenge] = useState<PracticeChallenge | null>(null);
  const [subSummary, setSubSummary] = useState('');
  const [subArtifact, setSubArtifact] = useState('');
  const [subReflection, setSubReflection] = useState('');
  const [subNotice, setSubNotice] = useState('');
  const [subError, setSubError] = useState('');
  const [submittingChallenge, setSubmittingChallenge] = useState(false);

  useEffect(() => {
    setLoadingData(true);
    Promise.all([api.skills.list(), api.challenges.list(), api.challenges.mySubmissions()])
      .then(([sk, ch, sub]) => {
        setSkills(sk.skills);
        setChallenges(ch.challenges);
        setSubmissions(sub.submissions);
      })
      .catch((err) => {
        setLoadError(err instanceof Error ? err.message : 'Unable to load skills and challenges.');
      })
      .finally(() => {
        setLoadingData(false);
      });
  }, []);

  const handleAddSkill = async (e: React.FormEvent) => {
    e.preventDefault();
    setSkillMsg('');
    setSkillError('');
    setSavingSkill(true);
    try {
      const res = await api.skills.add({
        name: skillName,
        category: skillCategory,
        level: skillLevel,
        goal: skillGoal,
      });
      setSkills((prev) => [res.skill, ...prev]);
      setSkillName('');
      setSkillGoal('');
      setSkillMsg('Skill added. Every practice session helps The Tree grow.');
    } catch (err) {
      setSkillError(err instanceof Error ? err.message : 'Unable to add skill.');
    } finally {
      setSavingSkill(false);
    }
  };

  const handleLogPractice = async (skill: UserSkill) => {
    setSkillMsg('');
    setSkillError('');
    try {
      const res = await api.skills.logPractice(skill.id, 20);
      setSkills((prev) => prev.map((s) => (s.id === skill.id ? res.skill : s)));
      setUser(res.user);
      setSkillMsg(`Logged 20 self-reported practice minutes for "${skill.name}". The Tree grew.`);
    } catch (err) {
      setSkillError(err instanceof Error ? err.message : 'Unable to log practice session.');
    }
  };

  const handleAiRoadmap = async (e: React.FormEvent) => {
    e.preventDefault();
    setAiLoading(true);
    setAiError('');
    try {
      const res = await api.ai.suggestSkills(learningGoalQuery);
      setRoadmap(res.roadmap);
    } catch (err) {
      setAiError(err instanceof Error ? err.message : 'Unable to generate hands-on path.');
    } finally {
      setAiLoading(false);
    }
  };

  const handleSubmitChallenge = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeChallenge) return;
    setSubNotice('');
    setSubError('');
    setSubmittingChallenge(true);
    try {
      const res = await api.challenges.submit(activeChallenge.id, {
        summary: subSummary,
        workUrlOrArtifact: subArtifact,
        reflection: subReflection,
      });
      setSubmissions((prev) => [res.submission, ...prev]);
      setActiveChallenge(null);
      setSubSummary('');
      setSubArtifact('');
      setSubReflection('');
      setSubNotice(
        'Practice challenge submitted for human reviewer feedback. World growth completes once reviewed.'
      );
    } catch (err) {
      setSubError(err instanceof Error ? err.message : 'Unable to submit challenge.');
    } finally {
      setSubmittingChallenge(false);
    }
  };

  return (
    <div className="space-y-10">
      <div className="space-y-1.5">
        <p className="text-xs font-bold tracking-wide text-[#2D6A1E] flex items-center gap-1.5">
          <Trees className="w-4 h-4" aria-hidden="true" />
          <span>GROWS THE TREE · WORLD GROWTH ONLY</span>
        </p>
        <h2 className="text-3xl font-extrabold">
          <BrushHeading accentColor="#2D6A1E">LET ME GROW.</BrushHeading>
        </h2>
        <p className="text-sm text-[#465873] max-w-2xl">
          Replace passive tutorial loops with deliberate practice. Track skills you are developing, log real practice sessions, and try optional peer-reviewed skill challenges.
        </p>
      </div>

      {loadError && (
        <div role="alert" className="p-4 rounded-2xl bg-red-50 border border-red-200 text-sm text-red-800">
          {loadError}
        </div>
      )}

      {/* Skill Profile + Gemini Hands-On Learning Path */}
      <section className="grid lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-7 bg-white rounded-3xl border border-[#0F2544]/10 p-6 space-y-5">
          <h3 className="text-xl font-extrabold">Your Skill Practice</h3>

          {skillMsg && (
            <div role="status" className="p-3 rounded-xl bg-[#9BE52E]/25 border border-[#78C943] text-xs font-semibold text-[#0F2544]">
              {skillMsg}
            </div>
          )}
          {skillError && (
            <div role="alert" className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs font-semibold text-red-800">
              {skillError}
            </div>
          )}

          {loadingData ? (
            <div className="grid sm:grid-cols-2 gap-3">
              <div className="h-28 rounded-2xl bg-[#FFFDF6] border border-[#0F2544]/10 animate-pulse" />
              <div className="h-28 rounded-2xl bg-[#FFFDF6] border border-[#0F2544]/10 animate-pulse" />
            </div>
          ) : skills.length === 0 ? (
            <p className="text-sm text-[#465873]">
              No skills added yet. Add one practical skill below—even 20 minutes of focused practice helps The Tree grow.
            </p>
          ) : (
            <div className="grid sm:grid-cols-2 gap-3">
              {skills.map((sk) => (
                <div
                  key={sk.id}
                  className="p-4 rounded-2xl bg-[#FFFDF6] border border-[#0F2544]/10 flex flex-col justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="text-xs font-semibold text-[#126EB2]">
                      {sk.category} · {sk.level}
                    </div>
                    <div className="font-bold text-sm">{sk.name}</div>
                    {sk.goal && <p className="text-xs text-[#465873]">{sk.goal}</p>}
                    <div className="text-xs text-[#465873] tabular-nums">
                      {sk.practiceSessions} session{sk.practiceSessions === 1 ? '' : 's'} ({sk.hoursPracticed} hrs self-reported)
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleLogPractice(sk)}
                    className="self-start min-h-[38px] px-3 py-1.5 rounded-xl bg-[#FFF0C9] text-[#0F2544] text-xs font-bold hover:bg-[#F4C324]/60 cursor-pointer"
                  >
                    + Log 20m Practice
                  </button>
                </div>
              ))}
            </div>
          )}

          <form onSubmit={handleAddSkill} className="pt-4 border-t border-[#0F2544]/10 space-y-3">
            <h4 className="text-sm font-bold">Add a Skill to Practice</h4>
            <div className="grid sm:grid-cols-3 gap-3">
              <input
                type="text"
                required
                aria-label="Skill name"
                value={skillName}
                onChange={(e) => setSkillName(e.target.value)}
                placeholder="Skill (e.g. Sketching)"
                className="min-h-[42px] px-3.5 py-2 rounded-xl border border-[#0F2544]/20 text-sm"
              />
              <select
                aria-label="Skill category"
                value={skillCategory}
                onChange={(e) => setSkillCategory(e.target.value)}
                className="min-h-[42px] px-3.5 py-2 rounded-xl border border-[#0F2544]/20 text-sm bg-white"
              >
                <option>Design</option>
                <option>Writing</option>
                <option>Craft &amp; Making</option>
                <option>Programming</option>
                <option>Photography</option>
                <option>Music</option>
                <option>Cooking</option>
                <option>Languages</option>
              </select>
              <select
                aria-label="Skill level"
                value={skillLevel}
                onChange={(e) => setSkillLevel(e.target.value)}
                className="min-h-[42px] px-3.5 py-2 rounded-xl border border-[#0F2544]/20 text-sm bg-white"
              >
                <option>Beginner</option>
                <option>Developing</option>
                <option>Capable</option>
                <option>Mentor</option>
              </select>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                aria-label="Skill learning goal"
                value={skillGoal}
                onChange={(e) => setSkillGoal(e.target.value)}
                placeholder="Concrete goal (e.g. Draw 4 local trees from life)"
                className="flex-1 min-h-[42px] px-3.5 py-2 rounded-xl border border-[#0F2544]/20 text-sm"
              />
              <button
                type="submit"
                disabled={savingSkill}
                className="inline-flex items-center justify-center gap-1.5 min-h-[42px] px-4 py-2 rounded-xl bg-[#1E4EB8] text-white text-sm font-semibold hover:bg-[#126EB2] cursor-pointer whitespace-nowrap disabled:opacity-60"
              >
                <Plus className="w-4 h-4" aria-hidden="true" />
                <span>{savingSkill ? 'Adding...' : 'Add Skill'}</span>
              </button>
            </div>
          </form>
        </div>

        {/* Hands-on Learning Path via Gemini */}
        <div className="lg:col-span-5 bg-[#E8F6FC] rounded-3xl border border-[#126EB2]/20 p-6 space-y-4">
          <div className="flex items-center gap-2 text-[#126EB2]">
            <Sparkles className="w-5 h-5" aria-hidden="true" />
            <h3 className="text-lg font-extrabold">Hands-On Learning Path</h3>
          </div>
          <p className="text-xs text-[#0F2544]/85 leading-relaxed">
            Name what you want to practice and get a short 3-step doing plan you can try offline—no endless video playlists.
          </p>
          <form onSubmit={handleAiRoadmap} className="flex gap-2">
            <input
              type="text"
              required
              aria-label="Skill to learn"
              value={learningGoalQuery}
              onChange={(e) => setLearningGoalQuery(e.target.value)}
              placeholder="e.g. Editorial Poster Layout"
              className="flex-1 min-h-[42px] px-3.5 py-2 rounded-xl bg-white border border-[#0F2544]/15 text-sm"
            />
            <button
              type="submit"
              disabled={aiLoading}
              className="min-h-[42px] px-4 py-2 rounded-xl bg-[#126EB2] text-white text-sm font-semibold cursor-pointer disabled:opacity-60"
            >
              {aiLoading ? '...' : 'Build'}
            </button>
          </form>
          {aiError && <p role="alert" className="text-xs text-red-700 font-medium">{aiError}</p>}
          {roadmap && (
            <div className="bg-white rounded-2xl p-4 space-y-3 border border-[#0F2544]/10">
              <h4 className="font-bold text-sm">{roadmap.headline}</h4>
              <p className="text-xs text-[#126EB2] font-medium">{roadmap.antiConsumptionTip}</p>
              <ol className="space-y-2 text-xs text-[#0F2544]/85">
                {roadmap.steps.map((st, idx) => (
                  <li key={idx} className="p-2.5 rounded-xl bg-[#FFFDF6]">
                    <div className="font-bold">
                      {idx + 1}. {st.stepTitle} ({st.estimatedMinutes} min)
                    </div>
                    <div>{st.practiceTask}</div>
                  </li>
                ))}
              </ol>
            </div>
          )}
        </div>
      </section>

      {/* Practice Challenges (World Growth Only, No Cash or Credits) */}
      <section className="space-y-4">
        <div>
          <h3 className="text-2xl font-extrabold">Practice Challenges &amp; Human Feedback</h3>
          <p className="text-xs text-[#465873]">
            Optional real-world briefs to sharpen your craft. Approved submissions are marked <strong>Reviewer-verified</strong> and grow The Tree.
          </p>
        </div>

        {subNotice && (
          <div role="status" className="p-4 rounded-2xl bg-[#9BE52E]/25 border border-[#78C943] text-sm font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-[#2D6A1E] shrink-0" aria-hidden="true" />
            <span>{subNotice}</span>
          </div>
        )}

        {activeChallenge && (
          <form
            onSubmit={handleSubmitChallenge}
            className="bg-[#FFF0C9] rounded-3xl p-6 border border-[#F4C324]/50 space-y-4"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-[#126EB2]">SUBMIT CHALLENGE FOR HUMAN REVIEW</p>
                <h4 className="text-xl font-extrabold">{activeChallenge.title}</h4>
              </div>
              <button
                type="button"
                onClick={() => setActiveChallenge(null)}
                className="min-h-[36px] px-3 text-xs font-semibold text-[#0F2544]/75 hover:text-[#0F2544] cursor-pointer"
              >
                Cancel
              </button>
            </div>
            <p className="text-xs text-[#0F2544]/85">{activeChallenge.submissionRequirements}</p>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="sub-summary" className="block text-xs font-bold mb-1">
                  Summary of What You Built *
                </label>
                <textarea
                  id="sub-summary"
                  required
                  rows={3}
                  value={subSummary}
                  onChange={(e) => setSubSummary(e.target.value)}
                  placeholder="Describe your materials, approach, and process..."
                  className="w-full px-3.5 py-2 rounded-xl bg-white border border-[#0F2544]/20 text-sm"
                />
              </div>
              <div className="space-y-3">
                <div>
                  <label htmlFor="sub-link" className="block text-xs font-bold mb-1">
                    Artifact Link or File Reference *
                  </label>
                  <input
                    id="sub-link"
                    type="text"
                    required
                    value={subArtifact}
                    onChange={(e) => setSubArtifact(e.target.value)}
                    placeholder="https://... or notebook-sketch-01.jpg"
                    className="w-full min-h-[42px] px-3.5 py-2 rounded-xl bg-white border border-[#0F2544]/20 text-sm"
                  />
                </div>
                <div>
                  <label htmlFor="sub-reflect" className="block text-xs font-bold mb-1">
                    What did practicing this teach you?
                  </label>
                  <input
                    id="sub-reflect"
                    type="text"
                    value={subReflection}
                    onChange={(e) => setSubReflection(e.target.value)}
                    placeholder="Key reflection..."
                    className="w-full min-h-[42px] px-3.5 py-2 rounded-xl bg-white border border-[#0F2544]/20 text-sm"
                  />
                </div>
              </div>
            </div>
            {subError && <p role="alert" className="text-xs text-red-700 font-semibold">{subError}</p>}
            <button
              type="submit"
              disabled={submittingChallenge}
              className="inline-flex items-center gap-2 min-h-[44px] px-5 py-2.5 rounded-xl bg-[#1E4EB8] text-white text-sm font-bold hover:bg-[#126EB2] cursor-pointer disabled:opacity-60"
            >
              <Send className="w-4 h-4" aria-hidden="true" />
              <span>{submittingChallenge ? 'Submitting...' : 'Submit for Review'}</span>
            </button>
          </form>
        )}

        <div className="grid md:grid-cols-2 gap-5">
          {challenges.map((ch) => (
            <article
              key={ch.id}
              className="bg-white rounded-3xl border border-[#0F2544]/10 p-6 flex flex-col justify-between space-y-4"
            >
              <div className="space-y-2">
                <div className="text-xs font-medium text-[#465873] flex flex-wrap items-center gap-2">
                  <span className="font-bold text-[#126EB2]">{ch.category}</span>
                  <span aria-hidden="true">·</span>
                  <span>{ch.difficulty}</span>
                  <span aria-hidden="true">·</span>
                  <span className="tabular-nums">{ch.estimatedMinutes} min</span>
                </div>
                <h4 className="text-lg font-extrabold">{ch.title}</h4>
                <p className="text-sm text-[#465873]">{ch.description}</p>
                <p className="text-xs text-[#0F2544]/80">
                  <strong>Materials:</strong> {ch.materialsNeeded}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActiveChallenge(ch)}
                className="self-start min-h-[42px] px-4 py-2 rounded-xl bg-[#1E4EB8] text-white text-xs font-bold hover:bg-[#126EB2] cursor-pointer"
              >
                Open Challenge &amp; Submit Work
              </button>
            </article>
          ))}
        </div>

        {/* Submission Status History */}
        <div className="bg-white rounded-3xl border border-[#0F2544]/10 p-6 space-y-4">
          <h4 className="text-lg font-extrabold">Your Challenge Submissions</h4>
          {submissions.length === 0 ? (
            <p className="text-sm text-[#465873]">No challenge submissions yet.</p>
          ) : (
            <div className="divide-y divide-[#0F2544]/10">
              {submissions.map((sub) => (
                <div key={sub.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <div className="font-bold text-sm">{sub.challengeTitle}</div>
                    <div className="text-xs text-[#465873]">{sub.summary}</div>
                    {sub.reviewerNotes && (
                      <div className="text-xs text-[#126EB2] mt-1">
                        Reviewer feedback: {sub.reviewerNotes}
                      </div>
                    )}
                  </div>
                  <div className="text-xs font-bold shrink-0 flex items-center gap-1.5">
                    {sub.verificationType === 'reviewer_verified' ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-[#2D6A1E]" aria-hidden="true" />
                        <span className="text-[#2D6A1E]">Reviewer-verified</span>
                      </>
                    ) : (
                      <>
                        <Clock className="w-4 h-4 text-[#B83A1C]" aria-hidden="true" />
                        <span className="capitalize text-[#0F2544]">{sub.status.replace('_', ' ')}</span>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

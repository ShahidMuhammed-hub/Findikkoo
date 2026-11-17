import React, { useEffect, useState } from 'react';
import { Lightbulb, Sparkles, CheckCircle2, Plus, Car, MessageSquarePlus } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';
import type { OriginalProject } from '../shared/types';
import { BrushHeading } from '../illustrations/BrushTypography';

const PROJECT_CATEGORIES = [
  'Design',
  'Technology',
  'Education',
  'Environment',
  'Community',
  'Writing',
  'Photography',
  'Craft & Making',
  'Social Innovation',
  'Personal Experiments',
];

export function LetMeCreatePage() {
  const { refreshUser } = useAuth();
  const [myProjects, setMyProjects] = useState<OriginalProject[]>([]);
  const [portfolioProjects, setPortfolioProjects] = useState<OriginalProject[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Design');
  const [problemStatement, setProblemStatement] = useState('');
  const [solutionIdea, setSolutionIdea] = useState('');
  const [artifactSummary, setArtifactSummary] = useState('');
  const [impactNotes, setImpactNotes] = useState('');
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  // Progress update inline form state
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [updateText, setUpdateText] = useState('');
  const [updateError, setUpdateError] = useState('');
  const [savingUpdate, setSavingUpdate] = useState(false);

  // Gemini Brainstormer
  const [brainstormPrompt, setBrainstormPrompt] = useState('');
  const [ideas, setIdeas] = useState<
    {
      title: string;
      category: string;
      problemStatement: string;
      solutionIdea: string;
      firstWeekendStep: string;
    }[]
  >([]);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState('');

  useEffect(() => {
    setLoadingData(true);
    api.projects
      .list()
      .then((res) => {
        setMyProjects(res.myProjects);
        setPortfolioProjects(res.portfolioProjects);
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : 'Unable to load original projects.');
      })
      .finally(() => {
        setLoadingData(false);
      });
  }, []);

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setNotice('');
    setSaving(true);
    try {
      const res = await api.projects.create({
        title,
        category,
        problemStatement,
        solutionIdea,
        artifactSummary,
        impactNotes,
      });
      setMyProjects((prev) => [res.project, ...prev]);
      if (res.project.publishedToPortfolio) {
        setPortfolioProjects((prev) => [res.project, ...prev]);
      }
      await refreshUser();
      setTitle('');
      setProblemStatement('');
      setSolutionIdea('');
      setArtifactSummary('');
      setImpactNotes('');
      setNotice('Original project saved (self-reported) and queued for optional reviewer feedback. The Car grew.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to save project.');
    } finally {
      setSaving(false);
    }
  };

  const handleAddUpdate = async (e: React.FormEvent, projectId: string) => {
    e.preventDefault();
    if (!updateText.trim()) return;
    setUpdateError('');
    setSavingUpdate(true);
    try {
      const res = await api.projects.addUpdate(projectId, { updateText });
      setMyProjects((prev) => prev.map((p) => (p.id === projectId ? res.project : p)));
      setUpdateText('');
      setUpdatingId(null);
      setNotice('Project progress update logged—The Car grew closer to its next stage.');
    } catch (err) {
      setUpdateError(err instanceof Error ? err.message : 'Unable to log project update.');
    } finally {
      setSavingUpdate(false);
    }
  };

  const handleBrainstorm = async (e: React.FormEvent) => {
    e.preventDefault();
    setAiLoading(true);
    setAiError('');
    try {
      const res = await api.ai.brainstormProject(brainstormPrompt);
      setIdeas(res.ideas);
    } catch (err) {
      setAiError(err instanceof Error ? err.message : 'Brainstormer unavailable.');
    } finally {
      setAiLoading(false);
    }
  };

  const applyIdea = (idea: (typeof ideas)[number]) => {
    setTitle(idea.title);
    if (PROJECT_CATEGORIES.includes(idea.category)) {
      setCategory(idea.category);
    }
    setProblemStatement(idea.problemStatement);
    setSolutionIdea(idea.solutionIdea);
  };

  return (
    <div className="space-y-10">
      <div className="space-y-2">
        <p className="text-xs font-bold tracking-wide text-[#1E4EB8] flex items-center gap-1.5">
          <Car className="w-4 h-4" aria-hidden="true" />
          <span>GROWS THE CAR · ORIGINAL PROJECTS &amp; CREATIVITY</span>
        </p>
        <h2 className="text-3xl font-extrabold">
          <BrushHeading accentColor="#124E96">LET ME CREATE.</BrushHeading>
        </h2>
        <p className="text-sm text-[#465873] max-w-2xl">
          Notice a real problem or curiosity around you, build an original response with your own hands, and log steady updates as your work takes shape.
        </p>
      </div>

      <div className="grid lg:grid-cols-12 gap-6 items-start">
        <form
          onSubmit={handleCreateProject}
          className="lg:col-span-7 bg-white rounded-3xl border border-[#0F2544]/10 p-6 sm:p-8 space-y-4"
        >
          <h3 className="text-xl font-extrabold flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-[#B83A1C]" aria-hidden="true" />
            <span>Start an Original Project</span>
          </h3>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="proj-title" className="block text-xs font-bold mb-1">
                Project Title *
              </label>
              <input
                id="proj-title"
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Neighbourhood Tool-Lending Box"
                className="w-full min-h-[42px] px-3.5 py-2 rounded-xl border border-[#0F2544]/20 text-sm"
              />
            </div>
            <div>
              <label htmlFor="proj-cat" className="block text-xs font-bold mb-1">
                Category
              </label>
              <select
                id="proj-cat"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full min-h-[42px] px-3.5 py-2 rounded-xl border border-[#0F2544]/20 text-sm bg-white"
              >
                {PROJECT_CATEGORIES.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="proj-prob" className="block text-xs font-bold mb-1">
              What real-world problem or curiosity sparked this? *
            </label>
            <textarea
              id="proj-prob"
              required
              rows={2}
              value={problemStatement}
              onChange={(e) => setProblemStatement(e.target.value)}
              placeholder="Describe the real situation you noticed..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#0F2544]/20 text-sm"
            />
          </div>

          <div>
            <label htmlFor="proj-sol" className="block text-xs font-bold mb-1">
              Your Original Idea or Creation *
            </label>
            <textarea
              id="proj-sol"
              required
              rows={3}
              value={solutionIdea}
              onChange={(e) => setSolutionIdea(e.target.value)}
              placeholder="What are you building, designing, writing, or organizing?"
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#0F2544]/20 text-sm"
            />
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="proj-art" className="block text-xs font-bold mb-1">
                Artifacts / Sketches Summary
              </label>
              <input
                id="proj-art"
                type="text"
                value={artifactSummary}
                onChange={(e) => setArtifactSummary(e.target.value)}
                placeholder="e.g. Blueprints, wood cutouts, notes"
                className="w-full min-h-[42px] px-3.5 py-2 rounded-xl border border-[#0F2544]/20 text-sm"
              />
            </div>
            <div>
              <label htmlFor="proj-impact" className="block text-xs font-bold mb-1">
                Real-World Outcome Notes
              </label>
              <input
                id="proj-impact"
                type="text"
                value={impactNotes}
                onChange={(e) => setImpactNotes(e.target.value)}
                placeholder="Who will this help or inspire?"
                className="w-full min-h-[42px] px-3.5 py-2 rounded-xl border border-[#0F2544]/20 text-sm"
              />
            </div>
          </div>

          {error && <p role="alert" className="text-xs text-red-700 font-semibold">{error}</p>}
          {notice && (
            <p role="status" className="text-xs text-[#2D6A1E] font-semibold flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 shrink-0" aria-hidden="true" />
              <span>{notice}</span>
            </p>
          )}

          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 min-h-[44px] px-5 py-2.5 rounded-xl bg-[#1E4EB8] text-white text-sm font-bold hover:bg-[#126EB2] cursor-pointer disabled:opacity-60"
          >
            <Plus className="w-4 h-4" aria-hidden="true" />
            <span>{saving ? 'Saving...' : 'Save Original Project'}</span>
          </button>
        </form>

        {/* Gemini Brainstormer */}
        <div className="lg:col-span-5 bg-[#FFF0C9] rounded-3xl p-6 space-y-4 border border-[#F4C324]/50">
          <div className="flex items-center gap-2 text-[#0F2544]">
            <Sparkles className="w-5 h-5 text-[#B83A1C]" aria-hidden="true" />
            <h3 className="text-lg font-extrabold">Original Project Brainstormer</h3>
          </div>
          <p className="text-xs text-[#0F2544]/85 leading-relaxed">
            Name a local issue, hobby, or community space you care about and get 3 tangible weekend ideas.
          </p>
          <form onSubmit={handleBrainstorm} className="space-y-2.5">
            <input
              type="text"
              required
              aria-label="Community problem or curiosity"
              value={brainstormPrompt}
              onChange={(e) => setBrainstormPrompt(e.target.value)}
              placeholder="e.g. Neighbours rarely borrow or share tools"
              className="w-full min-h-[42px] px-3.5 py-2 rounded-xl bg-white border border-[#0F2544]/15 text-sm"
            />
            <button
              type="submit"
              disabled={aiLoading}
              className="w-full min-h-[44px] py-2.5 px-4 rounded-xl bg-[#B83A1C] text-white text-sm font-bold hover:bg-[#9E2F15] cursor-pointer disabled:opacity-60"
            >
              {aiLoading ? 'Brainstorming...' : 'Brainstorm Original Projects'}
            </button>
          </form>
          {aiError && <p role="alert" className="text-xs text-red-700 font-medium">{aiError}</p>}

          {ideas.map((idea, i) => (
            <div key={i} className="bg-white rounded-2xl p-4 space-y-2 border border-[#0F2544]/10">
              <div className="text-xs font-bold text-[#126EB2]">{idea.category}</div>
              <h4 className="font-bold text-sm">{idea.title}</h4>
              <p className="text-xs text-[#465873]">{idea.solutionIdea}</p>
              <button
                type="button"
                onClick={() => applyIdea(idea)}
                className="text-xs font-bold text-[#1E4EB8] hover:underline cursor-pointer"
              >
                Use this in my project workspace
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* My Projects with Working Progress Updates */}
      <section className="space-y-4">
        <h3 className="text-2xl font-extrabold">Your Original Projects</h3>
        {loadingData ? (
          <div className="grid md:grid-cols-2 gap-5">
            <div className="h-44 rounded-3xl bg-white border border-[#0F2544]/10 animate-pulse" />
            <div className="h-44 rounded-3xl bg-white border border-[#0F2544]/10 animate-pulse" />
          </div>
        ) : myProjects.length === 0 ? (
          <div className="bg-white rounded-3xl border border-[#0F2544]/10 p-6 text-sm text-[#465873]">
            You haven&apos;t started an original project yet. Document your first real-world build above to start growing The Car.
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-5">
            {myProjects.map((proj) => (
              <article
                key={proj.id}
                className="bg-white rounded-3xl border border-[#0F2544]/10 p-6 space-y-3"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                  <span className="font-bold text-[#126EB2]">{proj.category}</span>
                  <span className={`font-bold ${proj.verificationType === 'reviewer_verified' ? 'text-[#2D6A1E]' : 'text-[#465873]'}`}>
                    {proj.verificationType === 'reviewer_verified'
                      ? 'Reviewer-verified'
                      : `Self-reported · ${proj.status.replace('_', ' ')}`}
                  </span>
                </div>
                <h4 className="text-lg font-extrabold">{proj.title}</h4>
                <p className="text-xs text-[#465873]">
                  <strong>Problem:</strong> {proj.problemStatement}
                </p>
                <p className="text-sm text-[#0F2544]/85">{proj.solutionIdea}</p>
                {proj.impactNotes && (
                  <p className="text-xs font-semibold text-[#116D63]">
                    Outcome: {proj.impactNotes}
                  </p>
                )}

                {proj.updates.length > 0 && (
                  <div className="pt-2 border-t border-[#0F2544]/10 space-y-1.5">
                    <div className="text-xs font-bold text-[#465873]">Progress Updates</div>
                    {proj.updates.map((upd) => (
                      <div key={upd.id} className="text-xs bg-[#FFFDF6] p-2.5 rounded-xl border border-[#0F2544]/10">
                        {upd.text}
                      </div>
                    ))}
                  </div>
                )}

                {proj.reviewerFeedback && (
                  <p className="text-xs bg-[#E8F6FC] p-3 rounded-xl text-[#126EB2]">
                    Reviewer note: {proj.reviewerFeedback}
                  </p>
                )}

                {updatingId === proj.id ? (
                  <form onSubmit={(e) => handleAddUpdate(e, proj.id)} className="pt-2 space-y-2">
                    <input
                      type="text"
                      required
                      aria-label={`Progress update for ${proj.title}`}
                      value={updateText}
                      onChange={(e) => setUpdateText(e.target.value)}
                      placeholder="What concrete milestone did you complete?"
                      className="w-full min-h-[40px] px-3 py-2 rounded-xl border border-[#0F2544]/20 text-xs"
                    />
                    {updateError && <p role="alert" className="text-xs text-red-700">{updateError}</p>}
                    <div className="flex gap-2">
                      <button
                        type="submit"
                        disabled={savingUpdate}
                        className="min-h-[36px] px-3.5 py-1.5 rounded-lg bg-[#1E4EB8] text-white text-xs font-bold cursor-pointer disabled:opacity-60"
                      >
                        {savingUpdate ? 'Saving...' : 'Save Update'}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setUpdatingId(null);
                          setUpdateError('');
                        }}
                        className="min-h-[36px] px-3 py-1.5 rounded-lg text-xs font-semibold text-[#465873] cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setUpdatingId(proj.id);
                      setUpdateText('');
                      setUpdateError('');
                    }}
                    className="inline-flex items-center gap-1.5 min-h-[38px] px-3.5 py-1.5 rounded-xl bg-[#FFF0C9]/75 text-[#0F2544] text-xs font-bold hover:bg-[#FFF0C9] cursor-pointer"
                  >
                    <MessageSquarePlus className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>Add Progress Update</span>
                  </button>
                )}
              </article>
            ))}
          </div>
        )}
      </section>

      {/* Community Verified Portfolio Examples */}
      {portfolioProjects.length > 0 && (
        <section className="space-y-4">
          <h3 className="text-xl font-extrabold">Reviewer-Verified Community Projects</h3>
          <div className="grid md:grid-cols-2 gap-5">
            {portfolioProjects.map((proj) => (
              <article key={proj.id} className="bg-white rounded-3xl border border-[#0F2544]/10 p-6 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-[#126EB2]">
                    {proj.category} · {proj.userName}
                  </span>
                  <span className="font-bold text-[#2D6A1E]">Reviewer-verified</span>
                </div>
                <h4 className="text-lg font-extrabold">{proj.title}</h4>
                <p className="text-sm text-[#465873]">{proj.solutionIdea}</p>
              </article>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

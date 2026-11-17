import React, { useEffect, useState } from 'react';
import {
  ShieldCheck,
  Check,
  RotateCcw,
  X,
  Plus,
  Users,
  Eye,
  UserCheck,
  UserMinus,
  Trees,
  Home,
  Car,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';
import type {
  AuditLogEntry,
  ChallengeSubmission,
  OriginalProject,
  PublicUser,
  UserSkill,
  WorldElementId,
} from '../shared/types';
import type { MilestoneDefinition, WorldGrowthState } from '../shared/rules';

interface InspectedUserReport {
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
}

export function AdminDashboardPage() {
  const { user: currentAdmin } = useAuth();
  const [tab, setTab] = useState<'users' | 'submissions' | 'projects' | 'activities' | 'audit'>('users');
  const [loading, setLoading] = useState(true);
  const [totals, setTotals] = useState({
    users: 0,
    assignedUsers: 0,
    activities: 0,
    challenges: 0,
    completedMissions: 0,
    pendingSubmissions: 0,
    pendingProjects: 0,
  });
  const [users, setUsers] = useState<PublicUser[]>([]);
  const [userFilter, setUserFilter] = useState<'all' | 'assigned'>('all');
  const [submissions, setSubmissions] = useState<ChallengeSubmission[]>([]);
  const [projects, setProjects] = useState<OriginalProject[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [reviewNotes, setReviewNotes] = useState<Record<string, string>>({});
  const [statusMessage, setStatusMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Supervised user inspection state
  const [inspectedReport, setInspectedReport] = useState<InspectedUserReport | null>(null);
  const [inspectLoading, setInspectLoading] = useState(false);
  const [inspectError, setInspectError] = useState('');
  const [busyUserId, setBusyUserId] = useState<string | null>(null);

  // Add Offline Activity form
  const [actTitle, setActTitle] = useState('');
  const [actDesc, setActDesc] = useState('');
  const [actCat, setActCat] = useState('Creativity');
  const [actMins, setActMins] = useState(20);
  const [actElement, setActElement] = useState<WorldElementId>('tree');
  const [actMaterials, setActMaterials] = useState('Notebook and pen');
  const [actOutdoors, setActOutdoors] = useState(false);
  const [creatingActivity, setCreatingActivity] = useState(false);

  const loadDashboard = () => {
    setLoading(true);
    setErrorMessage('');
    api.admin
      .dashboard()
      .then((res) => {
        setTotals(res.totals);
        setUsers(res.users);
        setSubmissions(res.submissions);
        setProjects(res.projects);
        setAuditLogs(res.auditLogs);
      })
      .catch((err) => {
        setErrorMessage(err instanceof Error ? err.message : 'Unable to load supervisor dashboard.');
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const handleInspectUser = async (targetUserId: string) => {
    setInspectLoading(true);
    setInspectError('');
    try {
      const report = await api.admin.getUserProgress(targetUserId);
      setInspectedReport(report);
    } catch (err) {
      setInspectError(err instanceof Error ? err.message : 'Unable to load user progress.');
    } finally {
      setInspectLoading(false);
    }
  };

  const handleToggleSupervision = async (targetUser: PublicUser) => {
    const currentlyAssigned = targetUser.assignedSupervisorId === currentAdmin?.id;
    setStatusMessage('');
    setErrorMessage('');
    setBusyUserId(targetUser.id);
    try {
      const res = await api.admin.updateSupervision(targetUser.id, !currentlyAssigned);
      setStatusMessage(
        !currentlyAssigned
          ? `${res.user.name} is now assigned to your supervision caseload.`
          : `${res.user.name} was removed from your supervision caseload.`
      );
      if (inspectedReport?.user.id === targetUser.id) {
        setInspectedReport((prev) => (prev ? { ...prev, user: res.user } : null));
      }
      loadDashboard();
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Unable to update supervision assignment.');
    } finally {
      setBusyUserId(null);
    }
  };

  const handleReviewSubmission = async (
    id: string,
    status: 'approved' | 'revision_requested' | 'rejected'
  ) => {
    setStatusMessage('');
    setErrorMessage('');
    try {
      await api.admin.reviewSubmission(
        id,
        status,
        reviewNotes[id] ||
          (status === 'approved'
            ? 'Thoughtful real-world execution—marked reviewer-verified.'
            : 'Please refine and resubmit.')
      );
      setStatusMessage(`Challenge submission marked as "${status.replace('_', ' ')}".`);
      loadDashboard();
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Unable to update submission.');
    }
  };

  const handleReviewProject = async (id: string, status: 'approved' | 'revision_requested') => {
    setStatusMessage('');
    setErrorMessage('');
    try {
      await api.admin.reviewProject(
        id,
        status,
        reviewNotes[id] ||
          (status === 'approved'
            ? 'Original community work—marked reviewer-verified.'
            : 'Please clarify real-world steps or outcome.')
      );
      setStatusMessage(`Original project marked as "${status.replace('_', ' ')}".`);
      loadDashboard();
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Unable to update project.');
    }
  };

  const handleCreateActivity = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMessage('');
    setErrorMessage('');
    setCreatingActivity(true);
    try {
      await api.admin.createActivity({
        title: actTitle,
        description: actDesc,
        category: actCat,
        durationMinutes: actMins,
        worldElement: actElement,
        materialsNeeded: actMaterials,
        outdoors: actOutdoors,
      });
      setActTitle('');
      setActDesc('');
      setStatusMessage('New offline activity published to Let Me Choose.');
      loadDashboard();
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Unable to create activity.');
    } finally {
      setCreatingActivity(false);
    }
  };

  const visibleUsers =
    userFilter === 'assigned'
      ? users.filter((u) => u.assignedSupervisorId === currentAdmin?.id)
      : users;

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <p className="text-xs font-bold text-[#1E4EB8] flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4" aria-hidden="true" />
            <span>PROTECTED SUPERVISOR CONSOLE · WORLD GROWTH ONLY</span>
          </p>
          <h2 className="text-3xl font-extrabold">User Supervision, Review &amp; Curation</h2>
        </div>
        <button
          type="button"
          onClick={loadDashboard}
          disabled={loading}
          className="self-start min-h-[40px] px-4 py-2 rounded-xl border border-[#0F2544]/15 bg-white text-xs font-bold hover:bg-[#FFF0C9]/50 cursor-pointer disabled:opacity-60"
        >
          {loading ? 'Refreshing...' : 'Refresh Console'}
        </button>
      </div>

      {/* KPI Strip */}
      <section className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white rounded-2xl border border-[#0F2544]/10 p-4">
          <div className="text-xs text-[#465873]">Assigned to Me</div>
          <div className="text-2xl font-extrabold tabular-nums mt-1 text-[#1E4EB8]">
            {totals.assignedUsers}
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-[#0F2544]/10 p-4">
          <div className="text-xs text-[#465873]">Adult Accounts</div>
          <div className="text-2xl font-extrabold tabular-nums mt-1">{totals.users}</div>
        </div>
        <div className="bg-white rounded-2xl border border-[#0F2544]/10 p-4">
          <div className="text-xs text-[#465873]">Pending Challenges</div>
          <div className="text-2xl font-extrabold tabular-nums mt-1 text-[#B83A1C]">
            {totals.pendingSubmissions}
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-[#0F2544]/10 p-4">
          <div className="text-xs text-[#465873]">Pending Projects</div>
          <div className="text-2xl font-extrabold tabular-nums mt-1 text-[#1E4EB8]">
            {totals.pendingProjects}
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-[#0F2544]/10 p-4 col-span-2 lg:col-span-1">
          <div className="text-xs text-[#465873]">Self-Reported Sessions</div>
          <div className="text-2xl font-extrabold tabular-nums mt-1 text-[#116D63]">
            {totals.completedMissions}
          </div>
        </div>
      </section>

      {errorMessage && (
        <div role="alert" className="p-4 rounded-2xl bg-red-50 border border-red-200 text-sm font-semibold text-red-800 flex items-center justify-between gap-4">
          <span>{errorMessage}</span>
          <button
            type="button"
            onClick={loadDashboard}
            className="min-h-[36px] px-3 py-1 rounded-lg bg-white border border-red-300 text-xs font-bold cursor-pointer"
          >
            Retry
          </button>
        </div>
      )}

      {statusMessage && (
        <div role="status" className="p-4 rounded-2xl bg-[#9BE52E]/25 border border-[#78C943] text-sm font-semibold">
          {statusMessage}
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex flex-wrap gap-1.5 p-1 bg-[#FFF0C9]/60 rounded-xl w-fit">
        {[
          { id: 'users', label: `Users & Supervision (${users.length})` },
          { id: 'submissions', label: `Challenges (${submissions.length})` },
          { id: 'projects', label: `Projects (${projects.length})` },
          { id: 'activities', label: 'Add Offline Activity' },
          { id: 'audit', label: `Audit Logs (${auditLogs.length})` },
        ].map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setTab(item.id as typeof tab)}
            className={`min-h-[38px] px-3.5 py-2 rounded-lg text-xs font-bold cursor-pointer ${
              tab === item.id ? 'bg-white text-[#0F2544] shadow-xs' : 'text-[#465873]'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {loading && users.length === 0 ? (
        <div className="grid gap-4">
          <div className="h-32 rounded-3xl bg-white border border-[#0F2544]/10 animate-pulse" />
          <div className="h-32 rounded-3xl bg-white border border-[#0F2544]/10 animate-pulse" />
        </div>
      ) : (
        <>
          {/* Users & Supervision Tab */}
          {tab === 'users' && (
            <div className="space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setUserFilter('all')}
                    className={`min-h-[38px] px-3.5 py-1.5 rounded-xl text-xs font-bold border cursor-pointer ${
                      userFilter === 'all'
                        ? 'bg-[#1E4EB8] text-white border-[#1E4EB8]'
                        : 'bg-white text-[#0F2544] border-[#0F2544]/15'
                    }`}
                  >
                    All Adult Accounts ({users.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setUserFilter('assigned')}
                    className={`min-h-[38px] px-3.5 py-1.5 rounded-xl text-xs font-bold border cursor-pointer ${
                      userFilter === 'assigned'
                        ? 'bg-[#116D63] text-white border-[#116D63]'
                        : 'bg-white text-[#0F2544] border-[#0F2544]/15'
                    }`}
                  >
                    Assigned to Me ({totals.assignedUsers})
                  </button>
                </div>
                <p className="text-xs text-[#465873]">
                  Inspect any user&apos;s World Growth and skills, or manage supervision caseload assignments.
                </p>
              </div>

              {visibleUsers.length === 0 ? (
                <div className="bg-white rounded-3xl border border-[#0F2544]/10 p-6 text-sm text-[#465873]">
                  No users match this supervision filter yet. Switch to All Adult Accounts to assign users to your caseload.
                </div>
              ) : (
                <div className="bg-white rounded-3xl border border-[#0F2544]/10 overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="border-b border-[#0F2544]/10 text-xs text-[#465873]">
                      <tr>
                        <th className="p-4">Name</th>
                        <th className="p-4">Email</th>
                        <th className="p-4">Role</th>
                        <th className="p-4">Supervision</th>
                        <th className="p-4 text-right">Offline Min</th>
                        <th className="p-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#0F2544]/10">
                      {visibleUsers.map((u) => {
                        const isAssignedToMe = u.assignedSupervisorId === currentAdmin?.id;
                        const isSelf = u.id === currentAdmin?.id;
                        return (
                          <tr key={u.id} className="hover:bg-[#FFFDF6]">
                            <td className="p-4 font-semibold">
                              {u.name}
                              {u.isDemoAccount && (
                                <span className="ml-2 text-xs text-[#126EB2]">(Demo)</span>
                              )}
                            </td>
                            <td className="p-4 text-[#465873]">{u.email}</td>
                            <td className="p-4 capitalize">{u.role === 'admin' ? 'Supervisor' : 'Adult'}</td>
                            <td className="p-4">
                              {isSelf ? (
                                <span className="text-xs text-[#465873]">Self</span>
                              ) : isAssignedToMe ? (
                                <span className="inline-flex items-center gap-1 text-xs font-bold text-[#116D63] bg-[#E9FAF6] px-2.5 py-1 rounded-lg">
                                  Assigned to you
                                </span>
                              ) : u.assignedSupervisorId ? (
                                <span className="text-xs text-[#465873]">Assigned (other)</span>
                              ) : (
                                <span className="text-xs text-[#465873]">Unassigned</span>
                              )}
                            </td>
                            <td className="p-4 text-right tabular-nums font-bold">
                              {u.declaredOfflineMinutes}
                            </td>
                            <td className="p-4">
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  type="button"
                                  onClick={() => handleInspectUser(u.id)}
                                  className="inline-flex items-center gap-1 min-h-[36px] px-3 py-1.5 rounded-xl bg-[#E8F6FC] text-[#1E4EB8] text-xs font-bold hover:bg-[#d8eef9] cursor-pointer"
                                >
                                  <Eye className="w-3.5 h-3.5" aria-hidden="true" />
                                  <span>Inspect</span>
                                </button>
                                {!isSelf && (
                                  <button
                                    type="button"
                                    disabled={busyUserId === u.id}
                                    onClick={() => handleToggleSupervision(u)}
                                    className={`inline-flex items-center gap-1 min-h-[36px] px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer disabled:opacity-60 ${
                                      isAssignedToMe
                                        ? 'bg-[#FFF0C9] text-[#0F2544] hover:bg-[#F4C324]/50'
                                        : 'bg-[#116D63] text-white hover:bg-[#0D564E]'
                                    }`}
                                  >
                                    {isAssignedToMe ? (
                                      <>
                                        <UserMinus className="w-3.5 h-3.5" aria-hidden="true" />
                                        <span>Unassign</span>
                                      </>
                                    ) : (
                                      <>
                                        <UserCheck className="w-3.5 h-3.5" aria-hidden="true" />
                                        <span>Assign</span>
                                      </>
                                    )}
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Supervised User Progress Inspector */}
              {inspectError && (
                <div role="alert" className="p-4 rounded-2xl bg-red-50 border border-red-200 text-sm text-red-800">
                  {inspectError}
                </div>
              )}

              {inspectLoading && (
                <div className="h-48 rounded-3xl bg-white border border-[#0F2544]/10 animate-pulse" />
              )}

              {!inspectLoading && inspectedReport && (
                <section className="bg-white rounded-3xl border border-[#1E4EB8]/25 p-6 sm:p-8 space-y-6 shadow-xs">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#0F2544]/10">
                    <div>
                      <p className="text-xs font-bold text-[#126EB2] flex items-center gap-1.5">
                        <Users className="w-4 h-4" aria-hidden="true" />
                        <span>USER PROGRESS INSPECTOR</span>
                      </p>
                      <h3 className="text-2xl font-extrabold mt-0.5">{inspectedReport.user.name}</h3>
                      <p className="text-xs text-[#465873]">
                        {inspectedReport.user.email} · {inspectedReport.user.adultConfirmed ? '18+ Confirmed' : '18+'} ·{' '}
                        {inspectedReport.user.onboarding.completed ? 'Onboarding complete' : 'Onboarding pending'}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setInspectedReport(null)}
                      className="self-start min-h-[36px] px-3 py-1.5 rounded-xl border border-[#0F2544]/15 text-xs font-semibold hover:bg-[#FFF0C9]/50 cursor-pointer"
                    >
                      Close Inspector
                    </button>
                  </div>

                  {/* World Growth Stages */}
                  <div className="grid sm:grid-cols-3 gap-4">
                    <div className="p-4 rounded-2xl bg-[#FFFDF6] border border-[#0F2544]/10 space-y-1.5">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-[#2D6A1E]">
                        <Trees className="w-4 h-4" aria-hidden="true" />
                        <span>Tree · Stage {inspectedReport.worldGrowth.tree.stage}/4</span>
                      </div>
                      <div className="font-bold text-sm">{inspectedReport.worldGrowth.tree.stageTitle}</div>
                      <div className="text-xs text-[#465873]">
                        {inspectedReport.stats.skillsCount} skills · {inspectedReport.stats.challengesVerified} verified challenges
                      </div>
                    </div>
                    <div className="p-4 rounded-2xl bg-[#FFFDF6] border border-[#0F2544]/10 space-y-1.5">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-[#B83A1C]">
                        <Home className="w-4 h-4" aria-hidden="true" />
                        <span>House · Stage {inspectedReport.worldGrowth.house.stage}/4</span>
                      </div>
                      <div className="font-bold text-sm">{inspectedReport.worldGrowth.house.stageTitle}</div>
                      <div className="text-xs text-[#465873]">
                        {inspectedReport.stats.connectionsCount} connections · {inspectedReport.stats.journalCount} private journal notes
                      </div>
                    </div>
                    <div className="p-4 rounded-2xl bg-[#FFFDF6] border border-[#0F2544]/10 space-y-1.5">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-[#1E4EB8]">
                        <Car className="w-4 h-4" aria-hidden="true" />
                        <span>Car · Stage {inspectedReport.worldGrowth.car.stage}/4</span>
                      </div>
                      <div className="font-bold text-sm">{inspectedReport.worldGrowth.car.stageTitle}</div>
                      <div className="text-xs text-[#465873]">
                        {inspectedReport.stats.projectsCreated} projects ({inspectedReport.stats.projectsVerified} verified)
                      </div>
                    </div>
                  </div>

                  {/* Onboarding Profile & Skills */}
                  <div className="grid md:grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <h4 className="text-xs font-bold text-[#465873]">INTERESTS &amp; GOALS</h4>
                      <p className="text-sm text-[#0F2544]">
                        <strong>Interests:</strong>{' '}
                        {inspectedReport.user.onboarding.interests.join(', ') || 'Not specified yet'}
                      </p>
                      <p className="text-sm text-[#0F2544]">
                        <strong>Aspiration:</strong>{' '}
                        {inspectedReport.user.onboarding.aspiration || 'Not specified yet'}
                      </p>
                      <p className="text-xs text-[#465873]">
                        Offline time reported: {inspectedReport.stats.declaredOfflineMinutes} min ({inspectedReport.stats.completedMissions} completed sessions)
                      </p>
                    </div>

                    <div className="space-y-2">
                      <h4 className="text-xs font-bold text-[#465873]">TRACKED SKILLS ({inspectedReport.skills.length})</h4>
                      {inspectedReport.skills.length === 0 ? (
                        <p className="text-xs text-[#465873]">No skills added by this user yet.</p>
                      ) : (
                        <ul className="space-y-1.5 text-xs">
                          {inspectedReport.skills.map((sk) => (
                            <li key={sk.id} className="p-2.5 rounded-xl bg-[#FFFDF6] border border-[#0F2544]/10">
                              <strong>{sk.name}</strong> ({sk.level}) · {sk.practiceSessions} sessions ({sk.hoursPracticed}h)
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>

                  {/* Recent Completed Offline Activities */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold text-[#465873]">RECENT COMPLETED OFFLINE SESSIONS</h4>
                    {inspectedReport.recentMissions.length === 0 ? (
                      <p className="text-xs text-[#465873]">No completed offline sessions logged yet.</p>
                    ) : (
                      <div className="grid sm:grid-cols-2 gap-3">
                        {inspectedReport.recentMissions.map((m) => (
                          <div key={m.id} className="p-3.5 rounded-2xl bg-[#FFFDF6] border border-[#0F2544]/10 text-xs space-y-1">
                            <div className="font-bold text-[#126EB2]">
                              {m.category} · {m.plannedMinutes} min
                            </div>
                            <div className="font-bold text-sm text-[#0F2544]">{m.activityTitle}</div>
                            {m.whatDidYouDo && <p className="text-[#465873]">{m.whatDidYouDo}</p>}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </section>
              )}
            </div>
          )}

          {/* Challenge Submission Review Tab */}
          {tab === 'submissions' && (
            <div className="space-y-4">
              {submissions.length === 0 ? (
                <div className="bg-white rounded-3xl border border-[#0F2544]/10 p-6 text-sm text-[#465873]">
                  No practice challenge submissions yet.
                </div>
              ) : (
                submissions.map((sub) => (
                  <div key={sub.id} className="bg-white rounded-3xl border border-[#0F2544]/10 p-6 space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                      <span className="font-bold text-[#126EB2]">
                        {sub.userName} · {sub.verificationType.replace('_', ' ')}
                      </span>
                      <span className="font-bold capitalize">{sub.status.replace('_', ' ')}</span>
                    </div>
                    <h3 className="text-lg font-extrabold">{sub.challengeTitle}</h3>
                    <p className="text-sm text-[#0F2544]/85">{sub.summary}</p>
                    <p className="text-xs text-[#465873]">Artifact: {sub.workUrlOrArtifact}</p>

                    {(sub.status === 'submitted' || sub.status === 'revision_requested') && (
                      <div className="pt-3 border-t border-[#0F2544]/10 space-y-3">
                        <input
                          type="text"
                          aria-label={`Reviewer note for ${sub.challengeTitle}`}
                          value={reviewNotes[sub.id] || ''}
                          onChange={(e) => setReviewNotes((n) => ({ ...n, [sub.id]: e.target.value }))}
                          placeholder="Add constructive feedback..."
                          className="w-full min-h-[42px] px-3.5 py-2 rounded-xl border border-[#0F2544]/20 text-sm"
                        />
                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() => handleReviewSubmission(sub.id, 'approved')}
                            className="inline-flex items-center gap-1.5 min-h-[40px] px-4 py-2 rounded-xl bg-[#9BE52E] text-[#0F2544] text-xs font-bold cursor-pointer"
                          >
                            <Check className="w-3.5 h-3.5" aria-hidden="true" />
                            <span>Approve (Mark Reviewer-Verified)</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleReviewSubmission(sub.id, 'revision_requested')}
                            className="inline-flex items-center gap-1.5 min-h-[40px] px-4 py-2 rounded-xl bg-[#FFF0C9] text-[#0F2544] text-xs font-bold cursor-pointer"
                          >
                            <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
                            <span>Request Revision</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleReviewSubmission(sub.id, 'rejected')}
                            className="inline-flex items-center gap-1.5 min-h-[40px] px-4 py-2 rounded-xl bg-red-50 text-red-700 text-xs font-bold cursor-pointer"
                          >
                            <X className="w-3.5 h-3.5" aria-hidden="true" />
                            <span>Reject</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}

          {/* Project Review Tab */}
          {tab === 'projects' && (
            <div className="space-y-4">
              {projects.length === 0 ? (
                <div className="bg-white rounded-3xl border border-[#0F2544]/10 p-6 text-sm text-[#465873]">
                  No original projects submitted yet.
                </div>
              ) : (
                projects.map((p) => (
                  <div key={p.id} className="bg-white rounded-3xl border border-[#0F2544]/10 p-6 space-y-3">
                    <div className="flex justify-between text-xs">
                      <span className="font-bold text-[#126EB2]">
                        {p.userName} · {p.category}
                      </span>
                      <span className="font-bold capitalize">
                        {p.verificationType === 'reviewer_verified'
                          ? 'Reviewer-verified'
                          : p.status.replace('_', ' ')}
                      </span>
                    </div>
                    <h3 className="text-lg font-extrabold">{p.title}</h3>
                    <p className="text-xs text-[#465873]">Problem: {p.problemStatement}</p>
                    <p className="text-sm text-[#0F2544]/85">{p.solutionIdea}</p>
                    {p.status !== 'approved' && (
                      <div className="pt-2 space-y-2">
                        <input
                          type="text"
                          aria-label={`Reviewer note for ${p.title}`}
                          value={reviewNotes[p.id] || ''}
                          onChange={(e) => setReviewNotes((n) => ({ ...n, [p.id]: e.target.value }))}
                          placeholder="Add feedback for this project..."
                          className="w-full min-h-[40px] px-3 py-2 rounded-xl border border-[#0F2544]/20 text-xs"
                        />
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => handleReviewProject(p.id, 'approved')}
                            className="min-h-[40px] px-4 py-2 rounded-xl bg-[#9BE52E] text-[#0F2544] text-xs font-bold cursor-pointer"
                          >
                            Approve &amp; Grow Car
                          </button>
                          <button
                            type="button"
                            onClick={() => handleReviewProject(p.id, 'revision_requested')}
                            className="min-h-[40px] px-4 py-2 rounded-xl bg-[#FFF0C9] text-[#0F2544] text-xs font-bold cursor-pointer"
                          >
                            Request Revision
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}

          {/* Add Offline Activity Tab */}
          {tab === 'activities' && (
            <form onSubmit={handleCreateActivity} className="bg-white rounded-3xl border border-[#0F2544]/10 p-6 max-w-2xl space-y-4">
              <h3 className="text-lg font-extrabold">Publish Curated Offline Activity</h3>
              <input
                type="text"
                required
                aria-label="Activity title"
                value={actTitle}
                onChange={(e) => setActTitle(e.target.value)}
                placeholder="Activity title"
                className="w-full min-h-[42px] px-3.5 py-2 rounded-xl border border-[#0F2544]/20 text-sm"
              />
              <textarea
                required
                rows={3}
                aria-label="Activity instructions"
                value={actDesc}
                onChange={(e) => setActDesc(e.target.value)}
                placeholder="Clear offline instructions"
                className="w-full px-3.5 py-2 rounded-xl border border-[#0F2544]/20 text-sm"
              />
              <div className="grid sm:grid-cols-3 gap-3">
                <select
                  aria-label="Category"
                  value={actCat}
                  onChange={(e) => setActCat(e.target.value)}
                  className="min-h-[42px] px-3 py-2 rounded-xl border border-[#0F2544]/20 text-sm bg-white"
                >
                  <option>Creativity</option>
                  <option>Learning</option>
                  <option>Nature</option>
                  <option>Reading</option>
                  <option>Fitness</option>
                  <option>Community</option>
                </select>
                <select
                  aria-label="World element grown"
                  value={actElement}
                  onChange={(e) => setActElement(e.target.value as WorldElementId)}
                  className="min-h-[42px] px-3 py-2 rounded-xl border border-[#0F2544]/20 text-sm bg-white"
                >
                  <option value="tree">Grows The Tree (Learning)</option>
                  <option value="house">Grows The House (Life &amp; Connection)</option>
                  <option value="car">Grows The Car (Creation)</option>
                </select>
                <input
                  type="number"
                  aria-label="Recommended minutes"
                  min={5}
                  max={120}
                  value={actMins}
                  onChange={(e) => setActMins(Number(e.target.value))}
                  className="min-h-[42px] px-3 py-2 rounded-xl border border-[#0F2544]/20 text-sm"
                />
              </div>
              <div className="grid sm:grid-cols-2 gap-3 items-center">
                <input
                  type="text"
                  aria-label="Materials needed"
                  value={actMaterials}
                  onChange={(e) => setActMaterials(e.target.value)}
                  placeholder="Materials needed (e.g. None, sketchbook)"
                  className="min-h-[42px] px-3.5 py-2 rounded-xl border border-[#0F2544]/20 text-sm"
                />
                <label className="flex items-center gap-2 text-sm font-medium cursor-pointer">
                  <input
                    type="checkbox"
                    checked={actOutdoors}
                    onChange={(e) => setActOutdoors(e.target.checked)}
                    className="w-4 h-4 accent-[#1E4EB8]"
                  />
                  <span>Outdoor activity</span>
                </label>
              </div>
              <button
                type="submit"
                disabled={creatingActivity}
                className="inline-flex items-center gap-1.5 min-h-[44px] px-5 py-2.5 rounded-xl bg-[#1E4EB8] text-white text-sm font-bold cursor-pointer disabled:opacity-60"
              >
                <Plus className="w-4 h-4" aria-hidden="true" />
                <span>{creatingActivity ? 'Publishing...' : 'Add Offline Activity'}</span>
              </button>
            </form>
          )}

          {/* Audit Logs Tab */}
          {tab === 'audit' && (
            <div className="bg-white rounded-3xl border border-[#0F2544]/10 p-6 space-y-2.5">
              {auditLogs.length === 0 ? (
                <p className="text-sm text-[#465873]">No audit log entries recorded yet.</p>
              ) : (
                auditLogs.map((log) => (
                  <div key={log.id} className="text-xs py-2 border-b border-[#0F2544]/10 last:border-0 flex flex-col sm:flex-row sm:justify-between gap-1">
                    <div>
                      <span className="font-bold text-[#126EB2]">{log.action}</span>
                      <span className="mx-1.5">·</span>
                      <span>{log.details}</span>
                    </div>
                    <span className="text-[#465873] tabular-nums shrink-0">
                      {log.actorEmail} · {new Date(log.createdAt).toLocaleString()}
                    </span>
                  </div>
                ))
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}

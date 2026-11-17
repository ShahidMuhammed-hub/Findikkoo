import React, { useEffect, useState } from 'react';
import { Users, Shield, UserPlus, CheckCircle2, Home } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';
import type { CommunityMission, ConnectionRecord, RealExperienceCard } from '../shared/types';
import { BrushHeading } from '../illustrations/BrushTypography';

export function LetMeConnectPage() {
  const { user, refreshUser } = useAuth();
  const [connections, setConnections] = useState<ConnectionRecord[]>([]);
  const [missions, setMissions] = useState<CommunityMission[]>([]);
  const [experiences, setExperiences] = useState<RealExperienceCard[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [loadError, setLoadError] = useState('');

  const [peerName, setPeerName] = useState('');
  const [relationType, setRelationType] = useState('Friend');
  const [sharedInterest, setSharedInterest] = useState('');
  const [connNotice, setConnNotice] = useState('');
  const [connError, setConnError] = useState('');
  const [savingConn, setSavingConn] = useState(false);

  const [expType, setExpType] = useState('Created');
  const [expHeadline, setExpHeadline] = useState('');
  const [expStory, setExpStory] = useState('');
  const [expNotice, setExpNotice] = useState('');
  const [expError, setExpError] = useState('');
  const [savingExp, setSavingExp] = useState(false);

  useEffect(() => {
    setLoadingData(true);
    api.connect
      .overview()
      .then((res) => {
        setConnections(res.connections);
        setMissions(res.communityMissions);
        setExperiences(res.experiences);
      })
      .catch((err) => {
        setLoadError(err instanceof Error ? err.message : 'Unable to load community and connection data.');
      })
      .finally(() => {
        setLoadingData(false);
      });
  }, []);

  const handleRequestConnection = async (e: React.FormEvent) => {
    e.preventDefault();
    setConnNotice('');
    setConnError('');
    setSavingConn(true);
    try {
      const res = await api.connect.requestConnection({
        peerName,
        relationType,
        sharedInterest,
      });
      setConnections((prev) => [res.connection, ...prev]);
      await refreshUser();
      setPeerName('');
      setSharedInterest('');
      setConnNotice('Connection added to your personal circle. The House grew.');
    } catch (err) {
      setConnError(err instanceof Error ? err.message : 'Unable to add connection.');
    } finally {
      setSavingConn(false);
    }
  };

  const handleJoinMission = async (missionId: string) => {
    setLoadError('');
    try {
      const res = await api.connect.joinCommunityMission(missionId);
      setMissions((prev) => prev.map((m) => (m.id === missionId ? res.mission : m)));
      await refreshUser();
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : 'Unable to join community activity.');
    }
  };

  const handleShareExperience = async (e: React.FormEvent) => {
    e.preventDefault();
    setExpNotice('');
    setExpError('');
    setSavingExp(true);
    try {
      const res = await api.connect.shareExperience({
        type: expType,
        headline: expHeadline,
        story: expStory,
      });
      setExperiences((prev) => [res.experience, ...prev]);
      setExpHeadline('');
      setExpStory('');
      setExpNotice('Real experience note added.');
    } catch (err) {
      setExpError(err instanceof Error ? err.message : 'Unable to share experience note.');
    } finally {
      setSavingExp(false);
    }
  };

  return (
    <div className="space-y-10">
      <div className="space-y-1.5">
        <p className="text-xs font-bold tracking-wide text-[#116D63] flex items-center gap-1.5">
          <Home className="w-4 h-4" aria-hidden="true" />
          <span>GROWS THE HOUSE · OFFLINE LIFE &amp; RELATIONSHIPS</span>
        </p>
        <h2 className="text-3xl font-extrabold">
          <BrushHeading accentColor="#116D63">LET ME CONNECT.</BrushHeading>
        </h2>
        <p className="text-sm text-[#465873] max-w-2xl">
          Meaningful offline experiences, shared neighbourhood gatherings, and real relationships—with zero follower counts, likes, or algorithmic ranking.
        </p>
      </div>

      {/* Clear Privacy Expectation Banner */}
      <div className="bg-[#E8F6FC] border border-[#126EB2]/25 rounded-3xl p-5 flex items-start gap-3">
        <Shield className="w-5 h-5 text-[#126EB2] shrink-0 mt-0.5" aria-hidden="true" />
        <div className="text-sm text-[#0F2544]">
          <strong>Private by default:</strong> Your connection circle is limited to people you know and add intentionally. Shared experience notes never carry follower counts, view tallies, or public popularity rankings.
        </div>
      </div>

      {loadError && (
        <div role="alert" className="p-4 rounded-2xl bg-red-50 border border-red-200 text-sm text-red-800">
          {loadError}
        </div>
      )}

      {/* Community Offline Gatherings */}
      <section className="space-y-4">
        <h3 className="text-2xl font-extrabold">Shared Offline Community Activities</h3>
        {loadingData ? (
          <div className="grid md:grid-cols-3 gap-5">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-48 rounded-3xl bg-white border border-[#0F2544]/10 animate-pulse" />
            ))}
          </div>
        ) : (
        <div className="grid md:grid-cols-3 gap-5">
          {missions.map((m) => {
            const joined = user ? m.joinedUserIds.includes(user.id) : false;
            return (
              <article
                key={m.id}
                className="bg-white rounded-3xl border border-[#0F2544]/10 p-6 flex flex-col justify-between space-y-4"
              >
                <div className="space-y-2">
                  <div className="text-xs font-semibold text-[#116D63]">
                    {m.category} · {m.locationLabel}
                  </div>
                  <h4 className="text-lg font-extrabold">{m.title}</h4>
                  <p className="text-sm text-[#465873]">{m.description}</p>
                  <p className="text-xs font-medium text-[#0F2544]/75">
                    {m.impactGoal} · <span className="tabular-nums">{m.participantsCount}</span> participating
                  </p>
                </div>
                <button
                  type="button"
                  disabled={joined}
                  onClick={() => handleJoinMission(m.id)}
                  className={`w-full min-h-[44px] py-2.5 px-4 rounded-xl text-xs font-bold transition-colors ${
                    joined
                      ? 'bg-[#E9FAF6] text-[#116D63] border border-[#22BFAE]/40 cursor-default'
                      : 'bg-[#116D63] text-white hover:bg-[#0D564E] cursor-pointer'
                  }`}
                >
                  {joined ? 'Joined · Growing The House' : 'Commit to Join Offline'}
                </button>
              </article>
            );
          })}
        </div>
        )}
      </section>

      {/* Personal Circle + Real Experiences */}
      <section className="grid lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-5 bg-white rounded-3xl border border-[#0F2544]/10 p-6 space-y-4">
          <h3 className="text-xl font-extrabold flex items-center gap-2">
            <Users className="w-5 h-5 text-[#1E4EB8]" aria-hidden="true" />
            <span>Your Real-World Circle</span>
          </h3>

          {loadingData ? (
            <div className="h-24 rounded-2xl bg-[#FFFDF6] border border-[#0F2544]/10 animate-pulse" />
          ) : connections.length === 0 ? (
            <p className="text-xs text-[#465873] leading-relaxed">
              No people added yet. Add a friend, family member, mentor, or study partner you plan to meet or check in with offline.
            </p>
          ) : (
            <div className="space-y-2.5">
              {connections.map((c) => (
                <div
                  key={c.id}
                  className="p-3.5 rounded-2xl bg-[#FFFDF6] border border-[#0F2544]/10 flex items-center justify-between gap-3"
                >
                  <div>
                    <div className="font-bold text-sm">{c.peerName}</div>
                    <div className="text-xs text-[#465873]">
                      {c.relationType}
                      {c.sharedInterest ? ` · ${c.sharedInterest}` : ''}
                    </div>
                  </div>
                  <span className="text-xs font-semibold text-[#116D63] capitalize">
                    {c.status}
                  </span>
                </div>
              ))}
            </div>
          )}

          <form onSubmit={handleRequestConnection} className="pt-4 border-t border-[#0F2544]/10 space-y-3">
            <h4 className="text-sm font-bold">Add Someone You Know Offline</h4>
            <input
              type="text"
              required
              aria-label="Person name"
              value={peerName}
              onChange={(e) => setPeerName(e.target.value)}
              placeholder="Name (e.g. Samira Patel)"
              className="w-full min-h-[42px] px-3.5 py-2 rounded-xl border border-[#0F2544]/20 text-sm"
            />
            <div className="grid grid-cols-2 gap-2">
              <select
                aria-label="Relationship type"
                value={relationType}
                onChange={(e) => setRelationType(e.target.value)}
                className="min-h-[42px] px-3 py-2 rounded-xl border border-[#0F2544]/20 text-sm bg-white"
              >
                <option>Friend</option>
                <option>Family</option>
                <option>Mentor</option>
                <option>Study Partner</option>
              </select>
              <input
                type="text"
                aria-label="Shared interest"
                value={sharedInterest}
                onChange={(e) => setSharedInterest(e.target.value)}
                placeholder="Shared activity"
                className="min-h-[42px] px-3 py-2 rounded-xl border border-[#0F2544]/20 text-sm"
              />
            </div>
            {connError && <p role="alert" className="text-xs text-red-700 font-semibold">{connError}</p>}
            {connNotice && (
              <p role="status" className="text-xs font-semibold text-[#2D6A1E] flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 shrink-0" aria-hidden="true" />
                <span>{connNotice}</span>
              </p>
            )}
            <button
              type="submit"
              disabled={savingConn}
              className="inline-flex items-center gap-1.5 min-h-[42px] px-4 py-2 rounded-xl bg-[#1E4EB8] text-white text-xs font-bold hover:bg-[#126EB2] cursor-pointer disabled:opacity-60"
            >
              <UserPlus className="w-3.5 h-3.5" aria-hidden="true" />
              <span>{savingConn ? 'Adding...' : 'Add to Circle'}</span>
            </button>
          </form>
        </div>

        {/* Real Experiences (No Likes or Rankings) */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-[#0F2544]/10 p-6 space-y-5">
          <div>
            <h3 className="text-xl font-extrabold">Real Experiences</h3>
            <p className="text-xs text-[#465873]">
              Quiet community notes on what people built, learned, or experienced offline—zero vanity counts.
            </p>
          </div>

          <form onSubmit={handleShareExperience} className="p-4 rounded-2xl bg-[#FFF0C9]/55 space-y-3">
            <div className="flex flex-wrap gap-2">
              {['Created', 'Learned', 'Explored', 'Helped', 'Achieved'].map((t) => (
                <button
                  key={t}
                  type="button"
                  aria-pressed={expType === t}
                  onClick={() => setExpType(t)}
                  className={`min-h-[36px] px-3 py-1 rounded-lg text-xs font-semibold cursor-pointer ${
                    expType === t ? 'bg-[#1E4EB8] text-white' : 'bg-white text-[#0F2544]'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
            <input
              type="text"
              required
              aria-label="Experience headline"
              value={expHeadline}
              onChange={(e) => setExpHeadline(e.target.value)}
              placeholder="What happened? (e.g. Hosted a screen-free Sunday supper)"
              className="w-full min-h-[42px] px-3.5 py-2 rounded-xl bg-white border border-[#0F2544]/15 text-sm"
            />
            <textarea
              required
              rows={2}
              aria-label="Experience story"
              value={expStory}
              onChange={(e) => setExpStory(e.target.value)}
              placeholder="Share the real moment..."
              className="w-full px-3.5 py-2 rounded-xl bg-white border border-[#0F2544]/15 text-sm"
            />
            {expError && <p role="alert" className="text-xs text-red-700 font-semibold">{expError}</p>}
            {expNotice && <p role="status" className="text-xs text-[#2D6A1E] font-semibold">{expNotice}</p>}
            <button
              type="submit"
              disabled={savingExp}
              className="min-h-[42px] px-4 py-2 rounded-xl bg-[#0F2544] text-white text-xs font-bold hover:bg-[#1E4EB8] cursor-pointer disabled:opacity-60"
            >
              {savingExp ? 'Sharing...' : 'Share Real Experience'}
            </button>
          </form>

          <div className="space-y-3">
            {experiences.map((exp) => (
              <article key={exp.id} className="p-4 rounded-2xl bg-[#FFFDF6] border border-[#0F2544]/10 space-y-1">
                <div className="text-xs font-semibold text-[#126EB2]">
                  {exp.type} · {exp.authorName}
                </div>
                <h4 className="font-bold text-base">{exp.headline}</h4>
                <p className="text-sm text-[#465873]">{exp.story}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

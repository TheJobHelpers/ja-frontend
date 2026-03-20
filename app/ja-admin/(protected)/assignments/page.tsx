"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { jaApi } from "../../../lib/jaApi";
import type { Client, Job, JobStatus } from "../../../types/ja-admin";

const STATUS_COLORS: Record<string, string> = {
  queued: "bg-zinc-500/10 border-zinc-500/20 text-zinc-400",
  assigned: "bg-sky-500/10 border-sky-500/20 text-sky-400",
  batch_active: "bg-violet-500/10 border-violet-500/20 text-violet-400",
  applied: "bg-blue-500/10 border-blue-500/20 text-blue-400",
  interviewing: "bg-amber-500/10 border-amber-500/20 text-amber-400",
  offer: "bg-emerald-500/10 border-emerald-500/20 text-emerald-400",
  rejected: "bg-red-500/10 border-red-500/20 text-red-400",
};

function getCurrentWeekId(): string {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 1);
  const dayOfYear = Math.ceil((now.getTime() - start.getTime()) / 86400000);
  const weekNum = Math.ceil((dayOfYear + start.getDay()) / 7);
  return `${now.getFullYear()}-W${String(weekNum).padStart(2, "0")}`;
}

function getClientLimit(createdAt?: string): number {
  const createdDate = createdAt ? new Date(createdAt) : new Date();
  const threeMonthsAgo = new Date();
  threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
  return createdDate < threeMonthsAgo ? 80 : 60;
}

// Generate past week IDs for the dropdown
function getPastWeeks(count: number): { id: string; label: string }[] {
  const weeks: { id: string; label: string }[] = [];
  const now = new Date();
  for (let i = 1; i <= count; i++) {
    const d = new Date(now);
    d.setDate(d.getDate() - 7 * i);
    const start = new Date(d.getFullYear(), 0, 1);
    const dayOfYear = Math.ceil((d.getTime() - start.getTime()) / 86400000);
    const weekNum = Math.ceil((dayOfYear + start.getDay()) / 7);
    const weekId = `${d.getFullYear()}-W${String(weekNum).padStart(2, "0")}`;
    // Compute week Monday and Sunday for label
    const mon = new Date(d);
    mon.setDate(mon.getDate() - mon.getDay() + 1);
    const sun = new Date(mon);
    sun.setDate(sun.getDate() + 6);
    const label = `${mon.toLocaleDateString("en-US", { month: "short", day: "numeric" })} – ${sun.toLocaleDateString("en-US", { month: "short", day: "numeric" })} (Week ${weekNum})`;
    weeks.push({ id: weekId, label });
  }
  return weeks;
}

const CURRENT_WEEK_ID = getCurrentWeekId();
const PAST_WEEKS = getPastWeeks(4);

// Time-ago helper
function timeAgo(dateStr?: string): string {
  if (!dateStr) return "";
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return `${Math.floor(days / 7)}w ago`;
}

function getInitials(name: string): string {
  return name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);
}

// ─── Add Manual Job Modal ──────────────────────────────────────
function AddManualJobModal({
  clientId, clientName, onClose, onAdd,
}: {
  clientId: string; clientName: string; onClose: () => void; onAdd: (job: Job) => void;
}) {
  const [form, setForm] = useState({ title: "", company: "", location: "", link: "", status: "queued" as JobStatus });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const newJob = await jaApi.post<Job>("/jobs", {
        client_id: clientId,
        job_title: form.title,
        company: form.company,
        location: form.location || undefined,
        apply_link: form.link || undefined,
        match_score: 99,
        source: "manual_ja",
        status: form.status,
        week_id: CURRENT_WEEK_ID,
      });
      onAdd(newJob);
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to add job");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
      <div className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-950 p-6 shadow-2xl">
        <div className="flex justify-between items-center mb-5">
          <div>
            <h3 className="text-sm font-bold text-zinc-100">Add Manual Job</h3>
            <p className="text-[11px] text-zinc-500 mt-0.5">For {clientName}</p>
          </div>
          <button onClick={onClose} className="text-zinc-500 hover:text-zinc-300">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest">Job Title</label>
            <input required value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-sm text-zinc-100 outline-none focus:border-violet-500/50" placeholder="e.g. Senior Frontend Engineer" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest">Company</label>
              <input required value={form.company} onChange={e => setForm(f => ({ ...f, company: e.target.value }))} className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-sm text-zinc-100 outline-none focus:border-violet-500/50" placeholder="e.g. Vercel" />
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest">Location</label>
              <input required value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-sm text-zinc-100 outline-none focus:border-violet-500/50" placeholder="e.g. Remote" />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest">Apply Link</label>
            <input type="url" value={form.link} onChange={e => setForm(f => ({ ...f, link: e.target.value }))} className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-sm text-zinc-100 outline-none focus:border-violet-500/50" placeholder="https://" />
          </div>
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest">Starting Status</label>
            <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value as JobStatus }))} className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-sm text-zinc-100 outline-none focus:border-violet-500/50 appearance-none">
              <option value="queued">Queued (Needs Processing)</option>
              <option value="applied">Applied (Already applied)</option>
            </select>
          </div>

          {error && <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">{error}</p>}

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-zinc-700 font-bold text-xs text-zinc-400 hover:text-zinc-200 transition">Cancel</button>
            <button type="submit" disabled={saving} className="flex-1 py-2.5 rounded-xl bg-violet-600 font-bold text-xs text-white hover:bg-violet-500 transition disabled:opacity-60">
              {saving ? "Adding..." : "Add Job"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}


// ─── Main Page ────────────────────────────────────────────────
export default function AssignmentsPipelinePage() {
  const searchParams = useSearchParams();
  const defaultClientParam = searchParams.get("client");

  const [clients, setClients] = useState<Client[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [selectedWeek, setSelectedWeek] = useState<string>(CURRENT_WEEK_ID);
  const [showAddModal, setShowAddModal] = useState(false);

  // Load clients
  useEffect(() => {
    async function load() {
      try {
        const data = await jaApi.get<{ clients: Client[] }>("/clients");
        const clientsList = data.clients || [];
        setClients(clientsList);
        // Auto-select first or URL-specified client
        if (clientsList.length > 0) {
          const match = defaultClientParam
            ? clientsList.find(c => c.name.toLowerCase() === defaultClientParam.toLowerCase())
            : null;
          setSelectedClientId(match?.id || clientsList[0].id);
        }
      } catch (err) {
        console.error("Failed to load clients:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [defaultClientParam]);

  // Load jobs when client or week changes
  // NOTE: We fetch ALL non-archived jobs for the client (no week_id filter on active
  // pipeline) because client-portal submitted jobs may not have a week_id set.
  const loadJobs = useCallback(async (clientId: string, weekId: string) => {
    try {
      // For current week: load ALL jobs (queued + assigned) regardless of week_id
      // so client-submitted jobs with no week_id still appear
      const query = weekId === CURRENT_WEEK_ID
        ? `/jobs?clientId=${clientId}`
        : `/jobs?clientId=${clientId}&week_id=${weekId}`;
      const data = await jaApi.get<{ jobs: Job[] }>(query);
      setJobs(data.jobs || []);
    } catch (err) {
      console.error("Failed to load jobs:", err);
      setJobs([]);
    }
  }, []);

  useEffect(() => {
    if (selectedClientId) {
      loadJobs(selectedClientId, selectedWeek);
    }
  }, [selectedClientId, selectedWeek, loadJobs]);

  const selectedClient = useMemo(() => clients.find(c => c.id === selectedClientId), [clients, selectedClientId]);

  // Job breakdown for current week
  const queuedJobs = jobs.filter(j => j.status === "queued");
  // 'assigned' is the new backend-consistent name for what was 'batch_active'
  const batchJobs = jobs.filter(j => j.status === "batch_active" || j.status === "assigned");
  const completedJobs = jobs.filter(j => ["applied", "interviewing", "offer", "rejected"].includes(j.status) && !j.is_archived);
  const clientRequestedCount = queuedJobs.filter(j => j.source === "client_selected").length;
  const limit = selectedClient ? getClientLimit(selectedClient.created_at) : 60;

  // Actions
  const updateJobStatus = async (id: string, status: JobStatus) => {
    try {
      await jaApi.patch(`/jobs/${id}`, { status });
      setJobs(prev => prev.map(j => j.id === id ? { ...j, status } : j));
    } catch (err) {
      console.error("Failed to update job:", err);
    }
  };

  const archiveCompletedBatch = async () => {
    try {
      await jaApi.post("/jobs", { week_id: selectedWeek, client_id: selectedClientId });
      // Reload jobs after archive
      if (selectedClientId) loadJobs(selectedClientId, selectedWeek);
    } catch (err) {
      console.error("Failed to archive:", err);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-8rem)] gap-6">
        <div className="w-80 shrink-0 rounded-2xl border border-zinc-800 bg-zinc-950/50 animate-pulse" />
        <div className="flex-1 rounded-2xl border border-zinc-800 bg-zinc-950/50 animate-pulse" />
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-8rem)] gap-6">
      {showAddModal && selectedClient && (
        <AddManualJobModal
          clientId={selectedClient.id}
          clientName={selectedClient.name}
          onClose={() => setShowAddModal(false)}
          onAdd={(job) => setJobs(p => [job, ...p])}
        />
      )}

      {/* ─── Left Pane: Client List ────────────────────────────── */}
      <div className="w-80 shrink-0 flex flex-col rounded-2xl border border-zinc-800 bg-zinc-950/50 overflow-hidden">
        <div className="p-4 border-b border-zinc-800 bg-zinc-900/40">
          <h2 className="text-sm font-bold text-zinc-100 uppercase tracking-widest mb-1.5">Client Pipeline</h2>
          <p className="text-[10px] text-zinc-500">{clients.length} clients · Week {CURRENT_WEEK_ID.split("-W")[1]}</p>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {clients.map(client => {
            const isSelected = client.id === selectedClientId;
            const cLimit = getClientLimit(client.created_at);
            const isVeteran = cLimit === 80;
            const initials = getInitials(client.name);

            return (
              <button
                key={client.id}
                onClick={() => setSelectedClientId(client.id)}
                className={`w-full text-left rounded-xl p-3 transition group ${
                  isSelected ? "bg-violet-500/10 border border-violet-500/30 shadow-lg shadow-violet-500/5" : "border border-transparent hover:bg-zinc-900/60 hover:border-zinc-800/50"
                }`}
              >
                <div className="flex items-center gap-3">
                  {/* Avatar */}
                  <div className={`relative h-9 w-9 shrink-0 rounded-lg flex items-center justify-center text-xs font-black ${
                    isSelected ? "bg-violet-500/20 text-violet-300" : "bg-zinc-800 text-zinc-400 group-hover:bg-zinc-700"
                  }`}>
                    {initials}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={`text-sm font-bold truncate ${
                        isSelected ? "text-violet-300" : "text-zinc-200"
                      }`}>{client.name}</span>
                      {isVeteran && (
                        <span className="text-[8px] font-black uppercase tracking-wider text-amber-500/70 bg-amber-500/10 px-1.5 py-0.5 rounded shrink-0">VET</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5 text-[10px] text-zinc-500">
                      <span>Max {cLimit}/wk</span>
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ─── Right Pane: Active Workflow ───────────────────────── */}
      <div className="flex-1 flex flex-col rounded-2xl border border-zinc-800 bg-zinc-950/50 overflow-hidden">
        {!selectedClient ? (
          <div className="flex-1 flex flex-col items-center justify-center text-zinc-500">
            <svg className="h-12 w-12 mb-4 opacity-20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}><path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
            <p>Select a client from the left pane to view their pipeline.</p>
          </div>
        ) : (
          <>
            {/* Header / Week Selector */}
            <div className="p-5 border-b border-zinc-800 bg-zinc-900/40">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  {/* Client Initials Avatar */}
                  <div className="h-10 w-10 rounded-xl bg-violet-500/20 flex items-center justify-center text-sm font-black text-violet-300">
                    {getInitials(selectedClient.name)}
                  </div>
                  <div>
                    <h1 className="text-xl font-bold text-zinc-100">
                      {selectedClient.name}&apos;s Pipeline
                    </h1>
                    <p className="text-[11px] text-zinc-400 mt-0.5">Track and manage weekly application flow.</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => setShowAddModal(true)} className="rounded-xl border border-zinc-700 bg-zinc-800/80 px-4 py-2 text-[11px] font-bold text-zinc-300 hover:text-white hover:border-zinc-600 hover:bg-zinc-700/80 transition">
                    ➕ Add Manual Job
                  </button>
                  <select
                    value={selectedWeek}
                    onChange={e => setSelectedWeek(e.target.value)}
                    className="bg-zinc-900 border border-zinc-700 text-zinc-200 text-sm rounded-xl px-4 py-2 outline-none focus:border-violet-500 transition appearance-none cursor-pointer"
                  >
                    <option value={CURRENT_WEEK_ID}>Current Week ({CURRENT_WEEK_ID})</option>
                    {PAST_WEEKS.map(w => <option key={w.id} value={w.id}>{w.label}</option>)}
                  </select>
                </div>
              </div>

              {selectedWeek === CURRENT_WEEK_ID && (
                <div className="flex justify-between items-center pt-3 border-t border-zinc-800/50">
                  <div className="flex gap-4">
                    {/* Visual mini-gauges */}
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] uppercase tracking-wider font-bold text-zinc-500">Limit</span>
                      <div className="h-1.5 w-16 rounded-full bg-zinc-800 overflow-hidden">
                        <div className="h-full rounded-full bg-zinc-400 transition-all" style={{ width: `${Math.min((jobs.length / limit) * 100, 100)}%` }} />
                      </div>
                      <span className="text-[10px] font-bold text-zinc-300">{jobs.length}/{limit}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] uppercase tracking-wider font-bold text-violet-400/80">Batch</span>
                      <div className="h-1.5 w-16 rounded-full bg-zinc-800 overflow-hidden">
                        <div className="h-full rounded-full bg-violet-500 transition-all" style={{ width: `${Math.min((batchJobs.length / 15) * 100, 100)}%` }} />
                      </div>
                      <span className="text-[10px] font-bold text-violet-300">{batchJobs.length}/15</span>
                    </div>
                  </div>
                  <button
                    onClick={archiveCompletedBatch}
                    disabled={completedJobs.length === 0}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition ${
                      completedJobs.length > 0
                        ? "bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/20"
                        : "bg-zinc-900 text-zinc-600 border border-zinc-800 cursor-not-allowed"
                    }`}
                  >
                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                    Mark Week Complete ({completedJobs.length})
                  </button>
                </div>
              )}
            </div>

            {/* Workflow Columns */}
            {selectedWeek === CURRENT_WEEK_ID ? (
              <div className="flex-1 overflow-hidden flex gap-4 p-4">
                {/* 1. Queued */}
                <div className="flex-1 flex flex-col rounded-xl border border-zinc-800 bg-zinc-900/20 overflow-hidden">
                  <div className="p-3 border-b border-zinc-800 bg-zinc-900/50 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <h3 className="text-xs font-bold text-zinc-300 uppercase tracking-wider">1. Queued</h3>
                      {clientRequestedCount > 0 && (
                        <span className="bg-sky-500/15 text-sky-400 border border-sky-500/20 text-[9px] font-bold px-2 py-0.5 rounded-full animate-pulse">
                          {clientRequestedCount} client req
                        </span>
                      )}
                    </div>
                    <span className="bg-zinc-800 text-zinc-400 text-[10px] font-bold px-2 py-0.5 rounded-full">{queuedJobs.length}</span>
                  </div>
                  <div className="flex-1 overflow-y-auto p-3 space-y-3">
                    {queuedJobs.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-12 text-center">
                        <div className="h-10 w-10 rounded-full bg-zinc-800/50 flex items-center justify-center mb-3">
                          <svg className="h-5 w-5 text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                        </div>
                        <p className="text-[11px] text-zinc-500 font-medium">Queue is empty</p>
                        <p className="text-[10px] text-zinc-600 mt-1">Add jobs manually or wait for client requests</p>
                      </div>
                    ) : queuedJobs.map(job => (
                      <div key={job.id} className={`group rounded-xl border p-3 transition hover:shadow-md ${
                        job.source === "client_selected"
                          ? "border-sky-500/30 bg-sky-950/20 hover:border-sky-400/50"
                          : "border-zinc-800 bg-zinc-900/60 hover:border-zinc-700"
                      }`}>
                        <div className="flex justify-between items-start mb-1.5">
                          <div className="flex-1 min-w-0">
                            {job.source === "client_selected" && (
                              <div className="mb-1.5">
                                <span className="inline-flex items-center gap-1 bg-sky-500/10 border border-sky-500/20 text-sky-400 text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded">
                                  ⭐ Client Request
                                </span>
                              </div>
                            )}
                            <h4 className="text-xs font-bold text-zinc-200 truncate">{job.job_title}</h4>
                            <p className="text-[10px] text-zinc-500 mt-0.5">{job.company} · {job.location}</p>
                          </div>
                          <div className="flex flex-col items-end gap-1 shrink-0 ml-2">
                            {job.match_score > 0 && <span className="text-[10px] font-bold text-emerald-400/80">{job.match_score}%</span>}
                            {job.created_at && <span className="text-[9px] text-zinc-600">{timeAgo(job.created_at)}</span>}
                          </div>
                        </div>
                        {/* Description preview */}
                        {job.description && (
                          <p className="text-[10px] leading-relaxed text-zinc-500 line-clamp-2 mb-2 mt-1">{job.description.substring(0, 120)}{job.description.length > 120 ? "…" : ""}</p>
                        )}
                        <div className="flex gap-2 mt-2">
                          {job.apply_link && <a href={job.apply_link} target="_blank" rel="noreferrer" className="flex-1 text-center rounded-lg border border-zinc-700/50 bg-zinc-800/50 py-1.5 text-[9px] font-bold text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition">View Link ↗</a>}
                          <button onClick={() => updateJobStatus(job.id, "assigned")} disabled={batchJobs.length >= 15} className="flex-1 rounded-lg bg-violet-500/15 border border-violet-500/20 py-1.5 text-[9px] font-bold text-violet-300 hover:bg-violet-500/30 disabled:opacity-50 transition">→ Add to Batch</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 2. Active Batch */}
                <div className="flex-1 flex flex-col rounded-xl border border-violet-500/20 bg-violet-500/5 overflow-hidden ring-1 ring-violet-500/10 shadow-lg shadow-violet-500/5">
                  <div className="p-3 border-b border-violet-500/20 bg-violet-500/10 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <h3 className="text-xs font-bold text-violet-300 uppercase tracking-wider">2. Active Batch</h3>
                      {/* Mini progress bar */}
                      <div className="h-1 w-10 rounded-full bg-violet-900/50 overflow-hidden">
                        <div className="h-full rounded-full bg-violet-400 transition-all" style={{ width: `${Math.min((batchJobs.length / 15) * 100, 100)}%` }} />
                      </div>
                    </div>
                    <span className="bg-violet-500/20 text-violet-300 text-[10px] font-bold px-2 py-0.5 rounded-full">{batchJobs.length}</span>
                  </div>
                  <div className="flex-1 overflow-y-auto p-3 space-y-3">
                    {batchJobs.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-12 text-center">
                        <div className="h-10 w-10 rounded-full bg-violet-500/10 flex items-center justify-center mb-3">
                          <svg className="h-5 w-5 text-violet-500/40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
                        </div>
                        <p className="text-[11px] text-violet-400/50 font-medium">No active batch</p>
                        <p className="text-[10px] text-violet-500/30 mt-1">← Move jobs from the queue to start</p>
                      </div>
                    ) : batchJobs.map(job => (
                      <div key={job.id} className="rounded-xl border border-violet-500/20 bg-zinc-950/50 p-3 shadow-sm hover:border-violet-400/30 transition">
                        <div className="flex justify-between items-start mb-1">
                          <div className="flex-1 min-w-0">
                            {job.source === "client_selected" && (
                              <span className="inline-flex items-center gap-1 bg-sky-500/10 text-sky-400 text-[7px] font-black uppercase tracking-widest px-1 py-0.5 rounded mb-1">Client</span>
                            )}
                            <h4 className="text-xs font-bold text-zinc-100 truncate">{job.job_title}</h4>
                          </div>
                          {job.created_at && <span className="text-[9px] text-zinc-600 shrink-0 ml-2">{timeAgo(job.created_at)}</span>}
                        </div>
                        <p className="text-[10px] text-zinc-400 mb-3">{job.company} · {job.location}</p>
                        <div className="flex items-center gap-2">
                          <button onClick={() => updateJobStatus(job.id, "queued")} className="shrink-0 p-1.5 rounded-lg border border-red-500/20 text-red-400/70 hover:bg-red-500/10 transition"><svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg></button>
                          {job.apply_link && <a href={job.apply_link} target="_blank" rel="noreferrer" className="flex-1 text-center rounded-lg border border-zinc-700 bg-zinc-800 py-1.5 text-[10px] font-bold text-zinc-300 hover:bg-zinc-700 transition">Apply ↗</a>}
                          <button onClick={() => updateJobStatus(job.id, "applied")} className="flex-1 rounded-lg bg-gradient-to-r from-violet-500 to-purple-600 py-1.5 text-[10px] font-bold text-white shadow shadow-violet-500/20 hover:from-violet-400 hover:to-purple-500 transition">✓ Mark Applied</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 3. Applied / Completed */}
                <div className="flex-1 flex flex-col rounded-xl border border-zinc-800 bg-zinc-900/20 overflow-hidden">
                  <div className="p-3 border-b border-zinc-800 bg-zinc-900/50 flex justify-between items-center">
                    <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5"><svg className="h-3.5 w-3.5 text-emerald-400/70" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>3. Applied</h3>
                    <span className="bg-zinc-800 text-zinc-400 text-[10px] font-bold px-2 py-0.5 rounded-full">{completedJobs.length}</span>
                  </div>
                  <div className="flex-1 overflow-y-auto p-3 space-y-3">
                    {completedJobs.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-12 text-center">
                        <div className="h-10 w-10 rounded-full bg-emerald-500/10 flex items-center justify-center mb-3">
                          <svg className="h-5 w-5 text-emerald-500/30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        </div>
                        <p className="text-[11px] text-zinc-500 font-medium">No applications yet</p>
                        <p className="text-[10px] text-zinc-600 mt-1">← Mark batch jobs as applied</p>
                      </div>
                    ) : completedJobs.map(job => (
                      <div key={job.id} className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-3 hover:border-zinc-700 transition">
                        <div className="flex justify-between items-start mb-1">
                          <h4 className="text-xs font-bold text-zinc-200 truncate flex-1 min-w-0">{job.job_title}</h4>
                          <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider rounded border shrink-0 ml-2 ${STATUS_COLORS[job.status] || STATUS_COLORS.applied}`}>
                            <span className={`h-1 w-1 rounded-full ${
                              job.status === "interviewing" ? "bg-amber-400" :
                              job.status === "offer" ? "bg-emerald-400" :
                              job.status === "rejected" ? "bg-red-400" : "bg-blue-400"
                            }`} />
                            {job.status}
                          </span>
                        </div>
                        <p className="text-[10px] text-zinc-500">{job.company} · {job.location}</p>
                        {job.created_at && <p className="text-[9px] text-zinc-600 mt-1">{timeAgo(job.created_at)}</p>}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              /* Past Week View (Read Only Archive focus) */
              <div className="flex-1 overflow-y-auto p-6">
                <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6">
                  <h3 className="text-sm font-bold text-zinc-100 mb-4 flex items-center gap-2">
                    <svg className="h-4 w-4 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    Jobs this Week ({jobs.length})
                  </h3>

                  {jobs.length === 0 ? (
                    <div className="text-center py-12 text-zinc-500 italic text-sm">No record found for this week.</div>
                  ) : (
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {jobs.map(job => (
                        <div key={job.id} className="rounded-xl border border-zinc-800 bg-zinc-950 p-4 shadow-sm">
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="text-sm font-bold text-zinc-200">{job.job_title}</h4>
                            <span className={`inline-flex items-center px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded border ${STATUS_COLORS[job.status] || STATUS_COLORS.applied}`}>{job.status}</span>
                          </div>
                          <p className="text-xs text-zinc-400 mb-1">{job.company} · {job.location}</p>
                          {job.apply_link && <p className="text-[10px] text-zinc-500">Applied Link: <a href={job.apply_link} target="_blank" rel="noreferrer" className="text-violet-400 hover:underline px-1 py-0.5 ml-1 bg-violet-500/10 rounded">Source ↗</a></p>}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

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

/** Returns the ISO 8601 week number and year for any given date */
function getISOWeek(d: Date): { year: number; week: number } {
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  // ISO 8601: week containing Thursday → belongs to that week's year
  date.setUTCDate(date.getUTCDate() + 4 - (date.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  const week = Math.ceil((((date.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  return { year: date.getUTCFullYear(), week };
}

/** Returns a week ID like "2026-W13" from a Date */
function toWeekId(d: Date): string {
  const { year, week } = getISOWeek(d);
  return `${year}-W${String(week).padStart(2, "0")}`;
}

/** Returns { start: Monday 00:00 UTC, end: Sunday 23:59:59 UTC } for an ISO week ID */
function getWeekBounds(weekId: string): { start: Date; end: Date } {
  // weekId format: "2026-W13"
  const [yearStr, weekStr] = weekId.split("-W");
  const year = parseInt(yearStr, 10);
  const week = parseInt(weekStr, 10);
  // ISO 8601: Week 1 is the week containing the first Thursday of the year.
  // Monday of week 1:
  const jan4 = new Date(Date.UTC(year, 0, 4)); // Jan 4 is always in week 1
  const jan4Day = jan4.getUTCDay() || 7; // 1=Mon, 7=Sun
  const mon1 = new Date(jan4);
  mon1.setUTCDate(jan4.getUTCDate() - (jan4Day - 1));
  // Monday of target week:
  const start = new Date(mon1);
  start.setUTCDate(mon1.getUTCDate() + (week - 1) * 7);
  // Sunday (end) of target week:
  const end = new Date(start);
  end.setUTCDate(start.getUTCDate() + 6);
  end.setUTCHours(23, 59, 59, 999);
  return { start, end };
}

/** Returns the Sunday (start) of the ISO week for a given date */
function getWeekSunday(d: Date): Date {
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  // ISO week starts Monday; we display Sun-Sat so find the Sunday before Monday
  const day = date.getUTCDay(); // 0=Sun
  // Move back to Monday of that ISO week, then back 1 day to Sunday
  const isoMon = new Date(date);
  isoMon.setUTCDate(date.getUTCDate() - ((day + 6) % 7));
  const sun = new Date(isoMon);
  sun.setUTCDate(isoMon.getUTCDate() - 1);
  return sun;
}

/** Formats a date range label for the week dropdown */
function weekLabel(weekOffset: number, weekNum: number): string {
  const now = new Date();
  const pivot = new Date(now);
  pivot.setDate(now.getDate() - 7 * weekOffset);
  const sun = getWeekSunday(pivot);
  const sat = new Date(sun);
  sat.setUTCDate(sun.getUTCDate() + 6);
  const fmt = (date: Date) => date.toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" });
  return `${fmt(sun)} – ${fmt(sat)} (Week ${weekNum})`;
}

function getCurrentWeekId(): string { return toWeekId(new Date()); }

/** Generate past weeks for the dropdown, sorted newest → oldest */
function getPastWeeks(count: number): { id: string; label: string }[] {
  const weeks: { id: string; label: string }[] = [];
  const seen = new Set<string>();
  for (let i = 1; i <= count + 2; i++) {
    const d = new Date();
    d.setDate(d.getDate() - 7 * i);
    const id = toWeekId(d);
    if (seen.has(id)) continue;
    seen.add(id);
    const { week } = getISOWeek(d);
    weeks.push({ id, label: weekLabel(i, week) });
    if (weeks.length >= count) break;
  }
  return weeks;
}

const CURRENT_WEEK_ID = getCurrentWeekId();
const PAST_WEEKS = getPastWeeks(8);

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
  const [bundleIdInput, setBundleIdInput] = useState("");
  const [isSavingBundle, setIsSavingBundle] = useState(false);
  const [editingBundle, setEditingBundle] = useState(false);
  const [confirmBundleModal, setConfirmBundleModal] = useState<{isOpen: boolean; bundleId: string; jobCount: number} | null>(null);
  const [clientSearch, setClientSearch] = useState("");

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
  const loadJobs = useCallback(async (clientId: string, weekId: string) => {
    try {
      // For current week: load ALL jobs without week_id filter (client-submitted jobs may have no week_id)
      // For past weeks: request with week_id AND filter client-side by created_at for accuracy
      const query = weekId === CURRENT_WEEK_ID
        ? `/jobs?clientId=${clientId}`
        : `/jobs?clientId=${clientId}&week_id=${weekId}`;
      const data = await jaApi.get<{ jobs: Job[] }>(query);
      let result = data.jobs || [];

      if (weekId !== CURRENT_WEEK_ID) {
        // Client-side safety net: filter by created_at falling within the selected ISO week
        // This prevents jobs with no/wrong week_id from bleeding across week views
        const { start, end } = getWeekBounds(weekId);
        result = result.filter(j => {
          if (!j.created_at) return false;
          const d = new Date(j.created_at);
          return d >= start && d <= end;
        });
      }

      setJobs(result);
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
  // 'assigned' is the new backend-consistent name for 'in progress'
  const inProgressJobs = jobs.filter(j => j.status === "batch_active" || j.status === "assigned");
  const completedJobs = jobs.filter(j => ["applied", "interviewing", "offer", "rejected"].includes(j.status) && !j.is_archived);
  const clientRequestedCount = queuedJobs.filter(j => j.source === "client_selected").length;
  const PIPELINE_LIMIT = 15;

  // Actions
  const currentBundleId = useMemo(() => {
    return jobs.find(j => j.bundle_id)?.bundle_id || null;
  }, [jobs]);

  useEffect(() => {
    if (currentBundleId && !editingBundle) {
      setBundleIdInput(currentBundleId);
    } else if (!currentBundleId && !editingBundle) {
      setBundleIdInput("");
    }
  }, [currentBundleId, editingBundle]);

  const initiateSaveBundle = () => {
    if (!bundleIdInput.trim()) return;
    setConfirmBundleModal({
       isOpen: true,
       bundleId: bundleIdInput,
       jobCount: inProgressJobs.length
    });
  };

  const confirmSaveBundle = async () => {
    if (!confirmBundleModal || !selectedClientId) return;
    setIsSavingBundle(true);
    try {
      await jaApi.patch(`/jobs/bundle`, {
        client_id: selectedClientId,
        week_id: selectedWeek,
        bundle_id: confirmBundleModal.bundleId,
        job_ids: inProgressJobs.map(j => j.id),
      });
      // Refresh jobs from server to reflect persisted bundle_id
      await loadJobs(selectedClientId, selectedWeek);
      setEditingBundle(false);
      setConfirmBundleModal(null);
    } catch (err) {
      console.error("Failed to assign bundle ID:", err);
    } finally {
      setIsSavingBundle(false);
    }
  };

  const pushAllToInProgress = async () => {
    try {
      const qIds = queuedJobs.map(j => j.id);
      if (qIds.length === 0) return;
      // Optimistic bulk update
      setJobs(prev => prev.map(j => qIds.includes(j.id) ? { ...j, status: "assigned" } : j));
      // API call
      qIds.forEach(id => jaApi.patch(`/jobs/${id}`, { status: "assigned" }).catch(e => console.error(e)));
    } catch (err) {
      console.error("Failed bulk update:", err);
    }
  };

  const markAllApplied = async () => {
    try {
      const ids = inProgressJobs.map(j => j.id);
      if (ids.length === 0) return;
      setJobs(prev => prev.map(j => ids.includes(j.id) ? { ...j, status: "applied" } : j));
      ids.forEach(id => jaApi.patch(`/jobs/${id}`, { status: "applied" }).catch(e => console.error(e)));
    } catch (err) {
      console.error("Failed bulk update:", err);
    }
  };
  const updateJobStatus = async (id: string, status: JobStatus) => {
    try {
      await jaApi.patch(`/jobs/${id}`, { status });
      setJobs(prev => prev.map(j => j.id === id ? { ...j, status } : j));
    } catch (err) {
      console.error("Failed to update job:", err);
    }
  };

  const archiveWeeklyPipeline = async () => {
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
      <div className="flex flex-col lg:flex-row h-auto lg:h-[calc(100vh-8rem)] gap-6">
        <div className="w-full lg:w-80 h-64 lg:h-auto shrink-0 rounded-2xl border border-zinc-800 bg-zinc-950/50 animate-pulse" />
        <div className="flex-1 h-[500px] lg:h-auto rounded-2xl border border-zinc-800 bg-zinc-950/50 animate-pulse" />
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row h-auto lg:h-[calc(100vh-8rem)] gap-6">
      {showAddModal && selectedClient && (
        <AddManualJobModal
          clientId={selectedClient.id}
          clientName={selectedClient.name}
          onClose={() => setShowAddModal(false)}
          onAdd={(job) => setJobs(p => [job, ...p])}
        />
      )}

      {/* ─── Left Pane: Client List ────────────────────────────── */}
      <div className="w-full lg:w-80 h-[300px] lg:h-auto shrink-0 flex flex-col rounded-2xl border border-zinc-800 bg-zinc-950/50 overflow-hidden">
        <div className="p-4 border-b border-zinc-800 bg-zinc-900/40">
          <h2 className="text-sm font-bold text-zinc-100 uppercase tracking-widest mb-1.5">Client Pipeline</h2>
          <p className="text-[10px] text-zinc-500 mb-3">{clients.length} clients · Week {CURRENT_WEEK_ID.split("-W")[1]}</p>
          {/* Search bar */}
          <div className="relative">
            <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" /></svg>
            <input
              type="text"
              placeholder="Search clients..."
              value={clientSearch}
              onChange={e => setClientSearch(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-8 pr-8 py-1.5 text-xs text-zinc-100 placeholder-zinc-600 outline-none focus:border-violet-500/50 transition"
            />
            {clientSearch && (
              <button onClick={() => setClientSearch("")} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition">
                <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            )}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {clients
            .filter(c => c.name.toLowerCase().includes(clientSearch.toLowerCase()))
            .map(client => {
            const isSelected = client.id === selectedClientId;
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
                    </div>
                    <div className="flex items-center gap-2 mt-0.5 text-[10px] text-zinc-500">
                      <span>Max 15/wk</span>
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
              <div className="flex flex-col sm:flex-row sm:justify-between items-start gap-4 mb-4">
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

              {selectedWeek !== CURRENT_WEEK_ID && (
                <span className="text-[9px] font-black uppercase tracking-widest text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-1 rounded-lg animate-pulse">
                  ⚠ Past Week
                </span>
              )}
              {(
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center pt-3 border-t border-zinc-800/50 gap-4">
                  <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                    {/* Unified visual mini-gauge */}
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] uppercase tracking-wider font-bold text-violet-400/80">Weekly Pipeline</span>
                      <div className="h-1.5 w-16 rounded-full bg-zinc-800 overflow-hidden">
                        <div className="h-full rounded-full bg-violet-500 transition-all" style={{ width: `${Math.min((jobs.length / PIPELINE_LIMIT) * 100, 100)}%` }} />
                      </div>
                      <span className="text-[10px] font-bold text-violet-300">{jobs.length}/{PIPELINE_LIMIT}</span>
                    </div>

                    {/* Bundle ID Assigner */}
                    <div className="flex flex-col lg:flex-row lg:items-center gap-2 lg:border-l border-zinc-800/80 lg:pl-4 lg:ml-2">
                       {currentBundleId && !editingBundle ? (
                         <div className="flex items-center gap-2">
                           <span className="bg-sky-500/10 border border-sky-500/20 text-sky-400 text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded shadow-inner shadow-black/20">
                             BUNDLE: {currentBundleId}
                           </span>
                           <button onClick={() => setEditingBundle(true)} className="text-zinc-500 hover:text-zinc-300 transition" title="Edit Bundle ID">
                             <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                           </button>
                         </div>
                       ) : (
                         <div className="flex items-center gap-2">
                           <input 
                              type="text" 
                              value={bundleIdInput}
                              onChange={e => setBundleIdInput(e.target.value)}
                              placeholder="Assign Bundle ID..."
                              className="bg-zinc-900 border border-zinc-700 text-zinc-200 text-xs rounded-lg px-2.5 py-1 w-36 outline-none focus:border-violet-500 transition"
                           />
                           <button 
                              onClick={initiateSaveBundle}
                              disabled={isSavingBundle || !bundleIdInput.trim()}
                              className="bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 text-zinc-300 text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-lg transition"
                           >
                             Save
                           </button>
                           {editingBundle && (
                             <button onClick={() => setEditingBundle(false)} className="text-zinc-500 hover:text-zinc-300 transition text-[10px] font-bold uppercase">Cancel</button>
                           )}
                         </div>
                       )}
                    </div>
                  </div>
                  <button
                    onClick={archiveWeeklyPipeline}
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
            <div className="flex-1 overflow-y-auto lg:overflow-hidden flex flex-col xl:flex-row gap-4 p-4">
                {/* 1. Queued */}
                <div className="flex-1 flex flex-col min-h-[400px] xl:min-h-0 rounded-xl border border-zinc-800 bg-zinc-900/20 overflow-hidden">
                  <div className="p-3 border-b border-zinc-800 bg-zinc-900/50 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <h3 className="text-xs font-bold text-zinc-300 uppercase tracking-wider">1. Queued</h3>
                      {clientRequestedCount > 0 && (
                        <span className="bg-sky-500/15 text-sky-400 border border-sky-500/20 text-[9px] font-bold px-2 py-0.5 rounded-full animate-pulse">
                          {clientRequestedCount} client req
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="bg-zinc-800 text-zinc-400 text-[10px] font-bold px-2 py-0.5 rounded-full">{queuedJobs.length}</span>
                      {queuedJobs.length > 0 && (
                        <button onClick={pushAllToInProgress} className="text-[9px] font-black uppercase tracking-widest text-zinc-400 hover:text-white transition px-2 py-0.5 bg-zinc-800/50 hover:bg-zinc-700 border border-zinc-700 rounded shadow-sm">
                          Push All →
                        </button>
                      )}
                    </div>
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
                          <button onClick={() => updateJobStatus(job.id, "assigned")} className="flex-1 rounded-lg bg-violet-500/15 border border-violet-500/20 py-1.5 text-[9px] font-bold text-violet-300 hover:bg-violet-500/30 transition">→ Start Processing</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 2. In Progress */}
                <div className="flex-1 flex flex-col min-h-[400px] xl:min-h-0 rounded-xl border-2 border-dashed border-zinc-800/50 bg-transparent overflow-hidden relative">
                  <div className="p-3 border-b border-dashed border-zinc-800/50 bg-transparent flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <h3 className="text-xs font-bold text-violet-300 uppercase tracking-wider">2. In Progress</h3>
                      <span className="bg-violet-500/20 text-violet-300 text-[10px] font-bold px-2 py-0.5 rounded-full">{inProgressJobs.length}</span>
                    </div>
                    {inProgressJobs.length > 0 && (
                      <button onClick={markAllApplied} className="text-[9px] font-bold text-zinc-400 hover:text-violet-300 transition uppercase tracking-widest flex items-center gap-1 bg-transparent hover:bg-violet-500/10 px-2 py-1 rounded-lg">
                        Mark All Applied <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                      </button>
                    )}
                  </div>
                  <div className="flex-1 overflow-y-auto p-3 space-y-3">
                    {inProgressJobs.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-12 text-center">
                        <div className="h-10 w-10 rounded-full bg-violet-500/10 flex items-center justify-center mb-3">
                          <svg className="h-5 w-5 text-violet-500/40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
                        </div>
                        <p className="text-[11px] text-violet-400/50 font-medium">No jobs in progress</p>
                        <p className="text-[10px] text-violet-500/30 mt-1">← Move jobs from the queue to start</p>
                      </div>
                    ) : inProgressJobs.map(job => (
                      <div key={job.id} className="group rounded-xl border border-zinc-800/50 bg-zinc-900/10 p-3 hover:bg-zinc-900/40 hover:border-zinc-700 transition relative">
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
                          <button onClick={() => updateJobStatus(job.id, "queued")} className="opacity-0 group-hover:opacity-100 absolute -left-2.5 top-3 -translate-x-full shrink-0 p-1.5 rounded-lg border border-red-500/20 bg-zinc-900/90 text-red-400/70 hover:bg-red-500/10 hover:text-red-400 transition shadow-lg" title="Return to Queue">
                            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                          </button>
                          {job.apply_link && (
                            <a href={job.apply_link} target="_blank" rel="noreferrer" className="flex-1 text-center rounded-lg border border-transparent bg-transparent py-1.5 text-[10px] font-bold text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50 transition">View Details ↗</a>
                          )}
                          <button onClick={() => updateJobStatus(job.id, "applied")} className="flex-1 rounded-lg border border-transparent bg-transparent py-1.5 text-[10px] font-bold text-zinc-500 group-hover:text-violet-400 group-hover:bg-violet-500/10 hover:!bg-violet-500 hover:!text-white transition">✓ Mark Applied</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 3. Applied / Completed */}
                <div className="flex-1 flex flex-col min-h-[400px] xl:min-h-0 rounded-xl border border-zinc-800 bg-zinc-900/20 overflow-hidden">
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
          </>
        )}
      </div>

      {/* Confirm Bundle Assignment Modal */}
      {confirmBundleModal && confirmBundleModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-[400px] rounded-3xl border border-zinc-800 bg-zinc-950 p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center gap-4 mb-5">
              <div className="h-12 w-12 flex items-center justify-center rounded-2xl bg-violet-500/10 border border-violet-500/20 text-violet-400 shadow-inner">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Save Bundle Code</h3>
                <p className="text-xs text-zinc-400 mt-0.5">Please confirm your assignment details.</p>
              </div>
            </div>
            
            <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 mb-6 space-y-4">
              <div className="flex justify-between items-center text-sm border-b border-zinc-800 pb-3">
                <span className="text-zinc-500 font-medium">Bundle ID:</span>
                <span className="font-mono font-bold text-violet-300 bg-violet-500/10 px-2 py-0.5 rounded border border-violet-500/20">{confirmBundleModal.bundleId}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-zinc-500 font-medium">In-Progress Jobs:</span>
                <span className="font-bold text-zinc-100 flex items-center gap-1.5">
                   <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 opacity-80" />
                   {confirmBundleModal.jobCount} tracking maps
                </span>
              </div>
            </div>

            <p className="text-[11px] leading-relaxed text-zinc-500 mb-6 text-center max-w-[90%] mx-auto">
              You are assigning this tracking code strictly to the jobs currently marked as <strong className="text-violet-400 font-bold tracking-wide">IN PROGRESS</strong>. Other operational teams will be able to search for this bundle code immediately.
            </p>

            <div className="flex gap-3">
              <button 
                onClick={() => setConfirmBundleModal(null)} 
                className="flex-[0.8] rounded-xl bg-zinc-900 border border-zinc-800 py-3 text-xs font-bold text-zinc-300 hover:bg-zinc-800 hover:text-white transition"
              >
                Cancel
              </button>
              <button 
                onClick={confirmSaveBundle} 
                disabled={isSavingBundle}
                className="flex-[1.2] rounded-xl bg-violet-600 hover:bg-violet-500 py-3 text-xs font-bold uppercase tracking-wider text-white shadow-lg shadow-violet-500/20 transition disabled:opacity-50"
              >
                {isSavingBundle ? "Assigning..." : "Confirm & Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

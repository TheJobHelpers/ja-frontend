"use client";

import { useState } from "react";
import { jaApi } from "../../../lib/jaApi";
import type { Job, Client } from "../../../types/ja-admin";

const STATUS_COLORS: Record<string, string> = {
  queued: "bg-zinc-500/10 border-zinc-500/20 text-zinc-400",
  assigned: "bg-sky-500/10 border-sky-500/20 text-sky-400",
  batch_active: "bg-violet-500/10 border-violet-500/20 text-violet-400",
  applied: "bg-blue-500/10 border-blue-500/20 text-blue-400",
  interviewing: "bg-amber-500/10 border-amber-500/20 text-amber-400",
  offer: "bg-emerald-500/10 border-emerald-500/20 text-emerald-400",
  rejected: "bg-red-500/10 border-red-500/20 text-red-400",
};

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

export default function BundleSearchPage() {
  const [searchInput, setSearchInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [bundleJobs, setBundleJobs] = useState<Job[]>([]);
  const [clientName, setClientName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const updateJobStatus = async (id: string, status: Job["status"]) => {
    try {
      await jaApi.patch(`/jobs/${id}`, { status });
      setBundleJobs(prev => prev.map(j => j.id === id ? { ...j, status } : j));
    } catch (err) {
      console.error("Failed to update job:", err);
    }
  };

  const markAllApplied = async () => {
    try {
      const inProgressIds = bundleJobs
        .filter(j => j.status === "assigned" || j.status === "batch_active")
        .map(j => j.id);
      if (inProgressIds.length === 0) return;
      
      setBundleJobs(prev => prev.map(j => inProgressIds.includes(j.id) ? { ...j, status: "applied" as Job["status"] } : j));
      inProgressIds.forEach(id => jaApi.patch(`/jobs/${id}`, { status: "applied" }).catch(e => console.error(e)));
    } catch (err) {
      console.error("Failed bulk update:", err);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchInput.trim()) return;

    setLoading(true);
    setError(null);
    setHasSearched(true);
    setBundleJobs([]);
    setClientName(null);

    try {
      const data = await jaApi.get<{ jobs: Job[] }>(`/jobs?bundle_id=${encodeURIComponent(searchInput.trim())}`);
      const jobsList = data.jobs || [];
      setBundleJobs(jobsList);

      if (jobsList.length > 0) {
        try {
          const clientData = await jaApi.get<{ clients: Client[] }>("/clients");
          const match = clientData.clients?.find(c => c.id === jobsList[0].client_id);
          if (match) setClientName(match.name);
        } catch (err) {
          console.warn("Could not fetch client name for bundle:", err);
        }
      }
    } catch (err: any) {
      console.error("Bundle search failed:", err);
      setError("No bundle found for this ID. Ensure it has been saved from the Client Pipeline.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-8 animate-in fade-in duration-500 pb-12">
      {/* Hero Search */}
      <div className="rounded-3xl border border-zinc-800 bg-zinc-950/50 p-8 text-center relative overflow-hidden shadow-xl shadow-black/50">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-violet-500/5 pointer-events-none" />
        
        <div className="mx-auto w-12 h-12 flex items-center justify-center rounded-xl bg-violet-500/10 mb-4 border border-violet-500/20 shadow-inner shadow-violet-500/20 relative z-10">
          <svg className="h-6 w-6 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
        </div>

        <h1 className="text-3xl font-bold tracking-tight text-white mb-2 relative z-10">Lookup Weekly Bundle</h1>
        <p className="text-zinc-400 text-sm mb-8 relative z-10 max-w-lg mx-auto">
          Enter a Bundle ID to immediately retrieve and track an isolated set of applications assigned to the operations team.
        </p>

        <form onSubmit={handleSearch} className="max-w-lg mx-auto relative group z-10">
          <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-violet-500/30 to-fuchsia-500/30 opacity-0 group-focus-within:opacity-100 blur-xl transition duration-500" />
          
          <div className="relative flex shadow-2xl">
            <input
              type="text"
              placeholder="e.g. #TX-9021"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-l-2xl py-4 pl-12 text-zinc-100 placeholder-zinc-600 outline-none focus:border-violet-500/50 transition-all font-mono"
              autoFocus
            />
            <svg className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-600 group-focus-within:text-violet-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
            <button
              type="submit"
              disabled={!searchInput.trim() || loading}
              className="flex items-center gap-2 bg-violet-600 hover:bg-violet-500 border-y border-r border-violet-600 hover:border-violet-500 text-white text-[11px] font-bold uppercase tracking-wider px-8 rounded-r-2xl transition disabled:opacity-50"
            >
              {loading ? (
                <>
                  <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path></svg>
                  Searching
                </>
              ) : "Search"}
            </button>
          </div>
        </form>
      </div>

      {/* Results View */}
      {hasSearched && !loading && (
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-zinc-800/80 pb-4 px-2">
            <div>
              <h2 className="text-lg font-bold text-zinc-200">
                Bundle Results for <span className="text-violet-400">"{searchInput}"</span>
              </h2>
              {clientName && (
                <p className="text-xs font-medium text-zinc-500 mt-1">
                  Assigned to Client: <span className="text-zinc-300 font-bold">{clientName}</span>
                </p>
              )}
            </div>
            <div className="flex items-center gap-3 mt-4 sm:mt-0">
              {bundleJobs.some(j => j.status === "assigned" || j.status === "batch_active") && (
                <button onClick={markAllApplied} className="text-[10px] font-bold text-zinc-400 hover:text-violet-300 transition uppercase tracking-widest flex items-center gap-1.5 bg-transparent hover:bg-violet-500/10 px-3 py-1.5 rounded-lg border border-transparent hover:border-violet-500/20">
                  Mark All Applied <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                </button>
              )}
              <span className="text-[10px] font-bold uppercase tracking-widest text-violet-300 bg-violet-500/10 px-3 py-1.5 rounded-lg border border-violet-500/20 shadow-inner shadow-black/20 shrink-0">
                {bundleJobs.length} Jobs Mapped
              </span>
            </div>
          </div>

          {error && (
            <div className="p-6 rounded-2xl bg-amber-500/5 border border-amber-500/10 text-center animate-in slide-in-from-bottom-2 fade-in">
              <svg className="h-8 w-8 text-amber-500/50 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
              <p className="text-sm font-bold text-amber-500/80">{error}</p>
            </div>
          )}

          {bundleJobs.length === 0 && !error && (
            <div className="py-16 rounded-3xl border border-dashed border-zinc-800/80 bg-zinc-950/30 text-center shadow-inner shadow-black/40 animate-in slide-in-from-bottom-2 fade-in">
              <div className="h-16 w-16 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center mx-auto mb-4 shadow-xl">
                <svg className="h-6 w-6 text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" /></svg>
              </div>
              <p className="text-zinc-300 font-bold mb-1">No Jobs Found</p>
              <p className="text-zinc-500 text-xs max-w-sm mx-auto">This bundle ID hasn't been assigned to any operations workflows yet.</p>
            </div>
          )}

          <div className="grid gap-3">
            {bundleJobs.map(job => {
              const style = STATUS_COLORS[job.status] || STATUS_COLORS.assigned;
              return (
                <div key={job.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl border border-zinc-800/60 bg-zinc-900/40 hover:bg-zinc-900/80 hover:border-zinc-700/80 transition group shadow-sm hover:shadow-xl">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest border shadow-sm ${style}`}>
                        <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />
                        {job.status}
                      </span>
                      {job.source === "client_selected" && (
                        <span className="text-[8px] font-black uppercase tracking-widest text-sky-400 bg-sky-500/10 border border-sky-500/20 px-2 py-0.5 rounded-full shadow-inner shadow-black/20">
                          Client Request
                        </span>
                      )}
                      <span className="text-[10px] text-zinc-600 font-mono bg-zinc-950 px-2 py-0.5 rounded shadow-inner shadow-black/50 border border-zinc-900 group-hover:border-zinc-800 transition">
                         {job.week_id}
                      </span>
                    </div>
                    <h3 className="text-sm font-bold text-zinc-200 group-hover:text-violet-300 transition-colors truncate">{job.job_title}</h3>
                    <p className="text-[11px] font-medium text-zinc-500 mt-1">{job.company} <span className="mx-1.5 text-zinc-700">•</span> {job.location || 'Remote'}</p>
                  </div>
                  <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between gap-2 shrink-0 border-t border-zinc-800/50 sm:border-0 pt-3 sm:pt-0 mt-2 sm:mt-0 w-full sm:w-auto">
                    <span className="text-[9px] font-bold text-zinc-600 uppercase tracking-tighter shrink-0">{timeAgo(job.created_at)}</span>
                    <div className="flex items-center gap-2 mt-2 sm:mt-0 w-full sm:w-auto">
                      {job.apply_link && (
                        <a href={job.apply_link} target="_blank" rel="noreferrer" className="flex-1 sm:flex-none text-center px-4 py-2 sm:px-3 sm:py-1.5 rounded-lg border border-transparent bg-transparent text-[10px] font-bold text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50 transition whitespace-nowrap">
                          View Details ↗
                        </a>
                      )}
                      {(job.status === "assigned" || job.status === "batch_active") && (
                        <button onClick={() => updateJobStatus(job.id, "applied")} className="flex-1 sm:flex-none text-center rounded-lg border border-transparent bg-transparent px-4 py-2 sm:px-3 sm:py-1.5 text-[10px] font-bold text-zinc-500 hover:text-violet-400 hover:bg-violet-500/10 hover:!bg-violet-500 hover:!text-white transition whitespace-nowrap">
                          ✓ Mark Applied
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

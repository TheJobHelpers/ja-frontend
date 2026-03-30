"use client";

import { useState, useEffect } from "react";
import { apiGet } from "../../lib/api";
import { getClientToken } from "../../lib/clientAuth";
import { SkeletonBox, SkeletonText, SkeletonStatCard, SkeletonWeekGroup } from "../../components/Skeleton";

const BASE_URL = "/api/client";

async function markJobApplied(jobId: string, token: string): Promise<boolean> {
  try {
    const res = await fetch(`${BASE_URL}/jobs/${jobId}/status`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.ok;
  } catch {
    return false;
  }
}

interface Job {
  id: string;
  job_title: string;
  company?: string;
  location?: string;
  status: string;
  source?: string;
  created_at?: string;
  assigned_at?: string;
  match_score?: number;
  apply_link?: string;
  week_id?: string;
}

const STATUS_STYLES: Record<string, { bg: string; text: string; dot: string }> = {
  assigned: { bg: "bg-sky-500/10 border-sky-500/20", text: "text-sky-300", dot: "bg-sky-400" },
  queued: { bg: "bg-sky-500/10 border-sky-500/20", text: "text-sky-300", dot: "bg-sky-400" },
  reviewing: { bg: "bg-sky-500/10 border-sky-500/20", text: "text-sky-300", dot: "bg-sky-400" },
  saved: { bg: "bg-zinc-500/10 border-zinc-500/20", text: "text-zinc-300", dot: "bg-zinc-400" },
  applied: { bg: "bg-violet-500/10 border-violet-500/20", text: "text-violet-300", dot: "bg-violet-400" },
  interviewing: { bg: "bg-amber-500/10 border-amber-500/20", text: "text-amber-300", dot: "bg-amber-400" },
  offer: { bg: "bg-emerald-500/10 border-emerald-500/20", text: "text-emerald-300", dot: "bg-emerald-400" },
  rejected: { bg: "bg-red-500/10 border-red-500/20", text: "text-red-300", dot: "bg-red-400" },
};

const STATUSES = ["all", "queued", "assigned", "saved", "applied", "rejected"];

export default function TrackerPage() {
  const [filterStatus, setFilterStatus] = useState("all");
  const [collapsedWeeks, setCollapsedWeeks] = useState<Record<string, boolean>>({});
  const [jobs, setJobs] = useState<Job[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [confirmApplyId, setConfirmApplyId] = useState<string | null>(null);
  const [applyingId, setApplyingId] = useState<string | null>(null);

  useEffect(() => {
    async function loadJobs() {
      const token = getClientToken();
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const [jobsRes, statsRes] = await Promise.all([
          apiGet<any>("/api/client/jobs", token),
          apiGet<any>("/api/client/jobs/stats", token).catch(() => null)
        ]);
        // Backend may return { jobs: [...] }, { data: [...] }, or a direct array
        const data = Array.isArray(jobsRes)
          ? jobsRes
          : Array.isArray(jobsRes?.jobs)
          ? jobsRes.jobs
          : Array.isArray(jobsRes?.data)
          ? jobsRes.data
          : [];
        setJobs(data);
        if (statsRes) setStats(statsRes);
      } catch (e) {
        console.error("Failed to fetch jobs", e);
      } finally {
        setLoading(false);
      }
    }
    loadJobs();
  }, []);

  const handleMarkApplied = async (jobId: string) => {
    const token = getClientToken();
    if (!token) return;
    setApplyingId(jobId);
    const success = await markJobApplied(jobId, token);
    setApplyingId(null);
    setConfirmApplyId(null);
    if (success) {
      setJobs(prev => prev.map(j => j.id === jobId ? { ...j, status: "applied" } : j));
    }
  };

  const formatWeek = (weekId: string) => {
    if (weekId === "Past Jobs") return "Past Jobs";
    const m = weekId.match(/^(\d{4})-W(\d{2})$/);
    if (m) return `Week ${parseInt(m[2], 10)} (${m[1]})`;
    return weekId;
  };

  const filteredJobs = filterStatus === "all"
    ? jobs
    : jobs.filter((j) => j.status === filterStatus);

  const groupedJobs = filteredJobs.reduce((acc: Record<string, Job[]>, job) => {
    const group = job.week_id || "Past Jobs";
    if (!acc[group]) acc[group] = [];
    acc[group].push(job);
    return acc;
  }, {});

  const sortedGroups = Object.keys(groupedJobs).sort((a, b) => {
    if (a === "Past Jobs") return 1;
    if (b === "Past Jobs") return -1;
    return b.localeCompare(a);
  });

  if (loading) {
    return (
      <div className="space-y-6 animate-in fade-in duration-300">
        <div className="space-y-1">
          <SkeletonText className="w-36 h-7" />
          <SkeletonText className="w-52 h-4" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({length: 4}).map((_, i) => <SkeletonStatCard key={i} />)}
        </div>
        {/* Filter chips skeleton */}
        <div className="flex items-center gap-2">
          {["w-24","w-20","w-22","w-20","w-24"].map((w, i) => (
            <SkeletonBox key={i} className={`h-7 ${w} rounded-full`} />
          ))}
        </div>
        {/* Weekly groups skeleton */}
        <div className="space-y-10">
          <SkeletonWeekGroup />
          <SkeletonWeekGroup />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-zinc-100 flex items-center gap-3">
          My Jobs
          <span className="text-xs font-normal text-zinc-500 bg-zinc-800/80 px-2 py-0.5 rounded-full">
            {jobs.length} Total
          </span>
        </h1>
        <p className="text-sm text-zinc-400">
          Track and manage your applications
        </p>
      </div>

      {/* Dashboard Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-zinc-800/60 bg-zinc-900/30 p-4 relative overflow-hidden group hover:border-zinc-700 transition duration-300">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition duration-500" />
          <h3 className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-1 relative z-10">Weekly Allowance</h3>
          <p className="text-2xl font-black text-zinc-100 relative z-10">{stats?.assignments_used || 0} <span className="text-sm text-zinc-600 font-normal">/ {stats?.max_assignments || 15}</span></p>
        </div>
        <div className="rounded-2xl border border-zinc-800/60 bg-zinc-900/30 p-4 relative overflow-hidden group hover:border-zinc-700 transition duration-300">
          <div className="absolute inset-0 bg-gradient-to-br from-sky-500/5 to-transparent opacity-0 group-hover:opacity-100 transition duration-500" />
          <h3 className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-1 relative z-10">Total Jobs</h3>
          <p className="text-2xl font-black text-zinc-100 relative z-10">{jobs.length}</p>
        </div>
        <div className="rounded-2xl border border-zinc-800/60 bg-zinc-900/30 p-4 relative overflow-hidden group hover:border-zinc-700 transition duration-300">
          <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 to-transparent opacity-0 group-hover:opacity-100 transition duration-500" />
          <h3 className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-1 relative z-10">Applications</h3>
          <p className="text-2xl font-black text-zinc-100 relative z-10">{jobs.filter(j => j.status === 'applied').length}</p>
        </div>
        <div className="rounded-2xl border border-zinc-800/60 bg-zinc-900/30 p-4 relative overflow-hidden group hover:border-zinc-700 transition duration-300">
          <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-transparent opacity-0 group-hover:opacity-100 transition duration-500" />
          <h3 className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-1 relative z-10">In Queue</h3>
          <p className="text-2xl font-black text-zinc-100 relative z-10">{jobs.filter(j => ['queued', 'assigned', 'reviewing'].includes(j.status)).length}</p>
        </div>
      </div>

      {/* Filters - Simplified */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide no-scrollbar">
        {STATUSES.map((status) => {
          const isActive = filterStatus === status;
          const count = status === "all" 
            ? jobs.length 
            : jobs.filter(j => j.status === status).length;
          
          if (status !== "all" && count === 0) return null;

          return (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`whitespace-nowrap rounded-full px-4 py-1.5 text-[11px] font-bold uppercase tracking-wider transition-all border ${
                isActive
                  ? "bg-zinc-800 border-zinc-700 text-zinc-100 shadow-lg shadow-black/20"
                  : "bg-zinc-900/50 border-zinc-800/80 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700 hover:bg-zinc-900"
              }`}
            >
              {status === "all" ? "All Activity" : status}
              <span className={`ml-2 text-[10px] ${isActive ? 'text-zinc-400' : 'text-zinc-600'}`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      <div className="space-y-10">
        {Object.keys(groupedJobs).length === 0 ? (
          <div className="rounded-2xl border border-dashed border-zinc-800 bg-zinc-900/30 px-6 py-20 text-center">
            <div className="mx-auto w-12 h-12 rounded-full bg-zinc-800/50 flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <p className="text-sm font-medium text-zinc-400">No matching jobs found in your history</p>
            <button onClick={() => setFilterStatus("all")} className="mt-2 text-xs text-emerald-400 hover:underline">See all activity</button>
          </div>
        ) : (
          sortedGroups.map((weekGroup) => {
            const weekGroupJobs = groupedJobs[weekGroup];
            if (!weekGroupJobs || weekGroupJobs.length === 0) return null;

            const groupIndex = sortedGroups.indexOf(weekGroup);
            const isCollapsed = collapsedWeeks[weekGroup] ?? (groupIndex > 2);
            const sortedWeekJobs = [...weekGroupJobs].sort((j1, j2) => {
              const d1 = new Date(j1.created_at || j1.assigned_at || 0).getTime();
              const d2 = new Date(j2.created_at || j2.assigned_at || 0).getTime();
              return d2 - d1;
            });

            const displayTitle = formatWeek(weekGroup);

            return (
              <section key={weekGroup} className="space-y-4">
                <button
                  onClick={() => setCollapsedWeeks(prev => ({ ...prev, [weekGroup]: !isCollapsed }))}
                  className="flex w-full items-center gap-4 group"
                >
                  <div className="flex items-center gap-2">
                    <svg 
                      className={`h-4 w-4 text-zinc-500 transition-transform duration-200 ${isCollapsed ? '-rotate-90' : 'rotate-0'}`} 
                      fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                    <h2 className="text-[11px] font-bold uppercase tracking-[0.2em] text-zinc-300 group-hover:text-emerald-400 transition-colors whitespace-nowrap">
                      {displayTitle}
                    </h2>
                  </div>
                  <div className="h-[1px] w-full bg-zinc-800/50 group-hover:bg-zinc-700/50 transition-colors" />
                  <div className="shrink-0 text-[10px] font-bold text-zinc-500 bg-zinc-800/60 px-2.5 py-0.5 rounded-full group-hover:bg-zinc-700/60 group-hover:text-zinc-300 transition-colors shadow-inner shadow-black/20">
                    {weekGroupJobs.length} {weekGroupJobs.length === 1 ? 'Job' : 'Jobs'}
                  </div>
                </button>

                {!isCollapsed && (
                  <div className="space-y-4 animate-in slide-in-from-top-2 fade-in duration-200">
                    {sortedWeekJobs.map((job) => {
                    const style = STATUS_STYLES[job.status] || STATUS_STYLES.assigned;
                    const isJAHandled = job.source !== "client_selected";
                    const dateStr = job.created_at || job.assigned_at;
                    const displayDate = dateStr ? new Date(dateStr).toLocaleDateString() : 'Recently';

                    return (
                      <div
                        key={job.id}
                        className="group relative rounded-2xl border border-zinc-800/60 bg-zinc-900/20 p-5 transition hover:border-zinc-700 hover:bg-zinc-900/40"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 sm:gap-6">
                          <div className="flex-1 min-w-0 w-full">
                            <h3 className="text-base font-bold text-zinc-100 mb-2 group-hover:text-emerald-400 transition-colors">
                              {job.job_title}
                            </h3>
                            <div className="flex flex-wrap items-center gap-2">
                               {isJAHandled ? (
                                <div className="flex items-center gap-1.5 rounded bg-sky-500/10 px-1.5 py-0.5 text-[8px] font-black uppercase tracking-widest text-sky-400 border border-sky-400/20">
                                  JA Team
                                </div>
                              ) : (
                                <div className="flex items-center gap-1.5 rounded bg-emerald-500/10 px-1.5 py-0.5 text-[8px] font-black uppercase tracking-widest text-emerald-400 border border-emerald-400/20">
                                  Personal
                                </div>
                              )}
                              
                              {job.match_score != null && job.match_score > 0 && (
                                <div className="text-[9px] font-black text-zinc-400 bg-zinc-800/50 px-1.5 py-0.5 rounded uppercase tracking-tighter">
                                  {job.match_score}% Match
                                </div>
                              )}
                              <span className="text-xs font-semibold text-zinc-500 ml-1">
                                {job.company} <span className="text-zinc-700 mx-1">•</span> {job.location || "Remote"}
                              </span>
                            </div>
                          </div>

                          <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-2 shrink-0 w-full sm:w-auto">
                            <div className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-[10px] font-black uppercase tracking-widest ${style.bg} ${style.text}`}>
                              <span className={`h-1 w-1 rounded-full ${style.dot}`} />
                              {job.status}
                            </div>
                            <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-tighter">{displayDate}</span>
                          </div>
                        </div>                         <div className="mt-4 flex flex-col sm:flex-row sm:items-center justify-between border-t border-zinc-800/30 pt-4 gap-4">
                           <div className="flex items-center gap-2 flex-wrap w-full sm:w-auto">
                             {/* JA Reviewing label when JA-handled and assigned */}
                             {isJAHandled && job.status === "assigned" ? (
                               <span className="text-[10px] font-black uppercase tracking-widest text-sky-400/60 flex items-center gap-2">
                                 <span className="h-1 w-1 rounded-full bg-sky-400 animate-pulse" />
                                 JA Reviewing
                               </span>
                             ) : null}

                             {/* View Job link — always shows when there is an apply_link */}
                             {job.apply_link && job.status !== "applied" && (
                               <a
                                 href={job.apply_link}
                                 target="_blank"
                                 rel="noopener noreferrer"
                                 className="rounded-lg bg-zinc-100 text-zinc-950 px-4 py-1.5 text-[10px] font-black uppercase tracking-widest hover:bg-white transition shadow-lg shadow-white/5 flex items-center gap-1.5"
                               >
                                 <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                   <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                 </svg>
                                 View Job
                               </a>
                             )}

                             {/* Mark as Applied button — shows when job is not yet applied */}
                             {job.status !== "applied" && (
                               confirmApplyId === job.id ? (
                                 <div className="flex items-center gap-2">
                                   <span className="text-[10px] text-zinc-400 font-semibold">Applied already?</span>
                                   <button
                                     onClick={() => handleMarkApplied(job.id)}
                                     disabled={applyingId === job.id}
                                     className="rounded-lg bg-violet-600 hover:bg-violet-500 text-white px-3 py-1.5 text-[10px] font-black uppercase tracking-widest transition disabled:opacity-60 flex items-center gap-1.5"
                                   >
                                     {applyingId === job.id ? (
                                       <svg className="h-3 w-3 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path></svg>
                                     ) : (
                                       <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                                     )}
                                     Confirm
                                   </button>
                                   <button
                                     onClick={() => setConfirmApplyId(null)}
                                     className="rounded-lg border border-zinc-700 px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:text-zinc-300 hover:border-zinc-600 transition"
                                   >
                                     Cancel
                                   </button>
                                 </div>
                               ) : (
                                 <button
                                   onClick={() => setConfirmApplyId(job.id)}
                                   className="rounded-lg border border-dashed border-zinc-700 px-4 py-1.5 text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:text-emerald-300 hover:border-emerald-500/50 transition flex items-center gap-1.5"
                                 >
                                   <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                                   Mark as Applied
                                 </button>
                               )
                             )}
                           </div>
                           
                           <button className="w-full sm:w-auto rounded-lg border border-zinc-800 bg-zinc-900/50 px-4 py-2 sm:py-1.5 text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition">
                             Details
                           </button>
                         </div>
                      </div>
                    );
                  })}
                </div>
                )}
              </section>
            );
          })
        )}
      </div>
    </div>
  );
}


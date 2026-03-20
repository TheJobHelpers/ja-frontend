"use client";

import { useState, useEffect } from "react";
import { apiGet } from "../../lib/api";
import { getClientToken } from "../../lib/clientAuth";

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

const STATUSES = ["all", "queued", "assigned", "saved", "applied", "interviewing", "offer", "rejected"];

export default function TrackerPage() {
  const [filterStatus, setFilterStatus] = useState("all");
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadJobs() {
      const token = getClientToken();
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const res = await apiGet<any>("/api/client/jobs", token);
        // Backend may return { jobs: [...] }, { data: [...] }, or a direct array
        const data = Array.isArray(res)
          ? res
          : Array.isArray(res?.jobs)
          ? res.jobs
          : Array.isArray(res?.data)
          ? res.data
          : [];
        setJobs(data);
      } catch (e) {
        console.error("Failed to fetch jobs", e);
      } finally {
        setLoading(false);
      }
    }
    loadJobs();
  }, []);

  const getWeekGroup = (dateStr?: string) => {
    if (!dateStr) return "Recently";
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const dayDiff = diff / (1000 * 60 * 60 * 24);

    if (dayDiff < 7) return "This Week";
    if (dayDiff < 14) return "Last Week";
    if (dayDiff < 21) return "Two Weeks Ago";
    return "Older";
  };

  const filteredJobs = filterStatus === "all"
    ? jobs
    : jobs.filter((j) => j.status === filterStatus);

  const groupedJobs = filteredJobs.reduce((acc: Record<string, Job[]>, job) => {
    const group = getWeekGroup(job.created_at || job.assigned_at);
    if (!acc[group]) acc[group] = [];
    acc[group].push(job);
    return acc;
  }, {});

  const groupOrder = ["This Week", "Last Week", "Two Weeks Ago", "Older", "Recently"];

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
                  ? "bg-emerald-500 border-emerald-400 text-white shadow-lg shadow-emerald-500/20"
                  : "bg-zinc-900/50 border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700 hover:bg-zinc-900"
              }`}
            >
              {status === "all" ? "All Activity" : status}
              <span className={`ml-2 text-[10px] ${isActive ? 'text-emerald-100' : 'text-zinc-600'}`}>
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
          groupOrder.map((weekGroup) => {
            const weekGroupJobs = groupedJobs[weekGroup];
            if (!weekGroupJobs || weekGroupJobs.length === 0) return null;

            return (
              <section key={weekGroup} className="space-y-4">
                <div className="flex items-center gap-4">
                  <h2 className="text-[11px] font-bold uppercase tracking-[0.2em] text-zinc-500 whitespace-nowrap">
                    {weekGroup}
                  </h2>
                  <div className="h-[1px] w-full bg-zinc-800/50" />
                </div>

                <div className="space-y-4">
                  {weekGroupJobs.map((job) => {
                    const style = STATUS_STYLES[job.status] || STATUS_STYLES.assigned;
                    const isJAHandled = job.source !== "client_selected";
                    const dateStr = job.created_at || job.assigned_at;
                    const displayDate = dateStr ? new Date(dateStr).toLocaleDateString() : 'Recently';

                    return (
                      <div
                        key={job.id}
                        className="group relative rounded-2xl border border-zinc-800/60 bg-zinc-900/20 p-5 transition hover:border-zinc-700 hover:bg-zinc-900/40"
                      >
                        <div className="flex items-start justify-between gap-6">
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-2 mb-2">
                               {isJAHandled ? (
                                <div className="flex items-center gap-1.5 rounded-full bg-sky-500/10 px-2 py-0.5 text-[8px] font-black uppercase tracking-widest text-sky-400 border border-sky-400/20">
                                  JA Team
                                </div>
                              ) : (
                                <div className="flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[8px] font-black uppercase tracking-widest text-emerald-400 border border-emerald-400/20">
                                  Personal
                                </div>
                              )}
                              
                              {job.match_score != null && job.match_score > 0 && (
                                <div className="text-[9px] font-black text-white/50 bg-white/5 px-2 py-0.5 rounded uppercase tracking-tighter">
                                  {job.match_score}% Match
                                </div>
                              )}
                            </div>
                            
                            <h3 className="text-base font-bold text-zinc-100 mb-0.5 group-hover:text-emerald-400 transition-colors">
                              {job.job_title}
                            </h3>
                            <p className="text-xs font-semibold text-zinc-400">
                              {job.company} <span className="text-zinc-700 mx-1">•</span> {job.location}
                            </p>
                          </div>

                          <div className="flex flex-col items-end gap-2 shrink-0">
                            <div className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-[10px] font-black uppercase tracking-widest ${style.bg} ${style.text}`}>
                              <span className={`h-1 w-1 rounded-full ${style.dot}`} />
                              {job.status}
                            </div>
                            <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-tighter">{displayDate}</span>
                          </div>
                        </div>

                        <div className="mt-4 flex items-center justify-between border-t border-zinc-800/30 pt-4">
                          <div className="flex items-center gap-3">
                            {isJAHandled && job.status === "assigned" ? (
                               <span className="text-[10px] font-black uppercase tracking-widest text-sky-400/60 flex items-center gap-2">
                                <span className="h-1 w-1 rounded-full bg-sky-400 animate-pulse" />
                                JA Reviewing
                              </span>
                            ) : (
                              <a
                                href={job.apply_link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="rounded-lg bg-zinc-100 text-zinc-950 px-4 py-1.5 text-[10px] font-black uppercase tracking-widest hover:bg-white transition shadow-lg shadow-white/5"
                              >
                                {job.status === "applied" ? "Applied" : "Apply"}
                              </a>
                            )}
                            
                            <button className="text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:text-zinc-200 transition">
                              Details
                            </button>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <button className="p-1 text-zinc-700 hover:text-white transition">
                              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 5v.01M12 12v.01M12 19v.01" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            );
          })
        )}
      </div>
    </div>
  );
}


"use client";

import { useState, useEffect } from "react";

const STATUS_STYLES: Record<string, { bg: string; text: string; dot: string }> = {
  assigned: { bg: "bg-sky-500/10 border-sky-500/20", text: "text-sky-300", dot: "bg-sky-400" },
  saved: { bg: "bg-zinc-500/10 border-zinc-500/20", text: "text-zinc-300", dot: "bg-zinc-400" },
  applied: { bg: "bg-violet-500/10 border-violet-500/20", text: "text-violet-300", dot: "bg-violet-400" },
  interviewing: { bg: "bg-amber-500/10 border-amber-500/20", text: "text-amber-300", dot: "bg-amber-400" },
  offer: { bg: "bg-emerald-500/10 border-emerald-500/20", text: "text-emerald-300", dot: "bg-emerald-400" },
  rejected: { bg: "bg-red-500/10 border-red-500/20", text: "text-red-300", dot: "bg-red-400" },
};

const MOCK_JOBS = [
  { id: "1", job_title: "Senior Frontend Engineer", company: "TechCorp", location: "Remote", status: "assigned", origin: "admin_assigned", match_score: 92, saved_at: "2026-03-10", apply_link: "#" },
  { id: "2", job_title: "Full Stack Developer", company: "InnovateLab", location: "San Francisco, CA", status: "applied", origin: "admin_assigned", match_score: 87, saved_at: "2026-03-08", apply_link: "#" },
  { id: "3", job_title: "React Developer", company: "CloudBase Inc", location: "New York, NY", status: "interviewing", origin: "admin_assigned", match_score: 78, saved_at: "2026-03-05", apply_link: "#" },
  { id: "4", job_title: "UI/UX Engineer", company: "DesignFlow", location: "Austin, TX", status: "saved", origin: "client_saved", match_score: 0, saved_at: "2026-03-09", apply_link: "#" },
  { id: "5", job_title: "Software Engineer II", company: "MegaSoft", location: "Seattle, WA", status: "rejected", origin: "admin_assigned", match_score: 65, saved_at: "2026-03-02", apply_link: "#" },
];

const STATUSES = ["all", "assigned", "saved", "applied", "interviewing", "offer", "rejected"];

export default function TrackerPage() {
  const [filterStatus, setFilterStatus] = useState("all");
  const [jobs, setJobs] = useState(MOCK_JOBS);

  // Load saved jobs from Agent search
  useEffect(() => {
    const saved = localStorage.getItem("tjh_tracker_jobs");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setJobs((prev) => {
          const combined = [...prev];
          parsed.forEach((newJob: any) => {
            if (!combined.find(j => j.id === newJob.id)) {
              combined.unshift(newJob);
            }
          });
          return combined;
        });
      } catch (e) {
        console.error("Failed to parse tracker jobs", e);
      }
    }
  }, []);

  const filteredJobs = filterStatus === "all"
    ? jobs
    : jobs.filter((j) => j.status === filterStatus);

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

      {/* Filters */}
      <div className="flex flex-wrap gap-2 p-1 bg-zinc-900/50 rounded-2xl w-fit">
        {STATUSES.map((status) => {
          const isActive = filterStatus === status;
          return (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`rounded-xl px-4 py-2 text-xs font-semibold transition ${
                isActive
                  ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20"
                  : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800"
              }`}
            >
              {status === "all" ? "View All" : status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          );
        })}
      </div>

      {/* Job List */}
      <div className="space-y-4">
        {filteredJobs.length === 0 ? (
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/30 px-6 py-16 text-center">
            <div className="mx-auto w-12 h-12 rounded-full bg-zinc-800/50 flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <p className="text-sm font-medium text-zinc-400">No jobs match this status</p>
            <button onClick={() => setFilterStatus("all")} className="mt-2 text-xs text-emerald-400 hover:underline">Clear filter</button>
          </div>
        ) : (
          filteredJobs.map((job) => {
            const style = STATUS_STYLES[job.status] || STATUS_STYLES.assigned;
            const isJAHandled = job.origin === "admin_assigned";
            
            return (
              <div
                key={job.id}
                className="group relative rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6 transition hover:border-zinc-700 hover:bg-zinc-900/60"
              >
                <div className="flex items-start justify-between gap-6">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-3 mb-2">
                       {isJAHandled ? (
                        <div className="flex items-center gap-1.5 rounded-full bg-sky-500/10 border border-sky-500/20 px-2.5 py-1 text-[10px] font-bold uppercase tracking-tight text-sky-400">
                          <span className="h-1.5 w-1.5 rounded-full bg-sky-400 animate-pulse" />
                          JA Team Handled
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 rounded-full bg-zinc-800 border border-zinc-700 px-2.5 py-1 text-[10px] font-bold uppercase tracking-tight text-zinc-400">
                          Personal Save
                        </div>
                      )}
                      
                      {job.match_score > 0 && (
                        <div className="text-[10px] font-bold text-emerald-400 bg-emerald-500/5 border border-emerald-500/10 px-2 py-0.5 rounded">
                          {job.match_score}% Match
                        </div>
                      )}
                    </div>
                    
                    <h3 className="text-lg font-bold text-zinc-100 mb-1 group-hover:text-white transition">
                      {job.job_title}
                    </h3>
                    <p className="text-sm font-medium text-zinc-400 flex items-center gap-2">
                      {job.company} 
                      <span className="text-zinc-700">•</span>
                      {job.location}
                    </p>
                  </div>

                  <div className="flex flex-col items-end gap-3 shrink-0">
                    <div className={`inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs font-bold ${style.bg} ${style.text} shadow-sm shadow-black/20`}>
                      <span className={`h-2 w-2 rounded-full ${style.dot} shadow-[0_0_8px_rgba(255,255,255,0.3)]`} />
                      {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                    </div>
                    <span className="text-[10px] font-medium text-zinc-600">Updated {job.saved_at}</span>
                  </div>
                </div>

                <div className="mt-6 flex items-center justify-between border-t border-zinc-800/50 pt-4">
                  <div className="flex items-center gap-3">
                    {isJAHandled && job.status === "assigned" ? (
                       <button disabled className="rounded-xl bg-sky-500/10 border border-sky-500/20 px-5 py-2.5 text-xs font-bold text-sky-300">
                        JA Checking Requirements...
                      </button>
                    ) : (
                      <a
                        href={job.apply_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rounded-xl bg-emerald-500 text-white px-6 py-2.5 text-xs font-bold shadow-lg shadow-emerald-500/20 hover:bg-emerald-400 transition"
                      >
                        {job.status === "applied" ? "View Application" : "Apply Now →"}
                      </a>
                    )}
                    
                    <button className="rounded-xl border border-zinc-800 bg-zinc-800/30 px-5 py-2.5 text-xs font-bold text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition">
                      Job Details
                    </button>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button className="p-2 text-zinc-600 hover:text-white transition">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}


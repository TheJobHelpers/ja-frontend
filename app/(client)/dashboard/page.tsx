"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { apiGet } from "../../lib/api";
import { SkeletonBox } from "../../components/Skeleton";

interface Job {
  id: string;
  job_title: string;
  company?: string;
  location?: string;
  status: string;
  created_at?: string;
  assigned_at?: string;
}

const STATUS_STYLES: Record<string, { color: string; label: string }> = {
  assigned: { color: "sky", label: "Assigned" },
  queued: { color: "sky", label: "Queued" },
  reviewing: { color: "sky", label: "Reviewing" },
  saved: { color: "zinc", label: "Saved" },
  applied: { color: "violet", label: "Applied" },
  interviewing: { color: "amber", label: "Interviewing" },
  offer: { color: "emerald", label: "Offer" },
  rejected: { color: "red", label: "Rejected" },
};



const BG_COLORS: Record<string, string> = {
  sky: "bg-sky-400/10",
  zinc: "bg-zinc-400/10",
  violet: "bg-violet-400/10",
  amber: "bg-amber-400/10",
  emerald: "bg-emerald-400/10",
  red: "bg-red-400/10",
};

const PLATFORM_GUIDE = [
  { 
    id: 1, 
    title: "1. Search & Share", 
    text: "Use our internal search tool to find roles or send us jobs you've found.", 
    icon: "🔍" 
  },
  { 
    id: 2, 
    title: "2. Assign to JA Team", 
    text: "Move your preferred roles to the 'Queued' column officially.", 
    icon: "⚡" 
  },
  { 
    id: 3, 
    title: "3. Monitor Outreach", 
    text: "Track exactly how each application is progressing in realtime.", 
    icon: "⚙️" 
  },
  { 
    id: 4, 
    title: "4. Secure Interviews", 
    text: "Once we secure an opportunity, we'll provide the briefing notes.", 
    icon: "🏆" 
  },
];

function StatItem({ label, value, icon, color }: { label: string; value: string | number; icon: string; color: string }) {
  const accentGlows: Record<string, string> = {
    sky: "bg-sky-500/20 shadow-[0_0_10px_rgba(14,165,233,0.1)]",
    violet: "bg-violet-500/20 shadow-[0_0_10px_rgba(139,92,246,0.1)]",
    teal: "bg-teal-500/20 shadow-[0_0_10px_rgba(20,184,166,0.1)]",
    amber: "bg-amber-500/20 shadow-[0_0_10px_rgba(245,158,11,0.1)]",
  };

  return (
    <div className="flex flex-col items-center justify-center p-3 sm:p-4 flex-1 min-w-[80px] sm:min-w-[120px]">
      <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full ${accentGlows[color] || 'bg-slate-100 dark:bg-zinc-800'} flex items-center justify-center text-xs sm:text-sm mb-2`}>{icon}</div>
      <span className="text-xs sm:text-[14px] font-semibold text-slate-900 dark:text-white tracking-tight leading-none mb-1">{value}</span>
      <span className="text-[8px] sm:text-[9px] font-medium text-slate-400 dark:text-zinc-500 uppercase tracking-widest text-center">{label}</span>
    </div>
  );
}

export default function DashboardPage() {
  const [userName, setUserName] = useState<string>("Client");
  const [jobs, setJobs] = useState<Job[]>([]);
  const [stats, setStats] = useState<{ assignments_used?: number; max_assignments?: number } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [userRes, jobsRes, statsRes] = await Promise.all([
          apiGet<{ full_name?: string; name?: string }>("/api/client/auth/me").catch(() => null),
          apiGet<Job[] | { jobs: Job[] } | { data: Job[] }>("/api/client/jobs").catch(() => []),
          apiGet<{ assignments_used?: number; max_assignments?: number }>("/api/client/jobs/stats").catch(() => null),
        ]);
        const nameToUse = userRes?.name || userRes?.full_name;
        if (nameToUse) setUserName(nameToUse.split(" ")[0]);
        let jobsArray: Job[] = [];
        if (Array.isArray(jobsRes)) {
          jobsArray = jobsRes;
        } else if (jobsRes && typeof jobsRes === 'object') {
          if ('jobs' in jobsRes && Array.isArray(jobsRes.jobs)) jobsArray = jobsRes.jobs;
          else if ('data' in jobsRes && Array.isArray(jobsRes.data)) jobsArray = jobsRes.data;
        }
        setJobs(jobsArray);
        if (statsRes) setStats(statsRes);
      } catch (err) {
        console.error("Failed to fetch dashboard data:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const assignedCount = jobs.filter(j => ['queued', 'assigned', 'reviewing'].includes(j.status)).length;
  const appliedCount = jobs.filter(j => j.status === 'applied').length;
  const weeklyUsed = stats?.assignments_used ?? 0;
  const weeklyMax = stats?.max_assignments ?? 30;

  if (loading) {
    return (
      <div className="h-full space-y-8 animate-in fade-in duration-500">
        <div className="space-y-2"><SkeletonBox className="h-10 w-64 rounded-xl" /><SkeletonBox className="h-4 w-96 rounded-lg opacity-50" /></div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">{Array.from({ length: 4 }).map((_, i) => <SkeletonBox key={i} className="h-32 rounded-[2rem]" />)}</div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8"><SkeletonBox className="h-96 lg:col-span-2 rounded-[2.5rem]" /><SkeletonBox className="h-96 rounded-[2.5rem]" /></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col space-y-6 lg:space-y-8 pb-10 relative select-none animate-in fade-in duration-700">
      {/* Background Aura */}
      <div className="fixed top-[-10%] right-[-10%] w-[80vw] h-[80vw] lg:w-[50vw] lg:h-[50vw] bg-violet-500/5 dark:bg-violet-600/[0.03] blur-[120px] rounded-full pointer-events-none" />
      <div className="fixed bottom-[-10%] left-[-10%] w-[60vw] h-[60vw] lg:w-[40vw] lg:h-[40vw] bg-emerald-500/5 dark:bg-emerald-600/[0.03] blur-[120px] rounded-full pointer-events-none" />

      {/* Hero Welcome & Stats Section */}
      <div className="relative z-10 flex flex-col xl:flex-row xl:items-center justify-between gap-6 lg:gap-8 bg-white/70 dark:bg-zinc-900/40 backdrop-blur-3xl border border-slate-300/60 dark:border-zinc-800/60 rounded-[2rem] sm:rounded-[3rem] p-6 sm:p-8 lg:p-10 shadow-xl dark:shadow-2xl transition-all duration-500">
        <div className="flex flex-col">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)] animate-pulse" />
            <span className="text-[9px] font-medium text-slate-400 dark:text-zinc-500 uppercase tracking-[0.4em]">Personal Command Center</span>
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-semibold text-slate-900 dark:text-white tracking-tighter leading-none mb-2">
            Welcome back, <span className="bg-gradient-to-r from-emerald-600 to-teal-600 dark:from-emerald-400 dark:to-teal-500 bg-clip-text text-transparent font-bold">{userName}</span>
          </h1>
          <p className="text-[11px] sm:text-xs font-medium text-slate-500 dark:text-zinc-500 max-w-sm">Your career concierge is actively managing {assignedCount} roles in your pipeline today.</p>
        </div>

        <div className="grid grid-cols-2 sm:flex sm:items-center bg-slate-100/50 dark:bg-zinc-950/60 border border-slate-300/50 dark:border-zinc-800/50 rounded-[1.5rem] sm:rounded-3xl p-1 sm:p-2 shadow-inner">
           <StatItem label="Pipeline" value={assignedCount} icon="📋" color="sky" />
           <div className="hidden sm:block w-[1px] h-10 bg-slate-200 dark:bg-zinc-800/50 self-center" />
           <StatItem label="Applied" value={appliedCount} icon="🚀" color="violet" />
           <div className="hidden sm:block w-[1px] h-10 bg-slate-200 dark:bg-zinc-800/50 self-center" />
           <StatItem label="Total" value={jobs.length} icon="📁" color="teal" />
           <div className="hidden sm:block w-[1px] h-10 bg-slate-200 dark:bg-zinc-800/50 self-center" />
           <StatItem label="Limit" value={`${weeklyUsed}/${weeklyMax}`} icon="📅" color="amber" />
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 relative z-10">
        
        {/* Left Column: Recent Workstream */}
        <div className="lg:col-span-8 flex flex-col bg-white/50 dark:bg-zinc-900/30 backdrop-blur-3xl border border-slate-300/60 dark:border-zinc-800/60 rounded-[2rem] sm:rounded-[3rem] shadow-xl dark:shadow-2xl overflow-visible group transition-all duration-500">
           <div className="px-6 sm:px-10 py-6 sm:py-8 border-b border-slate-200/40 dark:border-zinc-800/40 flex items-center justify-between bg-slate-50/50 dark:bg-zinc-950/20">
              <div className="flex items-center gap-4">
                 <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.4)]" />
                 <h2 className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-[0.3em] text-slate-900 dark:text-white">Live Operations</h2>
              </div>
              <Link href="/tracker" className="group/link flex items-center gap-2 text-[9px] sm:text-[10px] font-medium text-slate-400 dark:text-zinc-500 uppercase tracking-widest hover:text-slate-900 dark:hover:text-white transition-all">
                <span className="hidden sm:inline">Open Full Tracker</span>
                <span className="sm:hidden">Tracker</span>
                <svg className="w-3.5 h-3.5 group-hover/link:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
              </Link>
           </div>
           
           <div className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-4 custom-scrollbar">
              {jobs.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center opacity-30 py-12">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl sm:rounded-3xl border-2 border-dashed border-slate-300 dark:border-zinc-700 flex items-center justify-center mb-6"><svg className="w-6 h-6 sm:w-8 sm:h-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg></div>
                  <p className="text-[9px] sm:text-[11px] font-medium uppercase tracking-[0.3em] text-slate-500">No active workflow detected</p>
                </div>
              ) : (
                jobs.slice(0, 6).map((job) => {
                  const status = STATUS_STYLES[job.status] || STATUS_STYLES.saved;
                  return (
                    <div key={job.id} className="group/card flex flex-col sm:flex-row sm:items-center justify-between rounded-[2rem] border border-slate-200/60 dark:border-zinc-800/40 bg-white dark:bg-zinc-950/40 px-6 sm:px-8 py-5 sm:py-6 transition-all duration-300 hover:border-emerald-200 dark:hover:border-zinc-700 hover:bg-slate-50 dark:hover:bg-zinc-900/50 shadow-sm dark:shadow-md gap-4 sm:gap-0">
                      <div className="flex-1 min-w-0 sm:pr-10">
                        <h3 className="text-[13px] sm:text-[15px] font-bold text-slate-900 dark:text-zinc-100 truncate group-hover/card:text-emerald-700 dark:group-hover/card:text-white transition-colors tracking-tight leading-tight">{job.job_title}</h3>
                        <div className="flex items-center gap-2.5 mt-1.5">
                           <p className="text-[11px] sm:text-[12px] font-medium text-slate-500 dark:text-zinc-500 truncate">{job.company}</p>
                           <span className="text-slate-300 dark:text-zinc-800 text-[10px]">•</span>
                           <p className="text-[11px] sm:text-[12px] font-medium text-slate-400 dark:text-zinc-600 truncate">{job.location || "Remote"}</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between sm:justify-end gap-5 shrink-0 border-t sm:border-t-0 border-slate-100 dark:border-zinc-800/30 pt-4 sm:pt-0">
                         <span className={`inline-flex items-center gap-2 rounded-xl border px-3.5 sm:px-5 py-1.5 sm:py-2 text-[8px] sm:text-[10px] font-black uppercase tracking-[0.2em] ${BG_COLORS[status.color]} ${status.color === 'sky' ? 'text-sky-700 dark:text-sky-400' : status.color === 'violet' ? 'text-violet-700 dark:text-violet-400' : status.color === 'amber' ? 'text-amber-700 dark:text-amber-400' : status.color === 'emerald' ? 'text-emerald-700 dark:text-emerald-400' : status.color === 'red' ? 'text-red-700 dark:text-red-400' : 'text-slate-600 dark:text-zinc-500'} border-slate-200/50 dark:border-white/5`}>
                           <span className={`h-1 w-1 sm:h-1.5 sm:w-1.5 rounded-full ${status.color === 'sky' ? 'bg-sky-500' : status.color === 'violet' ? 'bg-violet-500' : status.color === 'amber' ? 'bg-amber-500' : status.color === 'emerald' ? 'bg-emerald-500' : status.color === 'red' ? 'bg-red-500' : 'bg-slate-400'}`} />
                           {status.label}
                         </span>
                         <span className="text-[8px] sm:text-[9px] font-bold text-slate-300 dark:text-zinc-700 uppercase tracking-widest">Update: Today</span>
                      </div>
                    </div>
                  );
                })
              )}
           </div>
        </div>

        {/* Right Column: Platform Guide */}
        <div className="lg:col-span-4 flex flex-col bg-white/50 dark:bg-zinc-900/30 backdrop-blur-3xl border border-slate-200/60 dark:border-zinc-800/60 rounded-[2rem] sm:rounded-[3rem] shadow-xl dark:shadow-2xl overflow-visible transition-all duration-500">
           <div className="px-6 sm:px-10 py-6 sm:py-8 border-b border-slate-200/40 dark:border-zinc-800/40 bg-slate-50/50 dark:bg-zinc-950/20">
              <div className="flex items-center gap-4">
                 <div className="w-1.5 h-1.5 rounded-full bg-violet-500 shadow-[0_0_10px_rgba(139,92,246,0.3)]" />
                 <h2 className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-[0.3em] text-slate-900 dark:text-white">Expert Guidance</h2>
              </div>
           </div>
           
           <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-8 custom-scrollbar">
              <div className="space-y-4">
                <p className="text-[9px] font-medium text-slate-400 dark:text-zinc-600 uppercase tracking-[0.3em] mb-4">Master the Workflow</p>
                {PLATFORM_GUIDE.map((step) => (
                  <div key={step.id} className="group/step relative flex items-start gap-4 sm:gap-5 p-4 sm:p-5 rounded-[1.5rem] sm:rounded-[1.75rem] border border-slate-200/30 dark:border-zinc-800/30 bg-white dark:bg-zinc-950/20 transition-all hover:bg-slate-50 dark:hover:bg-zinc-900/40 hover:border-slate-300 dark:hover:border-zinc-700">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 shrink-0 rounded-xl bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 flex items-center justify-center text-sm sm:text-lg">{step.icon}</div>
                    <div className="space-y-1">
                       <h3 className="text-[12px] sm:text-[13px] font-semibold text-slate-900 dark:text-white tracking-tight leading-none">{step.title}</h3>
                       <p className="text-[10px] sm:text-[10.5px] font-medium text-slate-500 dark:text-zinc-500 leading-snug">{step.text}</p>
                    </div>
                  </div>
                ))}
              </div>
           </div>
        </div>

      </div>
    </div>
  );
}

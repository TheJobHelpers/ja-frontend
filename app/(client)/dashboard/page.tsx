"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { apiGet } from "../../lib/api";
import { getClientToken } from "../../lib/clientAuth";

interface Job {
  id: string;
  job_title: string;
  company?: string;
  location?: string;
  status: string;
  created_at?: string;
  assigned_at?: string;
  match_score?: number;
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

export default function DashboardPage() {
  const [userName, setUserName] = useState<string>("Client");
  const [jobs, setJobs] = useState<Job[]>([]);

  useEffect(() => {
    async function loadData() {
      const token = getClientToken();
      if (!token) return;
      try {
        const [userRes, jobsRes] = await Promise.all([
          apiGet<{ full_name?: string; name?: string }>("/api/client/auth/me", token).catch(() => null),
          apiGet<any>("/api/client/jobs", token).catch(() => [])
        ]);
        
        const nameToUse = userRes?.name || userRes?.full_name;
        if (nameToUse) {
          setUserName(nameToUse.split(" ")[0]);
        }
        
        // Handle jobs array (direct array, { jobs: [...] }, or { data: [...] })
        const jobsArray = Array.isArray(jobsRes)
          ? jobsRes
          : Array.isArray(jobsRes?.jobs)
          ? jobsRes.jobs
          : Array.isArray(jobsRes?.data)
          ? jobsRes.data
          : [];
        setJobs(jobsArray);
        
      } catch (err) {
        console.error("Failed to fetch dashboard data:", err);
      }
    }
    loadData();
  }, []);

  // Compute stats
  const assignedCount = jobs.filter(j => ['queued', 'assigned', 'reviewing'].includes(j.status)).length;
  const appliedCount = jobs.filter(j => j.status === 'applied').length;
  const interviewingCount = jobs.filter(j => j.status === 'interviewing').length;

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div>
        <h1 className="text-2xl font-bold text-zinc-100">
          Welcome back, <span className="text-emerald-400">{userName}</span>
        </h1>
        <p className="mt-1 text-sm text-zinc-400">
          Here&apos;s an overview of your job search progress
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Assigned Jobs", value: assignedCount.toString(), icon: "📋", accent: "from-sky-500/20 to-sky-500/5" },
          { label: "Applied", value: appliedCount.toString(), icon: "🚀", accent: "from-violet-500/20 to-violet-500/5" },
          { label: "Interviewing", value: interviewingCount.toString(), icon: "💬", accent: "from-amber-500/20 to-amber-500/5" },
          { label: "Searches Today", value: "Available", icon: "🔍", accent: "from-emerald-500/20 to-emerald-500/5" },
        ].map((stat) => (
          <div
            key={stat.label}
            className={`rounded-xl border border-zinc-800 bg-gradient-to-br ${stat.accent} p-5`}
          >
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium uppercase tracking-wider text-zinc-400">{stat.label}</p>
              <span className="text-lg">{stat.icon}</span>
            </div>
            <p className="mt-2 text-2xl font-bold text-zinc-100">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Assigned Jobs Section */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-zinc-100">Jobs Assigned to You</h2>
          <Link
            href="/tracker"
            className="text-xs font-medium text-emerald-400 hover:text-emerald-300 transition"
          >
            View all →
          </Link>
        </div>

        <div className="space-y-3">
          {jobs.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-zinc-800 bg-zinc-900/40 px-6 py-10 text-center">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-500">
                No active jobs
              </p>
              <p className="mt-2 text-sm text-zinc-400">
                You haven&apos;t assigned any jobs to JA yet, and no jobs have been pushed to you. Head to search to find opportunities!
              </p>
            </div>
          ) : (
            jobs.slice(0, 5).map((job) => {
              const style = STATUS_STYLES[job.status] || STATUS_STYLES.saved;
              const dateStr = job.created_at || job.assigned_at;
              const displayDate = dateStr ? new Date(dateStr).toLocaleDateString() : 'Recently';

              return (
                <div
                  key={job.id}
                  className="flex items-center justify-between rounded-xl border border-zinc-800 bg-zinc-900/50 px-5 py-4 transition hover:border-zinc-700 hover:bg-zinc-900/80"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3">
                      <h3 className="text-sm font-semibold text-zinc-100 truncate">{job.job_title}</h3>
                      {job.match_score != null && (
                        <span className="shrink-0 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 text-[10px] font-semibold text-emerald-300">
                          {job.match_score}% match
                        </span>
                      )}
                    </div>
                    <p className="mt-0.5 text-xs text-zinc-400">
                      {job.company || "Unknown Company"} · {job.location || "Location not specified"}
                    </p>
                  </div>

                  <div className="ml-4 flex items-center gap-3">
                    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium ${style.bg} ${style.text}`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${style.dot}`} />
                      {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                    </span>
                    <span className="text-[11px] text-zinc-500 hidden sm:inline-block">{displayDate}</span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Link
          href="/search"
          className="group flex items-center gap-4 rounded-xl border border-zinc-800 bg-zinc-900/30 p-5 transition hover:border-emerald-500/30 hover:bg-emerald-500/5"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400 transition group-hover:bg-emerald-500/20">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-semibold text-zinc-100">Search for Jobs</p>
            <p className="text-xs text-zinc-400">Find roles across LinkedIn, Indeed &amp; more</p>
          </div>
        </Link>

        <Link
          href="/profile"
          className="group flex items-center gap-4 rounded-xl border border-zinc-800 bg-zinc-900/30 p-5 transition hover:border-teal-500/30 hover:bg-teal-500/5"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-teal-500/10 text-teal-400 transition group-hover:bg-teal-500/20">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-semibold text-zinc-100">Update Profile</p>
            <p className="text-xs text-zinc-400">Manage your resume &amp; preferences</p>
          </div>
        </Link>
      </div>
    </div>
  );
}

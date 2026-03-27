"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { jaApi } from "../../../lib/jaApi";
import type { DashboardStats, Client } from "../../../types/ja-admin";
import { SkeletonBox, SkeletonText, SkeletonStatCard, SkeletonTableRow } from "../../../components/Skeleton";

export default function JaAdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [clients, setClients] = useState<Client[]>([]);
  const [recentActivities, setRecentActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [statsRes, clientsRes, activityRes] = await Promise.allSettled([
          jaApi.get<DashboardStats>("/dashboard/stats"),
          jaApi.get<{ clients: Client[] }>("/clients"),
          jaApi.get<{ activity: any[] }>("/dashboard/activity?limit=5")
        ]);

        if (statsRes.status === "fulfilled") setStats(statsRes.value);
        else console.error("Failed to load stats:", statsRes.reason);

        if (clientsRes.status === "fulfilled") setClients((clientsRes.value.clients || []).slice(0, 5));
        else console.error("Failed to load clients:", clientsRes.reason);

        if (activityRes.status === "fulfilled") setRecentActivities(activityRes.value.activity || []);
        else console.error("Failed to load activity:", activityRes.reason);
      } catch (err) {
        console.error("Dashboard load error:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const statCards = [
    { label: "Total Clients", value: stats?.totalClients ?? "—", sub: `${stats?.activeClients ?? 0} active`, color: "violet", icon: "👥" },
    { label: "Jobs This Week", value: stats?.totalJobsThisWeek ?? "—", sub: "Across all clients", color: "sky", icon: "📋" },
    { label: "Pending Batch", value: stats?.pendingBatch ?? "—", sub: "Need JA action", color: "amber", icon: "🔄" },
    { label: "Active Clients", value: stats?.activeClients ?? "—", sub: "Portal configured", color: "emerald", icon: "✅" },
  ];

  if (loading) {
    return (
      <div className="space-y-8 animate-in fade-in duration-300">
        <div>
          <SkeletonText className="w-28 h-7" />
          <SkeletonText className="w-72 h-4 mt-2" />
        </div>
        <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
          {Array.from({length: 4}).map((_, i) => <SkeletonStatCard key={i} />)}
        </div>
        <div className="grid gap-6 xl:grid-cols-2">
          <div className="rounded-2xl border border-zinc-800 bg-zinc-950/50 overflow-hidden">
            <div className="px-5 py-4 border-b border-zinc-800">
              <SkeletonText className="w-32 h-4" />
            </div>
            <div className="divide-y divide-zinc-800/50">
              {Array.from({length: 5}).map((_, i) => <SkeletonTableRow key={i} />)}
            </div>
          </div>
          <div className="rounded-2xl border border-zinc-800 bg-zinc-950/50 overflow-hidden">
            <div className="px-5 py-4 border-b border-zinc-800">
              <SkeletonText className="w-32 h-4" />
            </div>
            <div className="divide-y divide-zinc-800/50">
              {Array.from({length: 5}).map((_, i) => (
                <div key={i} className="flex items-center gap-3 px-5 py-3">
                  <SkeletonBox className="h-7 w-7 rounded-lg shrink-0" />
                  <div className="flex-1 space-y-1.5">
                    <SkeletonText className="w-3/4 h-3" />
                    <SkeletonText className="w-1/2 h-2.5" />
                  </div>
                  <SkeletonText className="w-12 h-3 shrink-0" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-zinc-100">Dashboard</h1>
        <p className="mt-1 text-sm text-zinc-400">Overview of all client activity — {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        {statCards.map((s) => (
          <div key={s.label} className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xl">{s.icon}</span>
              <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full
                ${s.color === "violet" ? "bg-violet-500/10 text-violet-400" :
                  s.color === "sky" ? "bg-sky-500/10 text-sky-400" :
                  s.color === "amber" ? "bg-amber-500/10 text-amber-400" :
                  "bg-emerald-500/10 text-emerald-400"}`}>
                {s.label}
              </span>
            </div>
            <div>
              <p className="text-3xl font-bold text-zinc-100">{s.value}</p>
              <p className="text-[11px] text-zinc-500 mt-0.5">{s.sub}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        {/* Client Snapshot */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40">
          <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800">
            <h2 className="text-sm font-bold text-zinc-100">Client Snapshot</h2>
            <Link href="/ja-admin/clients" className="text-[11px] font-semibold text-violet-400 hover:text-violet-300 transition">
              View all →
            </Link>
          </div>
          <div className="divide-y divide-zinc-800">
            {clients.length === 0 ? (
              <div className="px-6 py-8 text-center text-sm text-zinc-500 italic">No clients found.</div>
            ) : clients.slice(0, 5).map((client) => (
              <Link
                key={client.id}
                href={`/ja-admin/clients/${client.id}`}
                className="flex items-center gap-4 px-6 py-4 hover:bg-zinc-800/30 transition"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-violet-500/15 text-sm font-bold text-violet-300">
                  {client.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-zinc-100 truncate">{client.name}</p>
                  <p className="text-[11px] text-zinc-500 truncate">{client.email}</p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider
                    ${client.status === "active" ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" :
                      client.status === "pending" ? "bg-amber-500/10 border-amber-500/20 text-amber-400" :
                      "bg-zinc-500/10 border-zinc-500/20 text-zinc-400"}`}>
                    <span className={`h-1.5 w-1.5 rounded-full
                      ${client.status === "active" ? "bg-emerald-400 animate-pulse" :
                        client.status === "pending" ? "bg-amber-400" : "bg-zinc-500"}`} />
                    {client.status}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40">
          <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800">
            <h2 className="text-sm font-bold text-zinc-100">Recent Activity</h2>
            <span className="text-[10px] text-zinc-500">Today</span>
          </div>
          <div className="px-4 py-3 space-y-1">
            {recentActivities.length === 0 ? (
              <div className="px-6 py-8 text-center text-sm text-zinc-500 italic">No recent activity.</div>
            ) : recentActivities.map((event, i) => (
              <div key={i} className="flex gap-4 rounded-xl px-0 py-2 transition relative group">
                {/* Timeline vertical line */}
                {i < recentActivities.length - 1 && (
                  <div className="absolute left-[20px] top-[24px] bottom-[-8px] w-px bg-zinc-800/80 group-hover:bg-zinc-700 transition-colors" />
                )}
                
                {/* Timeline dot */}
                <div className="relative z-10 flex h-6 w-10 shrink-0 items-center justify-center pt-1.5">
                  <div className={`h-[7px] w-[7px] shrink-0 rounded-full shadow-[0_0_8px_rgba(0,0,0,0.5)] ring-2 ring-zinc-950
                    ${event.color === "violet" ? "bg-violet-400" :
                      event.color === "emerald" ? "bg-emerald-400" :
                      "bg-sky-400"}`} />
                </div>
                
                {/* Content */}
                <div className="flex-1 min-w-0 pb-1">
                  <div className="flex items-center justify-between">
                    <p className="text-[13px] font-bold text-zinc-200">{event.client}</p>
                    <span className="text-[11px] text-zinc-500 font-medium tracking-wide">{event.time}</span>
                  </div>
                  <p className="text-[12px] text-zinc-400 mt-0.5 font-medium">{event.action}</p>
                  <p className="text-[11px] text-zinc-600 mt-1">{event.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import { apiGet } from "../../lib/api";


interface ClientProfile {
  name: string;
  email: string;
  current_title: string;
  target_role: string;
  industry: string;
  preferred_location: string;
  work_type: string;
  linkedin_url: string;
  referral_source: string;
}

export default function ProfilePage() {
  const [user, setUser] = useState<ClientProfile>({
    name: "Client", email: "", current_title: "", target_role: "",
    industry: "", preferred_location: "", work_type: "", linkedin_url: "", referral_source: ""
  });

  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    async function loadUser() {
      try {
        const data = await apiGet<{ full_name?: string; name?: string; email?: string; current_title?: string; target_role?: string; industry?: string; preferred_location?: string; work_type?: string; linkedin_url?: string; referral_source?: string }>("/api/client/auth/me");
        if (data) {
          setUser({
            name: data.full_name || data.name || "Client",
            email: data.email || "",
            current_title: data.current_title || "",
            target_role: data.target_role || "",
            industry: data.industry || "",
            preferred_location: data.preferred_location || "",
            work_type: data.work_type || "",
            linkedin_url: data.linkedin_url || "",
            referral_source: data.referral_source || "",
          });
        }
      } catch (err) {
        console.error("Failed to fetch client profile:", err);
      }
    }
    loadUser();
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    // Placeholder for future update logic.
    setTimeout(() => setIsSaving(false), 1000);
  };

  return (
    <div className="flex flex-col space-y-6 lg:space-y-10 relative overflow-hidden select-none animate-in fade-in duration-700 pb-12">
      {/* Background Aura */}
      <div className="fixed top-[-10%] right-[-10%] w-[80vw] h-[80vw] lg:w-[50vw] lg:h-[50vw] bg-violet-500/5 dark:bg-violet-600/[0.03] blur-[120px] rounded-full pointer-events-none" />
      <div className="fixed bottom-[-10%] left-[-10%] w-[60vw] h-[60vw] lg:w-[40vw] lg:h-[40vw] bg-emerald-500/5 dark:bg-emerald-600/[0.03] blur-[120px] rounded-full pointer-events-none" />

      <div className="relative z-10">
        <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white tracking-tight leading-none mb-2">Command Profile</h1>
        <p className="text-[11px] sm:text-xs font-medium text-slate-500 dark:text-zinc-500 uppercase tracking-widest">Manage your career trajectory and preferences</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 relative z-10">
        {/* Left Column: Personal Identity */}
        <div className="lg:col-span-4 flex flex-col space-y-6">
          {/* Identity Card */}
          <div className="bg-white/70 dark:bg-zinc-900/40 backdrop-blur-3xl border border-slate-300/60 dark:border-zinc-800/60 rounded-[2rem] p-8 shadow-xl dark:shadow-2xl flex flex-col items-center text-center">
            <div className="relative group mb-6">
              <div className="absolute inset-0 bg-emerald-500/20 blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
              <div className="relative h-24 w-24 flex items-center justify-center rounded-[2rem] bg-gradient-to-br from-emerald-400 to-teal-500 text-3xl font-black text-white shadow-2xl group-hover:scale-105 transition-transform duration-500">
                {user.name.charAt(0)}
              </div>
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-zinc-100 mb-1">{user.name}</h2>
            <p className="text-[11px] font-medium text-slate-500 dark:text-zinc-500 uppercase tracking-widest mb-6">{user.email}</p>
            
            <div className="w-full pt-6 border-t border-slate-200/50 dark:border-zinc-800/50 flex flex-col gap-3">
              <div className="flex justify-between items-center text-[10px] uppercase tracking-widest font-bold">
                 <span className="text-slate-400 dark:text-zinc-600">Access Level</span>
                 <span className="text-emerald-500">Active Client</span>
              </div>
              <div className="flex justify-between items-center text-[10px] uppercase tracking-widest font-bold">
                 <span className="text-slate-400 dark:text-zinc-600">Member Since</span>
                 <span className="text-slate-900 dark:text-white">2026</span>
              </div>
            </div>
          </div>

          {/* Resume Panel */}
          <div className="bg-white/70 dark:bg-zinc-900/40 backdrop-blur-3xl border border-slate-300/60 dark:border-zinc-800/60 rounded-[2rem] p-8 shadow-xl dark:shadow-2xl">
            <div className="flex items-center gap-3 mb-6">
               <div className="w-1.5 h-1.5 rounded-full bg-violet-500" />
               <h3 className="text-[10px] font-bold uppercase tracking-[0.25em] text-slate-900 dark:text-white">Master Resume</h3>
            </div>
            <div className="rounded-[1.5rem] border border-dashed border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-950/40 px-6 py-10 text-center group cursor-help">
              <svg className="mx-auto h-10 w-10 text-slate-300 dark:text-zinc-700 mb-4 transition-colors group-hover:text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="text-[11px] font-bold text-slate-400 dark:text-zinc-600 uppercase tracking-widest leading-relaxed">System-Anchored Resume</p>
              <p className="mt-2 text-[10px] text-slate-400 dark:text-zinc-700 font-medium italic">Verified by your JA Consultant</p>
            </div>
          </div>
        </div>

        {/* Right Column: Preferences Form */}
        <div className="lg:col-span-8 bg-white/70 dark:bg-zinc-900/40 backdrop-blur-3xl border border-slate-300/60 dark:border-zinc-800/60 rounded-[2.5rem] p-8 sm:p-10 shadow-xl dark:shadow-2xl">
           <div className="flex items-center justify-between mb-10">
              <div className="flex items-center gap-3">
                 <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                 <h3 className="text-[10px] font-bold uppercase tracking-[0.25em] text-slate-900 dark:text-white">Job Search Engine Configuration</h3>
              </div>
           </div>

           <div className="grid gap-6 sm:grid-cols-2">
              {[
                { label: "Current Professional Title", key: "current_title", placeholder: "e.g., Software Architect" },
                { label: "Target Future Role", key: "target_role", placeholder: "e.g., VP of Engineering" },
                { label: "Industry Focus", key: "industry", placeholder: "e.g., Fintech, AI, Web3" },
                { label: "Preferred Metro Area", key: "preferred_location", placeholder: "e.g., San Francisco, CA" },
              ].map((field) => (
                <div key={field.key} className="space-y-2">
                  <label className="block text-[10px] font-black uppercase tracking-[0.18em] text-slate-400 dark:text-zinc-600">{field.label}</label>
                  <input
                    type="text"
                    value={user[field.key as keyof ClientProfile]}
                    onChange={(e) => setUser({ ...user, [field.key]: e.target.value })}
                    placeholder={field.placeholder}
                    className="w-full h-12 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950/60 px-5 text-[13px] text-slate-900 dark:text-zinc-100 outline-none transition placeholder:text-slate-300 dark:placeholder:text-zinc-700 focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/10"
                  />
                </div>
              ))}

              <div className="space-y-2">
                <label className="block text-[10px] font-black uppercase tracking-[0.18em] text-slate-400 dark:text-zinc-600">Work Model Preference</label>
                <select
                  value={user.work_type}
                  onChange={(e) => setUser({ ...user, work_type: e.target.value })}
                  className="w-full h-12 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950/60 px-5 text-[13px] text-slate-900 dark:text-zinc-100 outline-none transition focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/10 appearance-none"
                >
                  <option value="">Universal Search</option>
                  <option value="remote">Fully Remote</option>
                  <option value="hybrid">Hybrid Only</option>
                  <option value="onsite">On-site Dedicated</option>
                </select>
              </div>
              
              <div className="space-y-2">
                <label className="block text-[10px] font-black uppercase tracking-[0.18em] text-slate-400 dark:text-zinc-600">Professional LinkedIn Network</label>
                <div className="relative group">
                  <input
                    type="url"
                    value={user.linkedin_url}
                    onChange={(e) => setUser({ ...user, linkedin_url: e.target.value })}
                    placeholder="https://linkedin.com/in/..."
                    className="w-full h-12 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950/60 px-5 pr-12 text-[13px] text-slate-900 dark:text-zinc-100 outline-none transition placeholder:text-slate-300 dark:placeholder:text-zinc-700 focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/10"
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-zinc-700">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
                  </div>
                </div>
              </div>
           </div>

           <div className="mt-12 pt-10 border-t border-slate-200/50 dark:border-zinc-800/50 flex flex-col sm:flex-row items-center justify-between gap-6">
              <p className="text-[10px] text-slate-400 dark:text-zinc-600 font-medium italic text-center sm:text-left">Changes will synchronize across your Search and Dashboard engines instantly.</p>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="w-full sm:w-auto h-14 min-w-[220px] rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-black text-[11px] font-black uppercase tracking-[0.25em] shadow-2xl transition hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
              >
                {isSaving ? (
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                ) : (
                  <>
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                    Commit Changes
                  </>
                )}
              </button>
           </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import { apiGet } from "../../lib/api";
import { getClientToken } from "../../lib/clientAuth";

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
      const token = getClientToken();
      if (!token) return;
      try {
        const data = await apiGet<any>("/api/client/auth/me", token);
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
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-zinc-100">Profile</h1>
        <p className="mt-1 text-sm text-zinc-400">
          Manage your account and preferences
        </p>
      </div>

      {/* Profile Card */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 text-lg font-bold text-white uppercase">
            {user.name.charAt(0)}
          </div>
          <div>
            <h2 className="text-lg font-semibold text-zinc-100">{user.name}</h2>
            <p className="text-sm text-zinc-400">{user.email}</p>
          </div>
        </div>
      </div>

      {/* Preferences Section */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
        <h3 className="text-sm font-semibold text-zinc-200 mb-4">Job Profile & Preferences</h3>
        
        <div className="grid gap-4 md:grid-cols-2">
          {/* Current Title */}
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-zinc-400">Current Title</label>
            <input
              type="text"
              value={user.current_title}
              onChange={(e) => setUser({ ...user, current_title: e.target.value })}
              placeholder="e.g., Software Engineer"
              className="w-full rounded-lg border border-zinc-700 bg-zinc-800/50 px-4 py-2.5 text-sm text-zinc-100 outline-none transition placeholder:text-zinc-600 focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>

          {/* Target Role */}
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-zinc-400">Target Role</label>
            <input
              type="text"
              value={user.target_role}
              onChange={(e) => setUser({ ...user, target_role: e.target.value })}
              placeholder="e.g., Senior Frontend Engineer"
              className="w-full rounded-lg border border-zinc-700 bg-zinc-800/50 px-4 py-2.5 text-sm text-zinc-100 outline-none transition placeholder:text-zinc-600 focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>

          {/* Industry */}
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-zinc-400">Industry</label>
            <input
              type="text"
              value={user.industry}
              onChange={(e) => setUser({ ...user, industry: e.target.value })}
              placeholder="e.g., Tech, Finance"
              className="w-full rounded-lg border border-zinc-700 bg-zinc-800/50 px-4 py-2.5 text-sm text-zinc-100 outline-none transition placeholder:text-zinc-600 focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>

          {/* Preferred Location */}
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-zinc-400">Preferred Location</label>
            <input
              type="text"
              value={user.preferred_location}
              onChange={(e) => setUser({ ...user, preferred_location: e.target.value })}
              placeholder="e.g., New York, NY"
              className="w-full rounded-lg border border-zinc-700 bg-zinc-800/50 px-4 py-2.5 text-sm text-zinc-100 outline-none transition placeholder:text-zinc-600 focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>

          {/* Work Type */}
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-zinc-400">Work Type</label>
            <select
              value={user.work_type}
              onChange={(e) => setUser({ ...user, work_type: e.target.value })}
              className="w-full rounded-lg border border-zinc-700 bg-zinc-800/50 px-4 py-2.5 text-sm text-zinc-100 outline-none transition focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20"
            >
              <option value="">Any</option>
              <option value="remote">Remote</option>
              <option value="hybrid">Hybrid</option>
              <option value="onsite">On-site</option>
            </select>
          </div>
          
          {/* LinkedIn URL */}
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-zinc-400">LinkedIn Profile</label>
            <input
              type="url"
              value={user.linkedin_url}
              onChange={(e) => setUser({ ...user, linkedin_url: e.target.value })}
              placeholder="https://linkedin.com/in/username"
              className="w-full rounded-lg border border-zinc-700 bg-zinc-800/50 px-4 py-2.5 text-sm text-zinc-100 outline-none transition placeholder:text-zinc-600 focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={isSaving}
          className="mt-6 rounded-lg bg-emerald-500/10 border border-emerald-500/20 px-5 py-2 text-xs font-semibold text-emerald-300 transition hover:bg-emerald-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSaving ? "Saving..." : "Save Preferences"}
        </button>
      </div>

      {/* Resume Section */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
        <h3 className="text-sm font-semibold text-zinc-200 mb-4">Resume</h3>
        <div className="rounded-lg border border-dashed border-zinc-700 bg-zinc-800/30 px-6 py-10 text-center">
          <svg className="mx-auto h-8 w-8 text-zinc-500 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p className="text-sm text-zinc-400">No resume uploaded</p>
          <p className="mt-1 text-xs text-zinc-500">Your TheJobHelpers representative will upload your resume</p>
        </div>
      </div>
    </div>
  );
}

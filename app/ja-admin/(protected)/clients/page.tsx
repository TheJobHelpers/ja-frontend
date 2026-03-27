"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { jaApi } from "../../../lib/jaApi";
import type { Client, PortalAccess } from "../../../types/ja-admin";
import { SkeletonBox, SkeletonText, SkeletonStatCard, SkeletonTableRow } from "../../../components/Skeleton";

// ─── Portal Access Badge ──────────────────────────────────────
const ACCESS_STYLES: Record<PortalAccess, { badge: string; dot: string; label: string }> = {
  configured: { badge: "bg-emerald-500/10 border-emerald-500/20 text-emerald-300", dot: "bg-emerald-400 animate-pulse", label: "Portal Active" },
  invited:    { badge: "bg-amber-500/10 border-amber-500/20 text-amber-300",   dot: "bg-amber-400", label: "Invite Sent" },
  never_set:  { badge: "bg-zinc-500/10 border-zinc-500/20 text-zinc-400",      dot: "bg-zinc-500",  label: "No Access" },
};

const STATUS_STYLES: Record<string, string> = {
  active:    "bg-emerald-500/10 border-emerald-500/20 text-emerald-400",
  pending:   "bg-amber-500/10 border-amber-500/20 text-amber-400",
  inactive:  "bg-zinc-500/10 border-zinc-500/20 text-zinc-400",
  suspended: "bg-red-500/10 border-red-500/20 text-red-400",
};

// ─── View Credentials Modal ────────────────────────────────────
function ViewCredentialsModal({ client, onClose }: { client: Client; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4 animate-in fade-in duration-150">
      <div className="w-full max-w-sm rounded-2xl border border-zinc-800 bg-zinc-950 p-6 shadow-2xl animate-in zoom-in-95 duration-150">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h3 className="text-sm font-bold text-zinc-100">Portal Credentials</h3>
            <p className="text-[11px] text-zinc-500 mt-0.5">{client.name}</p>
          </div>
          <button onClick={onClose} className="text-zinc-500 hover:text-zinc-300 transition p-1">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        <div className="space-y-3">
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 px-4 py-3">
            <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-zinc-500 mb-1.5">Username / Email</p>
            <div className="flex items-center justify-between gap-2">
              <code className="text-sm font-mono text-zinc-100">{client.email}</code>
              <button onClick={() => navigator.clipboard.writeText(client.email)} className="shrink-0 rounded-lg border border-zinc-700 bg-zinc-800 px-2 py-1 text-[10px] font-bold text-zinc-400 hover:text-zinc-200 transition">Copy</button>
            </div>
          </div>
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 px-4 py-3">
            <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-zinc-500 mb-1.5">Password</p>
            <p className="text-sm font-mono text-zinc-400 italic">Password is hashed — use Reset Password to issue a new one.</p>
          </div>
          {client.last_login && (
            <p className="text-[10px] text-zinc-600 text-center">
              Last login: {new Date(client.last_login).toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
            </p>
          )}
        </div>
        <button onClick={onClose} className="mt-5 w-full rounded-xl border border-zinc-800 bg-zinc-900/50 py-2.5 text-xs font-semibold text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition">Close</button>
      </div>
    </div>
  );
}

// ─── Set Password Modal ───────────────────────────────────────
function SetPasswordModal({ client, onClose, onSave }: { client: Client; onClose: () => void; onSave: (id: string) => void; }) {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) { setError("Must be at least 6 characters"); return; }
    if (password !== confirm) { setError("Passwords do not match"); return; }
    setSaving(true);
    try {
      await jaApi.patch(`/clients/${client.id}`, { password });
      onSave(client.id);
      setSuccess(true);
      setTimeout(onClose, 1200);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to set password");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4 animate-in fade-in duration-150">
      <div className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-950 p-6 shadow-2xl animate-in zoom-in-95 duration-150">
        <div className="flex items-start justify-between mb-5">
          <div>
            <h3 className="text-sm font-bold text-zinc-100">Set Portal Password</h3>
            <p className="text-[11px] text-zinc-500 mt-0.5">For: {client.name} · {client.email}</p>
          </div>
          <button onClick={onClose} className="text-zinc-500 hover:text-zinc-300 transition p-1">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        {success ? (
          <div className="flex flex-col items-center gap-2 py-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/15">
              <svg className="h-5 w-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
            </div>
            <p className="text-sm font-semibold text-emerald-300">Password set successfully</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {[
              { key: "password", label: "New Password", value: password, set: setPassword },
              { key: "confirm",  label: "Confirm Password", value: confirm, set: setConfirm },
            ].map((f) => (
              <div key={f.key} className="space-y-1.5 group relative">
                <label className="block text-[11px] font-semibold uppercase tracking-[0.15em] text-zinc-400 group-focus-within:text-violet-400 transition-colors">{f.label}</label>
                <div className="relative">
                  <input type={showPassword ? "text" : "password"} required value={f.value} onChange={(e) => f.set(e.target.value)} className="w-full rounded-xl border border-white/5 bg-zinc-900/50 px-4 py-2.5 text-sm text-zinc-50 placeholder-zinc-600 outline-none transition hover:bg-zinc-900/80 focus:border-violet-500/40 focus:bg-zinc-900/80 focus:ring-1 focus:ring-violet-500/20" />
                  {f.value.length > 0 && (
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md bg-zinc-800 px-2 py-0.5 text-[10px] font-bold text-zinc-400 hover:text-zinc-200 transition">{showPassword ? "Hide" : "Show"}</button>
                  )}
                </div>
              </div>
            ))}
            {error && <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">{error}</p>}
            <div className="flex gap-3 pt-1">
              <button type="button" onClick={onClose} className="flex-1 rounded-xl border border-zinc-700 bg-zinc-800/50 py-2.5 text-xs font-semibold text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition">Cancel</button>
              <button type="submit" disabled={saving} className="flex-1 rounded-xl bg-gradient-to-r from-violet-500 to-purple-600 py-2.5 text-xs font-bold text-white shadow-lg shadow-violet-500/20 hover:from-violet-400 hover:to-purple-500 transition disabled:opacity-60">{saving ? "Setting..." : "Set Password"}</button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

// ─── Delete Confirm Modal ─────────────────────────────────────
function DeleteConfirmModal({ client, onClose, onDeleted }: { client: Client; onClose: () => void; onDeleted: (id: string) => void }) {
  const [confirming, setConfirming] = useState(false);
  const [input, setInput]           = useState("");
  const [error, setError]           = useState("");

  const handleDelete = async () => {
    if (input.trim().toLowerCase() !== client.name.trim().toLowerCase()) {
      setError("Name doesn't match. Please type the client name exactly.");
      return;
    }
    setConfirming(true);
    try {
      await jaApi.delete(`/clients/${client.id}`);
      onDeleted(client.id);
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to delete client");
    } finally {
      setConfirming(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm px-4 animate-in fade-in duration-150">
      <div className="w-full max-w-md rounded-2xl border border-red-500/20 bg-zinc-950 p-6 shadow-2xl animate-in zoom-in-95 duration-150">
        <div className="mb-5 flex items-center gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-red-500/10 border border-red-500/20">
            <svg className="h-6 w-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Delete Account</h3>
            <p className="text-xs text-zinc-500 mt-0.5">This action is permanent and cannot be undone.</p>
          </div>
        </div>

        <div className="rounded-xl bg-red-500/5 border border-red-500/15 px-4 py-3 mb-5 text-xs text-red-300 leading-relaxed">
          Deleting <strong className="text-red-200">{client.name}</strong> will permanently remove their account, all associated jobs, portal access, and search history.
        </div>

        <div className="space-y-2 mb-5">
          <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-500">
            Type <span className="text-zinc-200 font-mono">{client.name}</span> to confirm
          </label>
          <input
            type="text"
            value={input}
            onChange={e => { setInput(e.target.value); setError(""); }}
            placeholder={client.name}
            className="w-full rounded-xl border border-zinc-800 bg-zinc-900/60 px-4 py-2.5 text-sm text-zinc-100 placeholder-zinc-700 outline-none focus:border-red-500/40 focus:ring-1 focus:ring-red-500/20 transition"
          />
          {error && <p className="text-xs text-red-400">{error}</p>}
        </div>

        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 rounded-xl border border-zinc-800 bg-zinc-900 py-2.5 text-xs font-bold text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition">Cancel</button>
          <button
            onClick={handleDelete}
            disabled={confirming || input.trim().toLowerCase() !== client.name.trim().toLowerCase()}
            className="flex-1 rounded-xl bg-red-600 hover:bg-red-500 disabled:opacity-40 disabled:cursor-not-allowed py-2.5 text-xs font-bold text-white transition"
          >
            {confirming ? "Deleting..." : "Delete Account"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Create Client Modal ──────────────────────────────────────
function CreateClientModal({ onClose, onAdd }: { onClose: () => void; onAdd: (c: Client) => void }) {
  const [form, setForm] = useState({
    name: "", email: "", phone: "", notes: "", password: "",
    current_title: "", industry: "", target_role: "",
    preferred_location: "", work_type: "", linkedin_url: "", referral_source: "",
  });
  const [saving, setSaving]           = useState(false);
  const [error, setError]             = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showExtra, setShowExtra]     = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const payload: Record<string, string | undefined> = {
        name: form.name, email: form.email,
        phone: form.phone || undefined, notes: form.notes || undefined, password: form.password || undefined,
        current_title: form.current_title || undefined, industry: form.industry || undefined,
        target_role: form.target_role || undefined, preferred_location: form.preferred_location || undefined,
        work_type: form.work_type || undefined, linkedin_url: form.linkedin_url || undefined,
        referral_source: form.referral_source || undefined,
      };
      const newClient = await jaApi.post<Client>("/clients", payload);
      onAdd(newClient);
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to create client");
    } finally {
      setSaving(false);
    }
  };

  const filledExtraCount = [form.current_title, form.industry, form.target_role, form.preferred_location, form.work_type, form.linkedin_url, form.referral_source].filter(Boolean).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4 animate-in fade-in duration-150">
      <div className="w-full max-w-lg rounded-2xl border border-zinc-800 bg-zinc-950 p-6 shadow-2xl animate-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-base font-bold text-zinc-100">Create New Client</h3>
          <button onClick={onClose} className="text-zinc-500 hover:text-zinc-300 transition">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            {[
              { key: "name",     label: "Full Name",     placeholder: "John Doe",       type: "text",     full: true,  required: true  },
              { key: "email",    label: "Email",         placeholder: "john@email.com", type: "email",    full: true,  required: true  },
              { key: "phone",    label: "Phone",         placeholder: "+1 415 555 0100",type: "text",     full: false, required: false },
              { key: "password", label: "Temp Password", placeholder: "TJH@2026!",      type: showPassword ? "text" : "password", full: false, required: false },
            ].map((f) => (
              <div key={f.key} className={`space-y-1.5 ${f.full ? "col-span-2" : "col-span-1"} group relative`}>
                <label className="block text-[11px] font-semibold uppercase tracking-[0.12em] text-zinc-400 group-focus-within:text-violet-400 transition-colors">
                  {f.label}{f.required && <span className="text-red-400 ml-0.5">*</span>}
                </label>
                <div className="relative">
                  <input type={f.type} required={f.required} placeholder={f.placeholder} value={(form as Record<string, string>)[f.key]} onChange={(e) => setForm((p) => ({ ...p, [f.key]: e.target.value }))} className="w-full rounded-xl border border-white/5 bg-zinc-900/50 px-3 py-2.5 text-sm text-zinc-50 placeholder-zinc-600 outline-none transition hover:bg-zinc-900/80 focus:border-violet-500/40 focus:bg-zinc-900/80 focus:ring-1 focus:ring-violet-500/20" />
                  {f.key === "password" && form.password.length > 0 && (
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-md bg-zinc-800 px-2 py-0.5 text-[10px] font-bold text-zinc-400 hover:text-zinc-200 transition">{showPassword ? "Hide" : "Show"}</button>
                  )}
                </div>
              </div>
            ))}
          </div>
          <div className="space-y-1.5 group">
            <label className="block text-[11px] font-semibold uppercase tracking-[0.12em] text-zinc-400 group-focus-within:text-violet-400 transition-colors">Internal Notes</label>
            <textarea value={form.notes} onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))} placeholder="Background, target roles, special requirements..." rows={2} className="w-full rounded-xl border border-white/5 bg-zinc-900/50 px-3 py-2.5 text-sm text-zinc-50 placeholder-zinc-600 outline-none resize-none transition hover:bg-zinc-900/80 focus:border-violet-500/40 focus:bg-zinc-900/80" />
          </div>
          <p className="text-[10px] text-zinc-600">Setting a temp password will mark portal as &ldquo;Invite Sent&rdquo;. Leave blank to configure later.</p>
          <button type="button" onClick={() => setShowExtra(!showExtra)} className="w-full flex items-center justify-between rounded-xl border border-dashed border-zinc-700 bg-zinc-900/30 px-4 py-2.5 text-xs font-semibold text-zinc-400 hover:text-violet-400 hover:border-violet-500/40 hover:bg-violet-500/5 transition">
            <span className="flex items-center gap-2">
              <svg className={`h-4 w-4 transition-transform duration-200 ${showExtra ? "rotate-90" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
              {showExtra ? "Hide Additional Info" : "Add Additional Info"}
            </span>
            {filledExtraCount > 0 && !showExtra && <span className="rounded-full bg-violet-500/20 border border-violet-500/30 px-2 py-0.5 text-[9px] font-bold text-violet-400">{filledExtraCount} added</span>}
          </button>
          {showExtra && (
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/20 p-4 space-y-3 animate-in slide-in-from-top-2 duration-200">
              <div className="grid grid-cols-2 gap-3">
                {[
                  { key: "current_title", label: "Current / Last Title", placeholder: "e.g. Senior Frontend Dev" },
                  { key: "industry",      label: "Industry",             placeholder: "e.g. Tech, Finance" },
                  { key: "target_role",   label: "Target Role",          placeholder: "e.g. Full-Stack Engineer" },
                  { key: "preferred_location", label: "Preferred Location", placeholder: "e.g. New York, Remote" },
                ].map((f) => (
                  <div key={f.key} className="space-y-1.5 group">
                    <label className="block text-[10px] font-semibold uppercase tracking-[0.1em] text-zinc-500 group-focus-within:text-violet-400 transition-colors">{f.label}</label>
                    <input type="text" placeholder={f.placeholder} value={(form as Record<string, string>)[f.key]} onChange={(e) => setForm((p) => ({ ...p, [f.key]: e.target.value }))} className="w-full rounded-lg border border-white/5 bg-zinc-900/60 px-3 py-2 text-[13px] text-zinc-50 placeholder-zinc-600 outline-none transition focus:border-violet-500/40 focus:ring-1 focus:ring-violet-500/20" />
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                {[{ value: "remote", label: "Remote", icon: "🏠" }, { value: "hybrid", label: "Hybrid", icon: "🔄" }, { value: "onsite", label: "On-site", icon: "🏢" }, { value: "any", label: "Any", icon: "✨" }].map((opt) => (
                  <button key={opt.value} type="button" onClick={() => setForm((p) => ({ ...p, work_type: p.work_type === opt.value ? "" : opt.value }))} className={`flex-1 rounded-lg border px-2 py-2 text-[11px] font-semibold transition ${form.work_type === opt.value ? "bg-violet-500/15 border-violet-500/40 text-violet-300" : "border-zinc-700/50 text-zinc-500 hover:border-zinc-600 hover:text-zinc-300"}`}>
                    <span className="block text-sm mb-0.5">{opt.icon}</span>{opt.label}
                  </button>
                ))}
              </div>
            </div>
          )}
          {error && <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">{error}</p>}
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} className="flex-1 rounded-xl border border-zinc-700 bg-zinc-800/50 py-2.5 text-xs font-semibold text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition">Cancel</button>
            <button type="submit" disabled={saving} className="flex-1 rounded-xl bg-gradient-to-r from-violet-500 to-purple-600 py-2.5 text-xs font-bold text-white shadow-lg shadow-violet-500/20 hover:from-violet-400 hover:to-purple-500 transition disabled:opacity-60">{saving ? "Creating..." : "Create Account"}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Notes Modal ─────────────────────────────────────────────
function NotesModal({ client, onClose, onSave }: { client: Client; onClose: () => void; onSave: (id: string, notes: string) => void }) {
  const [notes, setNotes] = useState(client.notes || "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      await jaApi.patch(`/clients/${client.id}`, { notes });
      onSave(client.id, notes);
      setSuccess(true);
      setTimeout(onClose, 1000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to save notes");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4 animate-in fade-in duration-150">
      <div className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-950 p-6 shadow-2xl animate-in zoom-in-95 duration-150">
        <div className="flex items-start justify-between mb-5">
          <div>
            <h3 className="text-sm font-bold text-zinc-100">Internal Notes</h3>
            <p className="text-[11px] text-zinc-500 mt-0.5">{client.name} · {client.email}</p>
          </div>
          <button onClick={onClose} className="text-zinc-500 hover:text-zinc-300 transition p-1">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        {success ? (
          <div className="flex flex-col items-center gap-2 py-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/15">
              <svg className="h-5 w-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
            </div>
            <p className="text-sm font-semibold text-emerald-300">Notes saved</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5 group">
              <label className="block text-[11px] font-semibold uppercase tracking-[0.15em] text-zinc-400 group-focus-within:text-violet-400 transition-colors">Notes</label>
              <textarea
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="Background, target roles, special requirements, or any other context..."
                rows={6}
                className="w-full rounded-xl border border-white/5 bg-zinc-900/50 px-4 py-2.5 text-sm text-zinc-50 placeholder-zinc-600 outline-none resize-none transition hover:bg-zinc-900/80 focus:border-violet-500/40 focus:bg-zinc-900/80 focus:ring-1 focus:ring-violet-500/20"
              />
            </div>
            {error && <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">{error}</p>}
            <div className="flex gap-3 pt-1">
              <button type="button" onClick={onClose} className="flex-1 rounded-xl border border-zinc-700 bg-zinc-800/50 py-2.5 text-xs font-semibold text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition">Cancel</button>
              <button type="submit" disabled={saving} className="flex-1 rounded-xl bg-gradient-to-r from-violet-500 to-purple-600 py-2.5 text-xs font-bold text-white shadow-lg shadow-violet-500/20 hover:from-violet-400 hover:to-purple-500 transition disabled:opacity-60">
                {saving ? "Saving..." : "Save Notes"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────
export default function ClientsPage() {
  const [clients, setClients]             = useState<Client[]>([]);
  const [loading, setLoading]             = useState(true);
  const [search, setSearch]               = useState("");
  const [statusFilter, setStatusFilter]   = useState<"all" | "active" | "pending" | "inactive" | "suspended">("all");
  const [showCreate, setShowCreate]       = useState(false);
  const [passwordModal, setPasswordModal] = useState<Client | null>(null);
  const [credentialsModal, setCredentialsModal] = useState<Client | null>(null);
  const [deleteModal, setDeleteModal]     = useState<Client | null>(null);
  const [inviteSent, setInviteSent]       = useState<string | null>(null);
  const [expandedId, setExpandedId]       = useState<string | null>(null);
  const [notesModal, setNotesModal]       = useState<Client | null>(null);

  useEffect(() => {
    jaApi.get<{ clients: Client[] }>("/clients")
      .then(d => setClients(d.clients || []))
      .catch(e => console.error(e))
      .finally(() => setLoading(false));
  }, []);

  const filtered = clients.filter((c) => {
    const s = (c.name + c.email).toLowerCase();
    const matchSearch = s.includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || c.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const handleSetPassword = () => {
    jaApi.get<{ clients: Client[] }>("/clients").then(d => setClients(d.clients || [])).catch(() => {});
  };

  const handleSendInvite = async (id: string) => {
    try {
      await jaApi.post(`/clients/${id}`, {});
      setInviteSent(id);
      setTimeout(() => setInviteSent(null), 2500);
    } catch (err) { console.error(err); }
  };

  const handleToggleSuspend = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === "suspended" ? "active" : "suspended";
    try {
      await jaApi.patch(`/clients/${id}`, { status: newStatus });
      setClients(prev => prev.map(c => c.id === id ? { ...c, status: newStatus as Client["status"] } : c));
    } catch (err) { console.error(err); }
  };

  const handleDeleted = (id: string) => setClients(prev => prev.filter(c => c.id !== id));

  if (loading) {
    return (
      <div className="space-y-6 animate-in fade-in duration-300">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <SkeletonText className="w-44 h-7" />
            <SkeletonText className="w-56 h-4" />
          </div>
          <SkeletonBox className="h-9 w-32 rounded-xl" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({length: 4}).map((_, i) => <SkeletonStatCard key={i} />)}
        </div>
        {/* Search bar skeleton */}
        <SkeletonBox className="h-10 w-full rounded-xl" />
        {/* Table skeleton */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-950/50 overflow-hidden">
          <div className="px-5 py-3 border-b border-zinc-800 flex items-center gap-4">
            <SkeletonText className="w-20 h-3" />
            <SkeletonText className="w-32 h-3" />
            <SkeletonText className="w-20 h-3" />
          </div>
          <div className="divide-y divide-zinc-800/40">
            {Array.from({length: 6}).map((_, i) => <SkeletonTableRow key={i} />)}
          </div>
        </div>
      </div>
    );
  }

  const stats = [
    { label: "Active", value: clients.filter(c => c.status === "active").length, color: "emerald", icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" },
    { label: "Portal Active", value: clients.filter(c => c.portal_access === "configured").length, color: "violet", icon: "M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804" },
    { label: "Invite Sent", value: clients.filter(c => c.portal_access === "invited").length, color: "amber", icon: "M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" },
    { label: "Suspended", value: clients.filter(c => c.status === "suspended").length, color: "red", icon: "M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" },
  ];

  return (
    <div className="space-y-6">
      {showCreate    && <CreateClientModal    onClose={() => setShowCreate(false)}    onAdd={(c) => setClients(p => [c, ...p])} />}
      {passwordModal && <SetPasswordModal     client={passwordModal}                  onClose={() => setPasswordModal(null)}    onSave={handleSetPassword} />}
      {credentialsModal && <ViewCredentialsModal client={credentialsModal}            onClose={() => setCredentialsModal(null)} />}
      {deleteModal   && <DeleteConfirmModal   client={deleteModal}                    onClose={() => setDeleteModal(null)}      onDeleted={handleDeleted} />}
      {notesModal    && <NotesModal           client={notesModal}                     onClose={() => setNotesModal(null)}       onSave={(id, notes) => setClients(prev => prev.map(c => c.id === id ? { ...c, notes } : c))} />}

      {/* Header */}
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100 flex items-center gap-3">
            Client Accounts
            <span className="text-xs font-normal text-zinc-500 bg-zinc-800/80 px-2.5 py-1 rounded-full border border-zinc-700/50">{clients.length} total</span>
          </h1>
          <p className="text-sm text-zinc-500 mt-1">Manage client portal accounts and access credentials</p>
        </div>
        <button onClick={() => setShowCreate(true)} className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-500 to-purple-600 px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-violet-500/20 hover:from-violet-400 hover:to-purple-500 transition">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
          Create Account
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {stats.map(s => (
          <div key={s.label} className={`rounded-2xl border bg-zinc-900/40 px-5 py-4 flex items-center gap-3 border-zinc-800 hover:border-zinc-700 transition`}>
            <div className={`h-9 w-9 shrink-0 rounded-xl flex items-center justify-center bg-${s.color}-500/10 border border-${s.color}-500/20`}>
              <svg className={`h-4 w-4 text-${s.color}-400`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d={s.icon} /></svg>
            </div>
            <div>
              <p className="text-xl font-black text-zinc-100">{s.value}</p>
              <p className="text-[10px] text-zinc-500 font-medium">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-48">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" /></svg>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name or email..." className="w-full rounded-xl border border-zinc-800 bg-zinc-900/80 pl-10 pr-4 py-2.5 text-sm text-zinc-50 placeholder-zinc-600 outline-none focus:border-violet-500/40 transition" />
        </div>
        <div className="flex gap-1 rounded-xl bg-zinc-900/50 border border-zinc-800 p-1">
          {(["all", "active", "pending", "inactive", "suspended"] as const).map(s => (
            <button key={s} onClick={() => setStatusFilter(s)} className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${statusFilter === s ? "bg-violet-600 text-white shadow-lg shadow-violet-500/20" : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800"}`}>
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Client Cards */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/30 py-16 text-center">
            <svg className="h-10 w-10 mx-auto text-zinc-700 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            <p className="text-sm text-zinc-500">No clients found.</p>
          </div>
        ) : filtered.map((client) => {
          const access       = ACCESS_STYLES[client.portal_access];
          const statusStyle  = STATUS_STYLES[client.status] || STATUS_STYLES.inactive;
          const isSuspended  = client.status === "suspended";
          const isExpanded   = expandedId === client.id;

          return (
            <div key={client.id} className={`rounded-2xl border transition-all duration-200 overflow-hidden ${isSuspended ? "border-red-500/15 bg-red-500/5" : "border-zinc-800 bg-zinc-900/40 hover:border-zinc-700"}`}>
              {/* Main row */}
              <div className="p-5">
                <div className="flex items-center gap-4">
                  {/* Avatar */}
                  <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-base font-black shadow-inner ${isSuspended ? "bg-red-500/10 text-red-400" : "bg-gradient-to-br from-violet-500/20 to-purple-500/10 text-violet-300"}`}>
                    {client.name.charAt(0).toUpperCase()}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <h2 className="text-sm font-bold text-zinc-100">{client.name}</h2>
                      <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ${statusStyle}`}>
                        {client.status}
                      </span>
                      <span className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[9px] font-bold ${access.badge}`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${access.dot}`} />
                        {access.label}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-400 truncate">{client.email}{client.phone ? ` · ${client.phone}` : ""}</p>
                    {client.notes && <p className="mt-0.5 text-[11px] text-zinc-600 italic truncate max-w-lg">{client.notes}</p>}
                  </div>

                  {/* Right: last login + expand */}
                  <div className="shrink-0 flex items-center gap-4">
                    <div className="text-right hidden sm:block">
                      {client.last_login ? (
                        <>
                          <p className="text-[10px] font-semibold text-zinc-400">Last login</p>
                          <p className="text-[10px] text-zinc-500">{new Date(client.last_login).toLocaleDateString("en-US", { month: "short", day: "numeric" })} {new Date(client.last_login).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}</p>
                        </>
                      ) : (
                        <p className="text-[10px] text-zinc-600">Never logged in</p>
                      )}
                      <p className="text-[10px] text-zinc-700 mt-0.5">Created {new Date(client.created_at || "").toLocaleDateString()}</p>
                    </div>
                    <button
                      onClick={() => setExpandedId(isExpanded ? null : client.id)}
                      className={`p-2 rounded-xl border transition ${isExpanded ? "bg-violet-500/10 border-violet-500/20 text-violet-400" : "border-zinc-800 text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800"}`}
                    >
                      <svg className={`h-4 w-4 transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
                    </button>
                  </div>
                </div>
              </div>

              {/* Expanded actions */}
              {isExpanded && (
                <div className="border-t border-zinc-800/60 bg-zinc-900/30 px-5 py-4 animate-in slide-in-from-top-1 duration-150">
                  <div className="flex flex-wrap items-center gap-2">
                    {client.portal_access !== "never_set" && (
                      <button onClick={() => setCredentialsModal(client)} className="inline-flex items-center gap-1.5 rounded-xl bg-violet-500/10 border border-violet-500/20 px-4 py-2 text-[11px] font-bold text-violet-300 hover:bg-violet-500/20 transition">
                        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" /></svg>
                        View Credentials
                      </button>
                    )}
                    <button onClick={() => setPasswordModal(client)} className="rounded-xl border border-zinc-700 bg-zinc-800/40 px-4 py-2 text-[11px] font-bold text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition">
                      {client.portal_access === "never_set" ? "Set Password" : "Reset Password"}
                    </button>
                    <button onClick={() => handleSendInvite(client.id)} className={`rounded-xl border px-4 py-2 text-[11px] font-bold transition ${inviteSent === client.id ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300" : "border-zinc-700 bg-zinc-800/40 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800"}`}>
                      {inviteSent === client.id ? "✓ Invite Sent!" : "Send Invite"}
                    </button>
                    <Link href={`/ja-admin/clients/${client.id}`} className="rounded-xl border border-zinc-700 bg-zinc-800/40 px-4 py-2 text-[11px] font-bold text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition">
                      View Profile →
                    </Link>
                    <button
                      onClick={() => setNotesModal(client)}
                      className={`inline-flex items-center gap-1.5 rounded-xl border px-4 py-2 text-[11px] font-bold transition ${
                        client.notes
                          ? "border-amber-500/20 bg-amber-500/10 text-amber-300 hover:bg-amber-500/20"
                          : "border-zinc-700 bg-zinc-800/40 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800"
                      }`}
                    >
                      <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                      {client.notes ? "Edit Notes" : "Add Notes"}
                    </button>

                    {/* Right-side danger actions */}
                    <div className="ml-auto flex items-center gap-2">
                      <button onClick={() => handleToggleSuspend(client.id, client.status)} className={`rounded-xl border px-4 py-2 text-[11px] font-bold transition ${isSuspended ? "border-emerald-500/20 bg-emerald-500/5 text-emerald-400 hover:bg-emerald-500/10" : "border-amber-500/20 bg-amber-500/5 text-amber-400 hover:bg-amber-500/10"}`}>
                        {isSuspended ? "Reinstate" : "Suspend"}
                      </button>
                      <button onClick={() => setDeleteModal(client)} className="rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-2 text-[11px] font-bold text-red-400 hover:bg-red-500/10 transition flex items-center gap-1.5">
                        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        Delete Account
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

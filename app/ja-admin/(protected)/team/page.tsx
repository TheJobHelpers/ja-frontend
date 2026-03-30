"use client";

import { useState, useEffect } from "react";
import { jaApi } from "../../../lib/jaApi";
import type { Staff, StaffRole, StaffStatus } from "../../../types/ja-admin";
import { getJaUser, JaUser } from "../../../lib/jaAuth";
import { SkeletonBox, SkeletonText, SkeletonTableRow } from "../../../components/Skeleton";

const STATUS_STYLES: Record<StaffStatus, string> = {
  active: "bg-emerald-500/10 border-emerald-500/20 text-emerald-400",
  pending: "bg-amber-500/10 border-amber-500/20 text-amber-400",
  suspended: "bg-red-500/10 border-red-500/20 text-red-400",
};

// ─── Set Password Modal ───────────────────────────────────────
function ResetPasswordModal({ staff, onClose, onSave }: {
  staff: Staff;
  onClose: () => void;
  onSave: (id: string) => void;
}) {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) { setError("Must be at least 8 characters"); return; }
    if (password !== confirm) { setError("Passwords do not match"); return; }
    setSaving(true);
    try {
      await jaApi.patch(`/team/${staff.id}`, { password });
      onSave(staff.id);
      setSuccess(true);
      setTimeout(onClose, 1200);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to reset password");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
      <div className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-950 p-6 shadow-2xl">
        <div className="flex items-start justify-between mb-5">
          <div>
            <h3 className="text-sm font-bold text-zinc-100">Reset Password</h3>
            <p className="text-[11px] text-zinc-500 mt-0.5">For: {staff.name} · {staff.email}</p>
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
            <p className="text-sm font-semibold text-emerald-300">Password reset successfully</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {[
              { key: "password", label: "New Temporary Password", value: password, set: setPassword },
              { key: "confirm", label: "Confirm Password", value: confirm, set: setConfirm },
            ].map((f) => (
              <div key={f.key} className="space-y-1.5 group relative">
                <label className="block text-[11px] font-semibold uppercase tracking-[0.15em] text-zinc-400 group-focus-within:text-violet-400 transition-colors">{f.label}</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={f.value}
                    onChange={(e) => f.set(e.target.value)}
                    className="w-full rounded-xl border border-white/5 bg-zinc-900/50 px-4 py-2.5 text-sm text-zinc-50 placeholder-zinc-600 outline-none transition hover:bg-zinc-900/80 focus:border-violet-500/40 focus:bg-zinc-900/80 focus:ring-1 focus:ring-violet-500/20"
                  />
                  {f.value.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md bg-zinc-800 px-2 py-0.5 text-[10px] font-bold text-zinc-400 hover:text-zinc-200 transition"
                    >
                      {showPassword ? "Hide" : "Show"}
                    </button>
                  )}
                </div>
              </div>
            ))}

            {error && <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">{error}</p>}

            <div className="flex gap-3 pt-1">
              <button type="button" onClick={onClose} className="flex-1 rounded-xl border border-zinc-700 bg-zinc-800/50 py-2.5 text-xs font-semibold text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 active:scale-[0.98] transition">Cancel</button>
              <button type="submit" disabled={saving} className="flex-1 rounded-xl bg-gradient-to-r from-violet-500 to-purple-600 py-2.5 text-xs font-bold text-white shadow-lg shadow-violet-500/20 hover:from-violet-400 hover:to-purple-500 active:scale-[0.98] transition disabled:opacity-60">
                {saving ? "Resetting..." : "Set Password"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

// ─── Create Staff Modal ──────────────────────────────────────
function CreateStaffModal({ onClose, onAdd }: { onClose: () => void; onAdd: (s: Staff) => void }) {
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "member" as StaffRole });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const newStaff = await jaApi.post<Staff>("/team", {
        name: form.name,
        email: form.email,
        password: form.password,
        role: form.role,
      });
      onAdd(newStaff);
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to create team member");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-950 p-6 shadow-2xl animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-base font-bold text-zinc-100">Add Team Member</h3>
          <button onClick={onClose} className="text-zinc-500 hover:text-zinc-300 transition">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5 group">
            <label className="block text-[11px] font-semibold uppercase tracking-[0.12em] text-zinc-400 group-focus-within:text-violet-400 transition-colors">Full Name</label>
            <input required placeholder="e.g. Jane Smith" value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} className="w-full rounded-xl border border-white/5 bg-zinc-900/50 px-3 py-2.5 text-sm text-zinc-50 placeholder-zinc-600 outline-none transition hover:bg-zinc-900/80 focus:border-violet-500/40 focus:bg-zinc-900/80 focus:ring-1 focus:ring-violet-500/20" />
          </div>
          <div className="space-y-1.5 group">
            <label className="block text-[11px] font-semibold uppercase tracking-[0.12em] text-zinc-400 group-focus-within:text-violet-400 transition-colors">Email Address</label>
            <input type="email" required placeholder="name@jateam.com" value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} className="w-full rounded-xl border border-white/5 bg-zinc-900/50 px-3 py-2.5 text-sm text-zinc-50 placeholder-zinc-600 outline-none transition hover:bg-zinc-900/80 focus:border-violet-500/40 focus:bg-zinc-900/80 focus:ring-1 focus:ring-violet-500/20" />
          </div>
          <div className="space-y-1.5 group relative">
            <label className="block text-[11px] font-semibold uppercase tracking-[0.12em] text-zinc-400 group-focus-within:text-violet-400 transition-colors">Temporary Password</label>
            <div className="relative">
              <input type={showPassword ? "text" : "password"} required placeholder="Min 8 characters" value={form.password} onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))} className="w-full rounded-xl border border-white/5 bg-zinc-900/50 px-3 py-2.5 text-sm text-zinc-50 placeholder-zinc-600 outline-none transition hover:bg-zinc-900/80 focus:border-violet-500/40 focus:bg-zinc-900/80 focus:ring-1 focus:ring-violet-500/20" />
              {form.password.length > 0 && (
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-md bg-zinc-800 px-2 py-0.5 text-[10px] font-bold text-zinc-400 hover:text-zinc-200 transition">
                  {showPassword ? "Hide" : "Show"}
                </button>
              )}
            </div>
          </div>
          <div className="space-y-1.5 group">
            <label className="block text-[11px] font-semibold uppercase tracking-[0.12em] text-zinc-400 group-focus-within:text-violet-400 transition-colors">Access Level</label>
            <select value={form.role} onChange={(e) => setForm((p) => ({ ...p, role: e.target.value as StaffRole }))} className="w-full rounded-xl border border-white/5 bg-zinc-900/50 px-3 py-2.5 text-sm text-zinc-50 outline-none transition hover:bg-zinc-900/80 focus:border-violet-500/40 focus:bg-zinc-900/80 focus:ring-1 focus:ring-violet-500/20 appearance-none cursor-pointer">
              <option value="member">Staff Member (Processing/Standard access)</option>
              <option value="admin">Administrator (Full control)</option>
            </select>
          </div>

          {error && <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">{error}</p>}

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 rounded-xl border border-zinc-700 bg-zinc-800/50 py-2.5 text-xs font-semibold text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 active:scale-[0.98] transition">Cancel</button>
            <button type="submit" disabled={saving} className="flex-1 rounded-xl bg-gradient-to-r from-violet-500 to-purple-600 py-2.5 text-xs font-bold text-white shadow-lg shadow-violet-500/20 hover:from-violet-400 hover:to-purple-500 active:scale-[0.98] transition disabled:opacity-60">
              {saving ? "Creating..." : "Send Invite"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Delete Staff Modal ──────────────────────────────────────────
function DeleteStaffModal({ staff, onClose, onDeleted }: {
  staff: Staff;
  onClose: () => void;
  onDeleted: (id: string) => void;
}) {
  const [confirming, setConfirming] = useState(false);
  const [input, setInput] = useState("");
  const [error, setError] = useState("");

  const handleDelete = async () => {
    if (input.trim().toLowerCase() !== staff.name.trim().toLowerCase()) {
      setError("Name doesn't match. Please type the member name exactly.");
      return;
    }
    setConfirming(true);
    try {
      await jaApi.delete(`/team/${staff.id}`);
      onDeleted(staff.id);
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to delete staff member");
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
            <h3 className="text-base font-bold text-white">Remove Team Member</h3>
            <p className="text-xs text-zinc-500 mt-0.5">This action is permanent and cannot be undone.</p>
          </div>
        </div>

        <div className="rounded-xl bg-red-500/5 border border-red-500/15 px-4 py-3 mb-5 text-xs text-red-300 leading-relaxed">
          Removing <strong className="text-red-200">{staff.name}</strong> ({staff.email}) will permanently delete their staff account and revoke all access.
        </div>

        <div className="space-y-2 mb-5">
          <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-500">
            Type <span className="text-zinc-200 font-mono">{staff.name}</span> to confirm
          </label>
          <input
            type="text"
            value={input}
            onChange={e => { setInput(e.target.value); setError(""); }}
            placeholder={staff.name}
            className="w-full rounded-xl border border-zinc-800 bg-zinc-900/60 px-4 py-2.5 text-sm text-zinc-100 placeholder-zinc-700 outline-none focus:border-red-500/40 focus:ring-1 focus:ring-red-500/20 transition"
          />
          {error && <p className="text-xs text-red-400">{error}</p>}
        </div>

        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 rounded-xl border border-zinc-800 bg-zinc-900 py-2.5 text-xs font-bold text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition">Cancel</button>
          <button
            onClick={handleDelete}
            disabled={confirming || input.trim().toLowerCase() !== staff.name.trim().toLowerCase()}
            className="flex-1 rounded-xl bg-red-600 hover:bg-red-500 disabled:opacity-40 disabled:cursor-not-allowed py-2.5 text-xs font-bold text-white transition"
          >
            {confirming ? "Removing..." : "Remove Member"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────
export default function TeamAccessPage() {
  const [team, setTeam] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "pending" | "suspended">("all");

  const [showCreate, setShowCreate] = useState(false);
  const [passwordModal, setPasswordModal] = useState<Staff | null>(null);
  const [deleteModal, setDeleteModal] = useState<Staff | null>(null);
  const [currentUser, setCurrentUser] = useState<JaUser | null>(null);

  useEffect(() => {
    setCurrentUser(getJaUser());
    async function load() {
      try {
        const data = await jaApi.get<{ team: Staff[] }>("/team");
        setTeam(data.team || []);
      } catch (err) {
        console.error("Failed to load team:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const isAdmin = currentUser?.role === "admin";

  const filtered = team.filter((s) => {
    const matchesSearch = s.name.toLowerCase().includes(search.toLowerCase()) || s.email.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || s.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleToggleSuspend = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === "suspended" ? "active" : "suspended";
    try {
      await jaApi.patch(`/team/${id}`, { status: newStatus });
      setTeam((prev) => prev.map((s) => s.id === id ? { ...s, status: newStatus as Staff["status"] } : s));
    } catch (err) {
      console.error("Toggle suspend failed:", err);
    }
  };

  const handleCreate = (newStaff: Staff) => {
    setTeam((prev) => [newStaff, ...prev]);
    setShowCreate(false);
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-in fade-in duration-300">
        <div className="flex items-center justify-between border-b border-zinc-800/60 pb-5">
          <div className="space-y-2">
            <SkeletonText className="w-36 h-7" />
            <SkeletonText className="w-72 h-4" />
          </div>
          <SkeletonBox className="h-9 w-36 rounded-xl" />
        </div>
        <div className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950/50">
          <div className="grid grid-cols-5 px-5 py-3 border-b border-zinc-800 gap-4">
            {["w-20","w-28","w-16","w-20","w-16"].map((w,i) => (
              <SkeletonText key={i} className={`${w} h-3`} />
            ))}
          </div>
          <div className="divide-y divide-zinc-800/40">
            {Array.from({length: 5}).map((_, i) => <SkeletonTableRow key={i} />)}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {showCreate && <CreateStaffModal onClose={() => setShowCreate(false)} onAdd={handleCreate} />}
      {passwordModal && <ResetPasswordModal staff={passwordModal} onClose={() => setPasswordModal(null)} onSave={() => {}} />}
      {deleteModal && <DeleteStaffModal staff={deleteModal} onClose={() => setDeleteModal(null)} onDeleted={(id) => setTeam(prev => prev.filter(s => s.id !== id))} />}

      {/* Header */}
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between border-b border-zinc-800/60 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100 flex items-center gap-3">
            Team Access
            <span className="text-xs font-normal text-zinc-500 bg-zinc-800/80 px-2 py-0.5 rounded-full">{team.length} members</span>
          </h1>
          <p className="text-sm text-zinc-400 mt-1">Manage internal JA staff accounts and access privileges.</p>
        </div>
        {isAdmin && (
          <button
            onClick={() => setShowCreate(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-500 to-purple-600 px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-violet-500/20 hover:from-violet-400 hover:to-purple-500 active:scale-[0.98] transition"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M18 12H6m6-6v12" /></svg>
            Add Team Member
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or email..."
          className="w-64 rounded-xl border border-white/10 bg-zinc-900/80 px-4 py-2 text-sm text-zinc-50 placeholder-zinc-600 outline-none focus:border-violet-500/40 transition"
        />
        <div className="flex gap-1 rounded-xl bg-zinc-900/50 border border-zinc-800 p-1">
          {(["all", "active", "pending", "suspended"] as const).map((s) => (
            <button key={s} onClick={() => setStatusFilter(s)}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${statusFilter === s ? "bg-violet-500 text-white shadow-lg shadow-violet-500/20" : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800"}`}
            >
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Team Table */}
      <div className="overflow-x-auto rounded-2xl border border-zinc-800 bg-zinc-950/50">
        <table className="w-full text-left text-sm text-zinc-400 min-w-[700px]">
          <thead className="border-b border-zinc-800 bg-zinc-900/40 text-[10px] uppercase tracking-widest text-zinc-500">
            <tr>
              <th className="px-6 py-4 font-bold">Staff Member</th>
              <th className="px-6 py-4 font-bold">Role</th>
              <th className="px-6 py-4 font-bold">Status</th>
              <th className="px-6 py-4 font-bold">Last Login</th>
              <th className="px-6 py-4 font-bold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/60">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-12 text-center text-zinc-500 italic">No staff members found.</td>
              </tr>
            ) : filtered.map((staff) => {
              const statusStyle = STATUS_STYLES[staff.status];
              const isSuspended = staff.status === "suspended";
              const isStaffAdmin = staff.role === "admin";

              return (
                <tr key={staff.id} className={`transition ${isSuspended ? "bg-red-500/5 opacity-80" : "hover:bg-zinc-900/50"}`}>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs font-bold ${isStaffAdmin ? "bg-amber-500/10 text-amber-500 border border-amber-500/20" : "bg-violet-500/15 text-violet-300 border border-violet-500/20"}`}>
                        {staff.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold text-zinc-200">{staff.name}</p>
                        <p className="text-[11px] text-zinc-500">{staff.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {isStaffAdmin ? (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-amber-500">
                        <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        Admin
                      </span>
                    ) : (
                      <span className="text-[11px] uppercase tracking-wider text-zinc-500 font-bold">Member</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-1.5 py-0.5 rounded border text-[9px] font-bold uppercase tracking-wider ${statusStyle}`}>
                      {staff.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-[11px]">
                    {staff.last_login ? (
                      <div>
                        <p className="text-zinc-300">{new Date(staff.last_login).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</p>
                        <p className="text-zinc-600">{new Date(staff.last_login).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}</p>
                      </div>
                    ) : (
                      <span className="text-zinc-600 italic">Never</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    {isAdmin && (
                      <div className="flex items-center justify-end gap-2 text-right">
                        <button
                          onClick={() => setPasswordModal(staff)}
                          className="rounded-lg border border-zinc-700 bg-zinc-800/50 px-3 py-1.5 text-[10px] font-bold text-zinc-300 hover:text-white hover:bg-zinc-700 transition"
                        >
                          Reset PW
                        </button>
                        <button
                          onClick={() => handleToggleSuspend(staff.id, staff.status)}
                          className={`rounded-lg border px-3 py-1.5 text-[10px] font-bold transition ${
                            isSuspended
                              ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20"
                              : "bg-red-500/10 border-red-500/20 text-red-400 hover:bg-red-500/20"
                          }`}
                        >
                          {isSuspended ? "Reinstate" : "Suspend"}
                        </button>
                        {staff.email !== currentUser?.email && (
                          <button
                            onClick={() => setDeleteModal(staff)}
                            className="rounded-lg border border-red-500/20 bg-red-500/5 px-3 py-1.5 text-[10px] font-bold text-red-400 hover:bg-red-500/15 transition"
                            title="Remove member"
                          >
                            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                          </button>
                        )}
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

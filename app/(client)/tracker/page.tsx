"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import { apiGet, apiPost, apiPatch } from "../../lib/api";

import { SkeletonBox } from "../../components/Skeleton";
import { Toast } from "../../components/Toast";

interface Job {
  id: string;
  job_title: string;
  company?: string;
  location?: string;
  status: string;
  source?: string;
  notes?: string;
  created_at?: string;
  assigned_at?: string;
  match_score?: number;
  apply_link?: string;
  handled_by?: string; // 'ja_team' | 'client'
}

const COLUMNS = [
  { id: "pipeline", label: "Pipeline", statuses: ["saved", "queued"], color: "zinc", icon: "📋" },
  { id: "reviewing", label: "Reviewing", statuses: ["assigned", "reviewing"], color: "sky", icon: "🔍" },
  { id: "applied", label: "Applied", statuses: ["applied"], color: "violet", icon: "📩" },
  { id: "closed", label: "Outcome", statuses: ["interviewing", "offer", "rejected"], color: "amber", icon: "🏆" },
];

const ACCENT_COLORS: Record<string, string> = {
  zinc: "bg-zinc-500",
  sky: "bg-sky-500",
  violet: "bg-violet-500",
  amber: "bg-amber-500",
  emerald: "bg-emerald-500",
};

const TEXT_ACCENTS: Record<string, string> = {
  zinc: "text-zinc-400",
  sky: "text-sky-400",
  violet: "text-violet-400",
  amber: "text-amber-400",
  emerald: "text-emerald-400",
};



const GLOW_ACCENTS: Record<string, string> = {
  zinc: "shadow-[0_0_15px_rgba(113,113,122,0.1)]",
  sky: "shadow-[0_0_15px_rgba(14,165,233,0.1)]",
  violet: "shadow-[0_0_15px_rgba(139,92,246,0.1)]",
  amber: "shadow-[0_0_15px_rgba(245,158,11,0.1)]",
  emerald: "shadow-[0_0_15px_rgba(16,185,129,0.1)]",
};

// Roles currently being actively handled by the JA team (status-based lock)
const DRAG_LOCKED_STATUSES = ["assigned", "reviewing"];

// All statuses that indicate the JA team has been involved
const JA_HANDLED_STATUSES = ["assigned", "reviewing", "applied", "interviewing", "offer", "rejected"];

/** Determine if this job is locked from client drag (JA-owned in reviewing stages) */
const isJaLocked = (job: Job): boolean =>
  DRAG_LOCKED_STATUSES.includes(job.status) && (job.handled_by ?? "ja_team") === "ja_team";

/** Show 'Myself' badge only if the client has explicitly acted on this job */
const isClientHandled = (job: Job): boolean => job.handled_by === "client";

export default function TrackerPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [, setStats] = useState<{ assignments_used?: number; max_assignments?: number; search_attempts_used?: number; max_search_attempts?: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [viewType, setViewType] = useState<'board' | 'list'>('board');
  const [searchQuery, setSearchQuery] = useState("");

  // Drag to scroll logic
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isDraggingScroll, setIsDraggingScroll] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [activeTab, setActiveTab] = useState("pipeline");

  const handleMouseDown = (e: React.MouseEvent) => {
    if (viewType !== 'board' || !scrollContainerRef.current) return;
    // Don't trigger if clicking a card or button
    if ((e.target as HTMLElement).closest('.group') || (e.target as HTMLElement).closest('button') || (e.target as HTMLElement).closest('a')) return;
    
    setIsDraggingScroll(true);
    setStartX(e.pageX - scrollContainerRef.current.offsetLeft);
    setScrollLeft(scrollContainerRef.current.scrollLeft);
  };

  const handleMouseLeaveOrUp = () => {
    setIsDraggingScroll(false);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingScroll || !scrollContainerRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollContainerRef.current.offsetLeft;
    const walk = (x - startX) * 2; // Scroll speed
    scrollContainerRef.current.scrollLeft = scrollLeft - walk;
  };
  
  const [editingNoteJob, setEditingNoteJob] = useState<Job | null>(null);
  const [noteContent, setNoteContent] = useState("");
  const [isSavingNote, setIsSavingNote] = useState(false);
  
  const [showAddJobModal, setShowAddJobModal] = useState(false);
  const [newJob, setNewJob] = useState({ job_title: "", company: "", location: "", apply_link: "" });
  const [isCreatingJob, setIsCreatingJob] = useState(false);

  const [draggedJobId, setDraggedJobId] = useState<string | null>(null);
  const [targetColumn, setTargetColumn] = useState<string | null>(null);
  const [showArchived, setShowArchived] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);

  const loadData = async (includeArchived: boolean = false) => {
    try {
      const [jobsRes, statsRes] = await Promise.all([
        apiGet<Job[] | { jobs: Job[] } | { data: Job[] }>(`/api/client/jobs${includeArchived ? '?archived=true' : ''}`),
        apiGet<{ assignments_used?: number; max_assignments?: number; search_attempts_used?: number; max_search_attempts?: number }>("/api/client/jobs/stats").catch(() => null)
      ]);
      let data: Job[] = [];
      if (Array.isArray(jobsRes)) {
        data = jobsRes;
      } else if (jobsRes && typeof jobsRes === 'object') {
        if ('jobs' in jobsRes && Array.isArray(jobsRes.jobs)) data = jobsRes.jobs;
        else if ('data' in jobsRes && Array.isArray(jobsRes.data)) data = jobsRes.data;
      }
      setJobs(data);
      if (statsRes) setStats(statsRes);
    } catch (e) {
      console.error("Failed to fetch data", e);
      setToast({ message: "Failed to load tracker data. Please refresh.", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(showArchived); }, [showArchived]);

  const handleArchive = async (jobId: string) => {
    try {
      await apiPost(`/api/client/jobs/${jobId}/archive`, {});
      setToast({ message: "Job archived", type: "success" });
      loadData(showArchived);
    } catch {
      setToast({ message: "Failed to archive", type: "error" });
    }
  };

  const handleRestore = async (jobId: string) => {
    try {
      await apiPost(`/api/client/jobs/${jobId}/restore`, {});
      setToast({ message: "Job restored", type: "success" });
      loadData(showArchived);
    } catch {
      setToast({ message: "Failed to restore", type: "error" });
    }
  };

  const formatDateTime = (dateStr?: string) => {
    if (!dateStr) return "Recently";
    const date = new Date(dateStr);
    return date.toLocaleString(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true });
  };

  const filteredJobs = useMemo(() => {
    if (!searchQuery) return jobs;
    const q = searchQuery.toLowerCase();
    return jobs.filter(j => j.job_title.toLowerCase().includes(q) || (j.company || "").toLowerCase().includes(q));
  }, [jobs, searchQuery]);

  const handleAddJob = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newJob.job_title || !newJob.company) { setToast({ message: "Job Title and Company are required", type: "error" }); return; }
    setIsCreatingJob(true);
    try {
      await apiPost("/api/client/jobs", newJob);
      setToast({ message: "Job added successfully", type: "success" });
      setShowAddJobModal(false);
      setNewJob({ job_title: "", company: "", location: "", apply_link: "" });
      loadData();
    } catch (err) {
      console.error("Add job error:", err);
      const message = err instanceof Error ? err.message : "Failed to add job";
      setToast({ message, type: "error" });
    } finally { setIsCreatingJob(false); }
  };

  const handleSaveNote = async () => {
    if (!editingNoteJob) return;
    setIsSavingNote(true);
    try {
      await apiPatch(`/api/client/jobs/${editingNoteJob.id}/notes`, { notes: noteContent });
      setJobs(prev => prev.map(j => j.id === editingNoteJob.id ? { ...j, notes: noteContent } : j));
      setToast({ message: "Note saved", type: "success" });
      setEditingNoteJob(null);
    } catch (err) {
      console.error("Save note error:", err);
      setToast({ message: "Failed to save note", type: "error" });
    } finally { setIsSavingNote(false); }
  };

  const updateJobStatus = async (jobId: string, newStatus: string) => {
    const job = jobs.find(j => j.id === jobId);
    if (!job || job.status === newStatus) return;
    
    if (DRAG_LOCKED_STATUSES.includes(job.status)) {
       setToast({ message: "This role is currently being reviewed by the team.", type: "info" });
       return;
    }

    const originalStatus = job.status;
    const originalHandledBy = job.handled_by;
    // Optimistically update both status and handled_by
    setJobs(prev => prev.map(j => j.id === jobId ? { ...j, status: newStatus, handled_by: "client" } : j));
    try {
      await apiPatch(`/api/client/jobs/${jobId}/status`, { status: newStatus });
    } catch (err) {
      setJobs(prev => prev.map(j => j.id === jobId ? { ...j, status: originalStatus, handled_by: originalHandledBy } : j));
      const message = err instanceof Error ? err.message : "Connection failed. Please try again.";
      setToast({ message, type: "error" });
    }
  };

  const handleDragStart = (e: React.DragEvent, job: Job) => {
    if (isJaLocked(job)) { e.preventDefault(); return; }
    setDraggedJobId(job.id);
    e.dataTransfer.setData("jobId", job.id);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent, columnId: string) => { 
    // Only allow dropping into Applied and Outcome
    if (columnId === 'applied' || columnId === 'closed') {
      e.preventDefault(); 
      setTargetColumn(columnId); 
    }
  };

  const handleDrop = (e: React.DragEvent, columnId: string) => {
    e.preventDefault();
    setTargetColumn(null);
    
    if (columnId !== 'applied' && columnId !== 'closed') {
      if (columnId === 'reviewing') {
        setToast({ message: "Reviewing status is managed by our team.", type: "info" });
      }
      setDraggedJobId(null);
      return;
    }

    const jobId = e.dataTransfer.getData("jobId");
    const column = COLUMNS.find(c => c.id === columnId);
    if (column && jobId) { updateJobStatus(jobId, column.statuses[0]); }
    setDraggedJobId(null);
  };

  const columnJobs = useMemo(() => {
    const groups: Record<string, Job[]> = {};
    COLUMNS.forEach(col => { groups[col.id] = filteredJobs.filter(j => col.statuses.includes(j.status)); });
    return groups;
  }, [filteredJobs]);

  if (loading) {
    return (
      <div className="h-[calc(100vh-160px)] flex flex-col space-y-8 animate-in fade-in duration-500">
        <div className="flex justify-between items-center"><SkeletonBox className="h-12 w-64 rounded-2xl" /><SkeletonBox className="h-12 w-32 rounded-2xl" /></div>
        <div className="grid grid-cols-4 gap-6 overflow-hidden">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="space-y-4">
              <SkeletonBox className="h-10 w-32 rounded-xl" />
              <SkeletonBox className="h-96 w-full rounded-[2rem]" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-160px)] flex flex-col space-y-6 relative overflow-hidden select-none animate-in fade-in duration-700">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* Note Modal */}
      {editingNoteJob && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 dark:bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
          <div className="w-full max-w-lg bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-[2.5rem] p-8 shadow-2xl space-y-6">
             <div className="space-y-1"><h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">Private Note</h2><p className="text-[10px] font-semibold text-slate-400 dark:text-zinc-500 uppercase tracking-widest truncate">{editingNoteJob.job_title}</p></div>
             <textarea autoFocus value={noteContent} onChange={(e) => setNoteContent(e.target.value)} placeholder="Add your personal notes..." className="w-full h-40 bg-slate-50 dark:bg-zinc-950/50 border border-slate-200 dark:border-zinc-800 rounded-2xl p-4 text-sm text-slate-700 dark:text-zinc-300 focus:outline-none focus:border-slate-400 dark:focus:border-zinc-600 transition-all resize-none custom-scrollbar font-medium" />
             <div className="flex items-center gap-3">
               <button onClick={() => setEditingNoteJob(null)} className="flex-1 h-12 rounded-2xl border border-slate-200 dark:border-zinc-800 text-slate-500 dark:text-zinc-400 text-[10px] font-bold uppercase tracking-widest hover:bg-slate-50 dark:hover:bg-zinc-800 transition">Cancel</button>
               <button onClick={handleSaveNote} disabled={isSavingNote} className="flex-1 h-12 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-black text-[10px] font-bold uppercase tracking-widest hover:bg-slate-800 dark:hover:bg-zinc-200 transition disabled:opacity-50">{isSavingNote ? 'Saving...' : 'Save Note'}</button>
             </div>
          </div>
        </div>
      )}

      {/* Add Job Modal */}
      {showAddJobModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 dark:bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
          <form onSubmit={handleAddJob} className="w-full max-w-md bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-[2.5rem] p-8 shadow-2xl space-y-6">
             <div className="space-y-1"><h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">Add New Job</h2><p className="text-[10px] font-semibold text-slate-400 dark:text-zinc-500 uppercase tracking-widest">Target role for your pipeline</p></div>
             <div className="space-y-4">
               <input type="text" placeholder="Job Title *" value={newJob.job_title} onChange={(e) => setNewJob({...newJob, job_title: e.target.value})} className="w-full h-12 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-2xl px-5 text-sm text-slate-700 dark:text-zinc-300 focus:outline-none focus:border-slate-400 dark:focus:border-zinc-700 transition-all font-medium" />
               <input type="text" placeholder="Company *" value={newJob.company} onChange={(e) => setNewJob({...newJob, company: e.target.value})} className="w-full h-12 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-2xl px-5 text-sm text-slate-700 dark:text-zinc-300 focus:outline-none focus:border-slate-400 dark:focus:border-zinc-700 transition-all font-medium" />
               <input type="text" placeholder="Location" value={newJob.location} onChange={(e) => setNewJob({...newJob, location: e.target.value})} className="w-full h-12 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-2xl px-5 text-sm text-slate-700 dark:text-zinc-300 focus:outline-none focus:border-slate-400 dark:focus:border-zinc-700 transition-all font-medium" />
               <input type="url" placeholder="Apply Link" value={newJob.apply_link} onChange={(e) => setNewJob({...newJob, apply_link: e.target.value})} className="w-full h-12 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-2xl px-5 text-sm text-slate-700 dark:text-zinc-300 focus:outline-none focus:border-slate-400 dark:focus:border-zinc-700 transition-all font-medium" />
             </div>
             <div className="flex items-center gap-3">
               <button type="button" onClick={() => setShowAddJobModal(false)} className="flex-1 h-12 rounded-2xl border border-slate-200 dark:border-zinc-800 text-slate-500 dark:text-zinc-400 text-[10px] font-bold uppercase tracking-widest hover:bg-slate-50 dark:hover:bg-zinc-800 transition">Cancel</button>
               <button type="submit" disabled={isCreatingJob} className="flex-1 h-12 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-black text-[10px] font-bold uppercase tracking-widest hover:bg-slate-800 dark:hover:bg-zinc-200 transition disabled:opacity-50 shadow-xl shadow-black/10 dark:shadow-white/10">{isCreatingJob ? 'Adding...' : 'Add Position'}</button>
             </div>
          </form>
        </div>
      )}

      {/* Cinematic Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 shrink-0 px-8 py-6 bg-white/70 dark:bg-zinc-900/40 backdrop-blur-3xl border border-slate-200/60 dark:border-zinc-800/60 rounded-[2.5rem] shadow-xl dark:shadow-[0_30px_60px_rgba(0,0,0,0.4)] relative overflow-hidden group transition-all duration-500">
        <div className="absolute inset-0 bg-gradient-to-r from-violet-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
        
        <div className="flex items-center gap-8 relative z-10">
          <div className="flex flex-col">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tighter leading-none mb-1">Career Tracker</h1>
            <div className="flex items-center gap-2">
               <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
               <p className="text-[9px] font-semibold text-slate-400 dark:text-zinc-600 uppercase tracking-[0.4em]">Live Workstream</p>
            </div>
          </div>
          <div className="h-10 w-[1px] bg-slate-200 dark:bg-zinc-800/50 hidden md:block" />
          <div className="relative flex-1 lg:flex-none">
            <input type="text" placeholder="Filter roles..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full lg:w-72 h-11 bg-slate-100/50 dark:bg-zinc-950/60 border border-slate-200/50 dark:border-zinc-800/50 rounded-2xl pl-11 pr-4 text-[11px] font-medium text-slate-600 dark:text-zinc-300 focus:outline-none focus:border-slate-400 dark:focus:border-zinc-600 transition-all placeholder:text-slate-400 dark:placeholder:text-zinc-700" />
            <svg className="absolute left-4 top-3.5 w-4 h-4 text-slate-400 dark:text-zinc-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          </div>
        </div>

        <div className="flex items-center gap-8 relative z-10">
          <div className="flex items-center gap-1 bg-slate-100/50 dark:bg-zinc-950/60 p-1.5 rounded-[1.25rem] border border-slate-200/50 dark:border-zinc-800/50 shadow-inner">
             <div className="flex flex-col items-center px-5 py-1.5 shrink-0">
               <span className="text-[7px] font-bold text-slate-400 dark:text-zinc-600 uppercase tracking-widest mb-0.5">Pipeline</span>
               <span className="text-[14px] font-bold text-slate-900 dark:text-white">{jobs.length}</span>
             </div>
             <div className="w-[1px] h-8 bg-slate-200 dark:bg-zinc-800/50 shrink-0" />
             <div className="flex flex-col items-center px-5 py-1.5 shrink-0">
               <span className="text-[7px] font-bold text-slate-400 dark:text-zinc-600 uppercase tracking-widest mb-0.5">Applied</span>
               <span className="text-[14px] font-bold text-violet-600 dark:text-violet-400">{jobs.filter(j => j.status === 'applied').length}</span>
             </div>
             <div className="w-[1px] h-8 bg-slate-200 dark:bg-zinc-800/50 shrink-0" />
             <div className="flex flex-col items-center px-5 py-1.5 shrink-0">
               <span className="text-[7px] font-bold text-slate-400 dark:text-zinc-600 uppercase tracking-widest mb-0.5">Outcome</span>
               <span className="text-[14px] font-bold text-amber-600 dark:text-amber-500">{jobs.filter(j => ['interviewing', 'offer', 'rejected'].includes(j.status)).length}</span>
             </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex bg-slate-100/50 dark:bg-zinc-950/60 p-1 rounded-xl border border-slate-200/40 dark:border-zinc-800/40 shadow-inner">
              <button onClick={() => setViewType('board')} className={`px-5 py-2 rounded-lg text-[9px] font-bold uppercase tracking-widest transition-all ${viewType === 'board' ? 'bg-white dark:bg-zinc-800 text-slate-900 dark:text-white shadow-md' : 'text-slate-400 dark:text-zinc-600 hover:text-slate-600 dark:hover:text-zinc-300'}`}>Board</button>
              <button onClick={() => setViewType('list')} className={`px-5 py-2 rounded-lg text-[9px] font-bold uppercase tracking-widest transition-all ${viewType === 'list' ? 'bg-white dark:bg-zinc-800 text-slate-900 dark:text-white shadow-md' : 'text-slate-400 dark:text-zinc-600 hover:text-slate-600 dark:hover:text-zinc-300'}`}>List</button>
            </div>

            <button 
              onClick={() => setShowArchived(!showArchived)} 
              className={`h-11 px-6 rounded-2xl border flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest transition-all ${
                showArchived 
                ? 'bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400' 
                : 'bg-slate-100/50 dark:bg-zinc-950/60 border-slate-200/50 dark:border-zinc-800/50 text-slate-500 dark:text-zinc-400 hover:bg-slate-200/50 dark:hover:bg-zinc-800/80'
              }`}
            >
              {showArchived ? (
                <>
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                  Viewing Archive
                </>
              ) : (
                <>
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  Archive
                </>
              )}
            </button>

            <button onClick={() => setShowAddJobModal(true)} className="flex items-center justify-center gap-3 px-6 h-12 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-black text-[10px] font-bold uppercase tracking-widest hover:bg-slate-800 dark:hover:bg-zinc-200 transition-all shadow-xl dark:shadow-[0_15px_30px_rgba(255,255,255,0.1)] active:scale-95 group">
              <svg className="w-4 h-4 group-hover:rotate-90 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
              <span>Add Job</span>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Tab Navigator */}
      <div className="md:hidden flex items-center bg-slate-100/50 dark:bg-zinc-950/60 p-1 rounded-2xl border border-slate-200/50 dark:border-zinc-800/50 mx-4 shrink-0 overflow-x-auto custom-scrollbar no-scrollbar">
        {COLUMNS.map(col => (
          <button 
            key={col.id} 
            onClick={() => setActiveTab(col.id)}
            className={`flex-1 min-w-[80px] py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${activeTab === col.id ? "bg-white dark:bg-zinc-900 text-slate-900 dark:text-white shadow-lg" : "text-slate-400 dark:text-zinc-600"}`}
          >
            {col.label} ({columnJobs[col.id]?.length || 0})
          </button>
        ))}
      </div>

      <div 
        className={`flex-1 overflow-hidden relative ${viewType === 'board' ? 'cursor-grab' : ''} ${isDraggingScroll ? 'cursor-grabbing active:scale-[0.998] transition-transform duration-500' : ''}`}
        onMouseDown={handleMouseDown}
        onMouseLeave={handleMouseLeaveOrUp}
        onMouseUp={handleMouseLeaveOrUp}
        onMouseMove={handleMouseMove}
      >
        {viewType === 'board' ? (
          <div 
            ref={scrollContainerRef}
            className="absolute inset-0 overflow-x-auto overflow-y-hidden custom-scrollbar scroll-smooth"
          >
            <div className="flex justify-center md:justify-start w-full md:min-w-max h-full pb-8 px-4 md:px-10">
              <div className="flex justify-center md:justify-start w-full max-w-md md:max-w-none md:w-auto h-full md:pr-20">
                {COLUMNS.map((column, idx) => (
                  <div key={column.id} className="flex h-full group/col">
                    {/* Vertical Separator Line */}
                    {idx > 0 && <div className="w-[1px] h-full bg-gradient-to-b from-slate-300/10 via-slate-300/60 to-slate-300/10 dark:from-zinc-800/10 dark:via-zinc-800/40 dark:to-zinc-800/10 shrink-0" />}
                    
                    <div onDragOver={(e) => handleDragOver(e, column.id)} onDrop={(e) => handleDrop(e, column.id)} onDragLeave={() => setTargetColumn(null)} className={`flex flex-col w-full md:w-[300px] h-full transition-all duration-500 relative ${targetColumn === column.id ? "bg-slate-200/10 dark:bg-white/[0.02]" : "bg-transparent"} ${activeTab === column.id ? "flex" : "hidden md:flex"}`}>
                      
                      {/* Column Header */}
                      <div className="flex items-center justify-between px-5 py-4 shrink-0 relative">
                        <div className="flex items-center gap-4">
                          <div className={`w-2 h-2 rounded-full ${ACCENT_COLORS[column.color]} shadow-[0_0_10px_rgba(0,0,0,0.2)] dark:shadow-[0_0_10px_rgba(0,0,0,0.5)] ${GLOW_ACCENTS[column.color]}`} />
                          <h2 className={`text-[11px] font-bold uppercase tracking-[0.3em] ${column.color === 'zinc' ? 'text-slate-400 dark:text-zinc-400' : TEXT_ACCENTS[column.color]}`}>{column.label}</h2>
                        </div>
                        <span className="text-[9px] font-bold text-slate-400 dark:text-zinc-700 bg-slate-100 dark:bg-zinc-900/50 px-2 py-0.5 rounded-md border border-slate-200 dark:border-zinc-800/50">{columnJobs[column.id]?.length || 0}</span>
                      </div>

                      {/* Jobs Scroll Area */}
                      <div className="flex-1 overflow-y-auto px-4 space-y-3 pt-2 pb-12 custom-scrollbar">
                        {columnJobs[column.id]?.map((job) => {
                          const jaLocked = isJaLocked(job);
                          const clientHandled = isClientHandled(job);
                          const isBeingDragged = draggedJobId === job.id;
                          return (
                            <div key={job.id} draggable={!jaLocked} onDragStart={(e) => handleDragStart(e, job)} onDragEnd={() => setDraggedJobId(null)} className={`group relative flex flex-col w-full rounded-3xl border transition-all duration-300 ${isBeingDragged ? "opacity-10 scale-95" : "bg-white dark:bg-zinc-900/30 border-slate-200 dark:border-zinc-800/60 hover:border-slate-300 dark:hover:border-zinc-700 hover:bg-slate-50 dark:hover:bg-zinc-900/50 cursor-grab active:cursor-grabbing shadow-sm hover:shadow-xl dark:shadow-lg dark:hover:shadow-2xl"} p-5 md:p-4`}>
                              
                              {/* Top Bar for Badges */}
                              <div className="flex items-center justify-between mb-3 min-h-[20px]">
                                 <div className="flex items-center gap-2">
                                    {clientHandled ? (
                                      <span className="text-[7px] font-bold uppercase tracking-[0.15em] text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">Myself</span>
                                    ) : jaLocked ? (
                                      <span className="text-[7px] font-bold uppercase tracking-[0.15em] text-sky-600 dark:text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded border border-sky-500/20">JA Team Handled</span>
                                    ) : null}
                                 </div>
                                 <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    {showArchived ? (
                                      <button onClick={(e) => { e.stopPropagation(); handleRestore(job.id); }} className="p-1.5 rounded-lg hover:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 transition" title="Restore Job">
                                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                                      </button>
                                    ) : (
                                      <button onClick={(e) => { e.stopPropagation(); handleArchive(job.id); }} className="p-1.5 rounded-lg hover:bg-red-500/10 text-red-600 dark:text-red-400 transition" title="Archive Job">
                                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                      </button>
                                    )}
                                 </div>
                                 {(job.match_score ?? 0) > 0 && (
                                   <div className="px-2 py-0.5 rounded-md bg-slate-50 dark:bg-zinc-950 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-[8px] font-bold shadow-sm">
                                      {job.match_score}% Match
                                   </div>
                                 )}
                              </div>
                              
                              <div className="space-y-3">
                                <div className="space-y-1.5">
                                  <h3 className="text-[13px] font-semibold text-slate-800 dark:text-zinc-100 leading-snug group-hover:text-slate-900 dark:group-hover:text-white transition-colors tracking-tight line-clamp-2">{job.job_title}</h3>
                                  <div className="flex items-center gap-2">
                                     <p className="text-[11px] font-medium text-slate-500 dark:text-zinc-500 truncate">{job.company}</p>
                                     <span className="text-slate-300 dark:text-zinc-800 text-[10px]">•</span>
                                     <p className="text-[11px] font-medium text-slate-400 dark:text-zinc-600 truncate">{job.location || "Remote"}</p>
                                  </div>
                                </div>
                                
                                <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-zinc-800/30">
                                   <div className="flex items-center gap-3">
                                      {job.apply_link && (
                                        <a href={job.apply_link} target="_blank" rel="noopener noreferrer" className="w-10 h-10 md:w-8 md:h-8 flex items-center justify-center rounded-xl bg-slate-50 dark:bg-zinc-950/50 border border-slate-200 dark:border-zinc-800 text-slate-400 dark:text-zinc-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-900 transition-all" onClick={(e) => e.stopPropagation()}>
                                          <svg className="w-4 h-4 md:w-3 md:h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                                        </a>
                                      )}
                                      <button onClick={(e) => { e.stopPropagation(); setEditingNoteJob(job); setNoteContent(job.notes || ""); }} className={`w-10 h-10 md:w-8 md:h-8 flex items-center justify-center rounded-xl border transition-all ${job.notes ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400' : 'bg-slate-50 dark:bg-zinc-950/50 border border-slate-200 dark:border-zinc-800 text-slate-300 dark:text-zinc-700 hover:text-slate-600 dark:hover:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-900'}`}>
                                         <svg className="w-4 h-4 md:w-3 md:h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                                      </button>
                                   </div>
                                   <div className="flex flex-col items-end">
                                      <span className="text-[8px] font-bold text-slate-300 dark:text-zinc-700 uppercase tracking-widest">{formatDateTime(job.created_at || job.assigned_at)}</span>
                                   </div>
                                </div>

                                {/* Mobile Status Action Button */}
                                {!jaLocked && !showArchived && (
                                   <div className="md:hidden mt-2 pt-4 border-t border-slate-100 dark:border-zinc-800/30">
                                      {job.status === 'saved' || job.status === 'queued' ? (
                                         <button onClick={(e) => { e.stopPropagation(); updateJobStatus(job.id, 'applied'); }} className="w-full h-12 rounded-2xl bg-violet-600 text-white text-[10px] font-black uppercase tracking-widest hover:bg-violet-500 transition shadow-lg shadow-violet-600/20 flex items-center justify-center gap-2">
                                            Confirm Applied
                                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
                                         </button>
                                      ) : job.status === 'applied' ? (
                                         <button onClick={(e) => { e.stopPropagation(); updateJobStatus(job.id, 'interviewing'); }} className="w-full h-12 rounded-2xl bg-amber-600 text-white text-[10px] font-black uppercase tracking-widest hover:bg-amber-500 transition shadow-lg shadow-amber-600/20 flex items-center justify-center gap-2">
                                            Move to Outcome
                                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
                                         </button>
                                      ) : null}
                                   </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                        {columnJobs[column.id]?.length === 0 && (
                          <div className="h-40 border-2 border-dashed border-slate-200 dark:border-zinc-900/50 rounded-[2rem] flex flex-col items-center justify-center space-y-2 opacity-50 dark:opacity-20">
                             <span className="text-xl">{column.icon}</span>
                             <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400">No roles here</span>
                          </div>
                        )}
                      </div>
                      
                      {/* Column Footer Detail */}
                      <div className="absolute bottom-6 left-0 right-0 px-8 flex justify-between items-center text-[8px] font-bold text-slate-300 dark:text-zinc-800 uppercase tracking-widest opacity-60 dark:opacity-40">
                        <span>{column.label}</span>
                        <span>{columnJobs[column.id]?.length || 0} ITEMS</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="absolute inset-0 overflow-y-auto custom-scrollbar pr-2 pb-20">
            <div className="w-full space-y-4">
              <div className="hidden lg:block w-full border border-slate-200 dark:border-zinc-800/50 rounded-[2rem] overflow-hidden bg-white/70 dark:bg-zinc-900/20 backdrop-blur-xl shadow-2xl">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-zinc-950/40 border-b border-slate-200 dark:border-zinc-800/50">
                      <th className="px-8 py-5 text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-widest">Job Position</th>
                      <th className="px-8 py-5 text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-widest">Company</th>
                      <th className="px-8 py-5 text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-widest text-center">Current Status</th>
                      <th className="px-8 py-5 text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-widest text-right">Update Frequency</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/30">
                    {filteredJobs.map((job) => {
                      const column = COLUMNS.find(c => c.statuses.includes(job.status));
                      const isPersonal = job.source === "client_selected" || job.source === "manual_ja";
                      const isLocked = JA_HANDLED_STATUSES.includes(job.status);
                      return (
                        <tr key={job.id} className="hover:bg-slate-50/50 dark:hover:bg-white/[0.02] transition-colors group">
                          <td className="px-8 py-5">
                            <div className="flex items-start gap-3">
                              <div className="flex flex-col gap-1 min-w-0">
                                <div className="flex items-center gap-3">
                                  <span className="text-[15px] font-semibold text-slate-900 dark:text-zinc-100 truncate tracking-tight">{job.job_title}</span>
                                  {isLocked && (<span className="text-[8px] font-bold uppercase tracking-widest text-sky-600 dark:text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded border border-sky-500/20">Active Concierge</span>)}
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="text-[11px] font-medium text-slate-500 dark:text-zinc-600">{job.location || "Remote"}</span>
                                  {isPersonal && <span className="text-[8px] font-bold text-emerald-600 dark:text-emerald-400/60 uppercase tracking-widest bg-emerald-500/10 px-1.5 rounded">Manual</span>}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-8 py-5">
                            <span className="text-[13px] font-semibold text-slate-500 dark:text-zinc-500">{job.company || "Not Specified"}</span>
                          </td>
                          <td className="px-8 py-5 text-center">
                            <span className={`px-4 py-1 rounded-xl text-[9px] font-bold uppercase tracking-[0.2em] border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950/50 ${column?.color === 'zinc' ? 'text-slate-400 dark:text-zinc-400' : TEXT_ACCENTS[column?.color || 'zinc']}`}>{column?.label || job.status}</span>
                          </td>
                          <td className="px-8 py-5">
                            <div className="flex items-center justify-end gap-6">
                              <span className="text-[9px] font-bold text-slate-300 dark:text-zinc-700 uppercase tracking-widest">{formatDateTime(job.created_at || job.assigned_at)}</span>
                              <div className="flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-all duration-300">
                                {job.apply_link && (
                                  <a href={job.apply_link} target="_blank" rel="noopener noreferrer" className="p-2 rounded-xl bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-slate-400 dark:text-zinc-500 hover:text-slate-900 dark:hover:text-white transition-all">
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                                  </a>
                                )}
                                <button onClick={() => { setEditingNoteJob(job); setNoteContent(job.notes || ""); }} className={`p-2 rounded-xl border transition-all ${job.notes ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400' : 'bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-slate-300 dark:text-zinc-600 hover:text-slate-900 dark:hover:text-white'}`}>
                                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                                </button>
                                
                                {showArchived ? (
                                  <button onClick={() => handleRestore(job.id)} className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 transition-all" title="Restore">
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                                  </button>
                                ) : (
                                  <button onClick={() => handleArchive(job.id)} className="p-2 rounded-xl bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 hover:bg-red-500/20 transition-all" title="Archive">
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                  </button>
                                )}
                              </div>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <div className="lg:hidden space-y-3 pb-24">
                 {filteredJobs.map((job) => {
                    const column = COLUMNS.find(c => c.statuses.includes(job.status));
                    const isPersonal = job.source === "client_selected" || job.source === "manual_ja";
                    const isLocked = JA_HANDLED_STATUSES.includes(job.status);
                     return (
                       <div key={job.id} className="bg-white dark:bg-zinc-900/40 border border-slate-200 dark:border-zinc-800/60 rounded-[1.5rem] p-5 space-y-5">
                         <div className="flex justify-between items-start gap-4">
                           <div className="space-y-1"><h3 className="text-sm font-semibold text-slate-900 dark:text-white tracking-tight leading-snug">{job.job_title}</h3><p className="text-[11px] font-medium text-slate-500 dark:text-zinc-500">{job.company} • {job.location || "Remote"}</p></div>
                           <span className={`shrink-0 px-3 py-1 rounded-full text-[8px] font-bold uppercase tracking-widest border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950/50 ${column?.color === 'zinc' ? 'text-slate-400 dark:text-zinc-400' : TEXT_ACCENTS[column?.color || 'zinc']}`}>{column?.label || job.status}</span>
                         </div>
                         <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-zinc-800/30">
                            <div className="flex flex-col gap-1"><span className="text-[9px] font-bold text-slate-300 dark:text-zinc-700 uppercase tracking-widest">{formatDateTime(job.created_at || job.assigned_at)}</span>{isLocked ? ( <span className="text-[7px] font-bold uppercase tracking-widest text-sky-600 dark:text-sky-400">JA Team</span> ) : isPersonal ? ( <span className="text-[7px] font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-500/50">Personal</span> ) : null}</div>
                            <div className="flex items-center gap-2">
                               {job.apply_link && <a href={job.apply_link} target="_blank" rel="noopener noreferrer" className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 text-slate-400 dark:text-zinc-500"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg></a>}
                               <button onClick={() => { setEditingNoteJob(job); setNoteContent(job.notes || ""); }} className={`w-10 h-10 flex items-center justify-center rounded-xl border transition-all ${job.notes ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400' : 'bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 text-slate-400 dark:text-zinc-600'}`}><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg></button>
                            </div>
                         </div>
                       </div>
                    );
                 })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

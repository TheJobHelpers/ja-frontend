"use client";

import React, { useState, useCallback } from "react";

/* ─── Mock Data ───────────────────────────────────────────────── */

interface ExtractedProfile {
  name: string;
  title: string;
  skills: string[];
  experience: string;
  education: string;
  preferredRoles: string[];
  preferredLocations: string[];
}

interface AgentStrategy {
  id: string;
  label: string;
  query: string;
  engine: string;
  status: "pending" | "running" | "complete";
  resultCount: number;
}

interface AgentResult {
  id: string;
  job_title: string;
  company: string;
  location: string;
  salary: string;
  remote: boolean;
  posted: string;
  matchScore: number;
  matchReasons: string[];
  skillsMatched: string[];
  skillsMissing: string[];
  applyLink: string;
  saved: boolean;
  dismissed: boolean;
}

const MOCK_PROFILE: ExtractedProfile = {
  name: "John Doe",
  title: "Senior Frontend Engineer",
  skills: ["React", "TypeScript", "Next.js", "Node.js", "Tailwind CSS", "GraphQL", "AWS", "Docker", "CI/CD", "PostgreSQL"],
  experience: "6 years",
  education: "B.Sc. Computer Science",
  preferredRoles: ["Senior Frontend Engineer", "Full Stack Developer", "Staff Engineer"],
  preferredLocations: ["Remote", "San Francisco", "New York"],
};

const MOCK_STRATEGIES: AgentStrategy[] = [
  { id: "s1", label: "Exact Title Match", query: "Senior Frontend Engineer", engine: "LinkedIn", status: "complete", resultCount: 8 },
  { id: "s2", label: "Skill-Based Search", query: "React TypeScript Next.js Node.js", engine: "JSearch", status: "complete", resultCount: 12 },
  { id: "s3", label: "Alternative Titles", query: "Staff Engineer OR UI Engineer OR Web Developer", engine: "LinkedIn", status: "complete", resultCount: 5 },
  { id: "s4", label: "Industry Focus", query: "Frontend Engineer fintech SaaS", engine: "Indeed", status: "complete", resultCount: 6 },
  { id: "s5", label: "Seniority Flex", query: "Lead Frontend Developer OR Principal Engineer", engine: "JSearch", status: "complete", resultCount: 3 },
];

const MOCK_RESULTS: AgentResult[] = [
  {
    id: "r1", job_title: "Senior Frontend Engineer", company: "Stripe", location: "Remote (US)", salary: "$180K - $220K", remote: true, posted: "2 days ago", matchScore: 96,
    matchReasons: ["All core skills matched", "Experience level aligned", "Remote preference matched", "Salary within range"],
    skillsMatched: ["React", "TypeScript", "Next.js", "Node.js", "Tailwind CSS", "GraphQL"],
    skillsMissing: [], applyLink: "#", saved: false, dismissed: false,
  },
  {
    id: "r2", job_title: "Staff Frontend Engineer", company: "Vercel", location: "Remote", salary: "$200K - $260K", remote: true, posted: "1 day ago", matchScore: 94,
    matchReasons: ["Strong skill overlap", "Higher seniority — growth opportunity", "Remote match", "Company aligned with Next.js expertise"],
    skillsMatched: ["React", "TypeScript", "Next.js", "Node.js", "Tailwind CSS"],
    skillsMissing: ["Rust"], applyLink: "#", saved: false, dismissed: false,
  },
  {
    id: "r3", job_title: "Senior Full Stack Developer", company: "Plaid", location: "San Francisco, CA", salary: "$170K - $210K", remote: false, posted: "3 days ago", matchScore: 89,
    matchReasons: ["Strong skill match", "Full stack role aligns with Node.js + React", "Location match"],
    skillsMatched: ["React", "TypeScript", "Node.js", "PostgreSQL", "Docker"],
    skillsMissing: ["Python", "Kubernetes"], applyLink: "#", saved: false, dismissed: false,
  },
  {
    id: "r4", job_title: "Frontend Engineer — Fintech", company: "Robinhood", location: "New York, NY", salary: "$160K - $200K", remote: false, posted: "5 days ago", matchScore: 85,
    matchReasons: ["Core frontend skills matched", "Location preference aligned", "Fintech exposure valuable"],
    skillsMatched: ["React", "TypeScript", "GraphQL", "Tailwind CSS"],
    skillsMissing: ["Redux", "D3.js"], applyLink: "#", saved: false, dismissed: false,
  },
  {
    id: "r5", job_title: "UI Engineer", company: "Notion", location: "Remote (US)", salary: "$175K - $215K", remote: true, posted: "1 week ago", matchScore: 82,
    matchReasons: ["React expertise aligned", "Remote match", "Strong design system focus"],
    skillsMatched: ["React", "TypeScript", "CSS", "Node.js"],
    skillsMissing: ["Figma", "Storybook", "Web Components"], applyLink: "#", saved: false, dismissed: false,
  },
  {
    id: "r6", job_title: "Lead Frontend Developer", company: "Datadog", location: "New York, NY", salary: "$190K - $240K", remote: false, posted: "4 days ago", matchScore: 78,
    matchReasons: ["Leadership role — experience aligned", "Strong React/TS match", "Location match"],
    skillsMatched: ["React", "TypeScript", "Node.js", "Docker", "CI/CD"],
    skillsMissing: ["Ember.js", "Team management experience"], applyLink: "#", saved: false, dismissed: false,
  },
  {
    id: "r7", job_title: "React Developer", company: "Shopify", location: "Remote (Worldwide)", salary: "$140K - $180K", remote: true, posted: "6 days ago", matchScore: 74,
    matchReasons: ["Good skill overlap", "Remote match", "Slightly below seniority level"],
    skillsMatched: ["React", "TypeScript", "Node.js", "GraphQL"],
    skillsMissing: ["Ruby", "Polaris"], applyLink: "#", saved: false, dismissed: false,
  },
];

/* ─── Component Helpers ───────────────────────────────────────── */

const formatCommas = (num: string | number) => {
  const n = typeof num === "string" ? num.replace(/,/g, "") : num.toString();
  if (!n || isNaN(Number(n))) return n;
  return new Intl.NumberFormat("en-US").format(Number(n));
};

function MatchScoreBadge({ score }: { score: number }) {
  const color =
    score >= 90 ? "from-emerald-400 to-teal-400 text-emerald-950" :
    score >= 80 ? "from-sky-400 to-cyan-400 text-sky-950" :
    score >= 70 ? "from-amber-400 to-yellow-400 text-amber-950" :
    "from-zinc-400 to-zinc-500 text-zinc-950";

  return (
    <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${color} text-sm font-black shadow-lg`}>
      {score}%
    </div>
  );
}

function SkillTag({ skill, matched }: { skill: string; matched: boolean }) {
  return (
    <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold ${
      matched
        ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-300"
        : "bg-red-500/10 border border-red-500/20 text-red-300"
    }`}>
      {matched ? "✓" : "✗"} {skill}
    </span>
  );
}

/* ─── Step Indicators ─────────────────────────────────────────── */

type Step = "upload" | "review" | "running" | "results";

function StepIndicator({ current }: { current: Step }) {
  const steps: { key: Step; label: string; num: number }[] = [
    { key: "upload", label: "Upload Documents", num: 1 },
    { key: "review", label: "Review Profile", num: 2 },
    { key: "running", label: "Agent Running", num: 3 },
    { key: "results", label: "Results", num: 4 },
  ];
  const currentIdx = steps.findIndex((s) => s.key === current);

  return (
    <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-black/30 px-4 py-3">
      {steps.map((step, idx) => (
        <React.Fragment key={step.key}>
          {idx > 0 && <div className={`h-px flex-1 ${idx <= currentIdx ? "bg-emerald-500/40" : "bg-zinc-700/60"}`} />}
          <div className="flex items-center gap-2">
            <div className={`flex h-7 w-7 items-center justify-center rounded-full text-[13px] leading-none ${
              idx < currentIdx ? "bg-emerald-500/20 text-emerald-300" :
              idx === currentIdx ? "bg-emerald-500/30 text-emerald-200 ring-2 ring-emerald-400/30" :
              "bg-zinc-800 text-zinc-500"
            }`}>
              {idx < currentIdx ? "✓" : step.num}
            </div>
            <span className={`hidden text-[11px] font-medium sm:inline ${
              idx <= currentIdx ? "text-zinc-200" : "text-zinc-500"
            }`}>
              {step.label}
            </span>
          </div>
        </React.Fragment>
      ))}
    </div>
  );
}

/* ─── Main Page ───────────────────────────────────────────────── */

export default function AgentSearchPage() {
  const [step, setStep] = useState<Step>("upload");
  const [uploadedFiles, setUploadedFiles] = useState<{ name: string; type: string; size: string }[]>([]);
  const [profile, setProfile] = useState<ExtractedProfile | null>(null);
  const [strategies, setStrategies] = useState<AgentStrategy[]>([]);
  const [results, setResults] = useState<AgentResult[]>([]);
  const [agentProgress, setAgentProgress] = useState(0);
  const [sortBy, setSortBy] = useState<"match" | "salary" | "recent">("match");
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Search configuration state
  const [searchConfig, setSearchConfig] = useState({
    salaryMin: "80000",
    salaryMax: "250000",
    workType: "" as string,
    experienceLevel: "" as string,
    maxResults: 25,
    engines: { linkedin: true, jsearch: true, indeed: true },
    includeRemote: true,
    minMatchScore: 60,
  });

  // Load saved config on mount
  React.useEffect(() => {
    const saved = localStorage.getItem("tjh_agent_config");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setSearchConfig((prev) => ({ ...prev, ...parsed }));
      } catch (e) {
        console.error("Failed to parse saved config", e);
      }
    }
  }, []);

  const handleSaveConfig = useCallback(() => {
    setIsSaving(true);
    localStorage.setItem("tjh_agent_config", JSON.stringify(searchConfig));
    
    // Simulate save delay
    setTimeout(() => {
      setIsSaving(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);
    }, 600);
  }, [searchConfig]);

  // Mock file upload
  const handleFileDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    const newFiles = files.map((f) => ({
      name: f.name,
      type: f.type.includes("pdf") ? "PDF" : f.type.includes("doc") ? "DOCX" : "File",
      size: `${(f.size / 1024).toFixed(0)} KB`,
    }));
    setUploadedFiles((prev) => [...prev, ...newFiles]);
  }, []);

  const handleFileSelect = useCallback(() => {
    setUploadedFiles([
      { name: "John_Doe_Resume_2026.pdf", type: "PDF", size: "245 KB" },
    ]);
  }, []);

  const handleAddCoverLetter = useCallback(() => {
    setUploadedFiles((prev) => [
      ...prev,
      { name: "Cover_Letter_Frontend.pdf", type: "PDF", size: "89 KB" },
    ]);
  }, []);

  // Mock profile extraction
  const handleAnalyze = useCallback(() => {
    setStep("review");
    setProfile(MOCK_PROFILE);
  }, []);

  // Mock agent run
  const handleLaunchAgent = useCallback(() => {
    setStep("running");
    setStrategies(MOCK_STRATEGIES.map((s) => ({ ...s, status: "pending", resultCount: 0 })));
    setAgentProgress(0);

    const totalStrategies = MOCK_STRATEGIES.length;
    MOCK_STRATEGIES.forEach((strategy, idx) => {
      setTimeout(() => {
        setStrategies((prev) =>
          prev.map((s) =>
            s.id === strategy.id ? { ...s, status: "running" as const } : s
          )
        );
      }, idx * 800);

      setTimeout(() => {
        setStrategies((prev) =>
          prev.map((s) =>
            s.id === strategy.id ? { ...strategy, status: "complete" as const } : s
          )
        );
        setAgentProgress(Math.round(((idx + 1) / totalStrategies) * 100));
      }, idx * 800 + 600);
    });

    setTimeout(() => {
      setStep("results");
      setResults(MOCK_RESULTS);
    }, totalStrategies * 800 + 1000);
  }, []);

  // Result actions
  const handleSave = useCallback((id: string) => {
    let jobToSave: any = null;
    
    setResults((prev) =>
      prev.map((r) => {
        if (r.id === id) {
          const newState = !r.saved;
          if (newState) jobToSave = r;
          return { ...r, saved: newState };
        }
        return r;
      })
    );

    // Persist to Tracker storage
    if (jobToSave) {
      const savedJobs = JSON.parse(localStorage.getItem("tjh_tracker_jobs") || "[]");
      // Prevent duplicates
      if (!savedJobs.find((j: any) => j.id === id)) {
        const newJob = {
          id: jobToSave.id,
          job_title: jobToSave.title,
          company: jobToSave.company,
          location: jobToSave.location,
          status: "assigned", // User requested these be "assigned"
          origin: "admin_assigned", // So JA team "handles" them
          match_score: jobToSave.matchScore,
          saved_at: new Date().toISOString().split("T")[0],
          apply_link: "#",
        };
        localStorage.setItem("tjh_tracker_jobs", JSON.stringify([...savedJobs, newJob]));
      }
    } else {
      // Handle "unsave" if needed (optional for mock, but let's be thorough)
      const savedJobs = JSON.parse(localStorage.getItem("tjh_tracker_jobs") || "[]");
      localStorage.setItem("tjh_tracker_jobs", JSON.stringify(savedJobs.filter((j: any) => j.id !== id)));
    }
  }, []);

  const handleDismiss = useCallback((id: string) => {
    setResults((prev) =>
      prev.map((r) => (r.id === id ? { ...r, dismissed: true } : r))
    );
  }, []);

  const visibleResults = results
    .filter((r) => !r.dismissed)
    .sort((a, b) =>
      sortBy === "match" ? b.matchScore - a.matchScore :
      sortBy === "recent" ? 0 :
      0
    );

  const savedCount = results.filter((r) => r.saved).length;
  const activeEngines = Object.values(searchConfig.engines).filter(Boolean).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-2xl font-bold text-zinc-100">AI Agent Search</h1>
            <span className="rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-400 animate-pulse">
              Beta
            </span>
          </div>
          <p className="text-sm text-zinc-400">
            Upload your resume and let our AI agent find the best matching jobs across all platforms
          </p>
        </div>
        {step === "results" && (
          <div className="flex items-center gap-2 text-xs text-zinc-400">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            {visibleResults.length} results · {savedCount} saved
          </div>
        )}
      </div>

      {/* Step Indicator */}
      <StepIndicator current={step} />

      {/* ── Step 1: Upload ──────────────────────────────────────── */}
      {step === "upload" && (
        <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
          <div className="space-y-4">
            {/* Drop Zone */}
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleFileDrop}
              className="flex flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed border-zinc-700 bg-zinc-900/30 px-8 py-16 transition hover:border-emerald-500/40 hover:bg-emerald-500/5"
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/10">
                <svg className="h-7 w-7 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                </svg>
              </div>
              <div className="text-center">
                <p className="text-sm font-semibold text-zinc-200">Drop your resume here</p>
                <p className="mt-1 text-xs text-zinc-400">PDF, DOCX — Max 10MB</p>
              </div>
              <button
                onClick={handleFileSelect}
                className="rounded-lg bg-emerald-500/10 border border-emerald-500/20 px-5 py-2 text-xs font-semibold text-emerald-300 transition hover:bg-emerald-500/20"
              >
                Or browse files
              </button>
            </div>

            {/* Uploaded Files */}
            {uploadedFiles.length > 0 && (
              <div className="space-y-2">
                {uploadedFiles.map((file, idx) => (
                  <div key={idx} className="flex items-center gap-3 rounded-xl border border-zinc-800 bg-zinc-900/50 px-4 py-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-500/10 text-red-400 text-[10px] font-bold">
                      {file.type}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-zinc-100 truncate">{file.name}</p>
                      <p className="text-[11px] text-zinc-500">{file.size}</p>
                    </div>
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 text-[10px] font-semibold text-emerald-300">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                      Uploaded
                    </span>
                  </div>
                ))}

                <button
                  onClick={handleAddCoverLetter}
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-zinc-700 text-xs font-medium text-zinc-400 py-3 transition hover:border-zinc-600 hover:text-zinc-300"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                  </svg>
                  Add more documents (cover letter, certifications)
                </button>
              </div>
            )}

            {/* CTA */}
            {uploadedFiles.length > 0 && (
              <button
                onClick={handleAnalyze}
                className="w-full rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 py-3 text-sm font-bold text-white shadow-[0_8px_30px_rgba(16,185,129,0.3)] transition hover:from-emerald-400 hover:to-teal-400"
              >
                Analyze Documents →
              </button>
            )}
          </div>

          {/* Tips sidebar */}
          <div className="space-y-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-400">How it works</p>
            {[
              { icon: "📄", title: "Upload your resume", desc: "PDF or DOCX — the agent reads your skills, experience, and career trajectory" },
              { icon: "🤖", title: "AI analyzes your profile", desc: "Extracts skills, identifies target roles, and builds search strategies" },
              { icon: "🔍", title: "Multi-engine search", desc: "Runs 5+ strategies across LinkedIn, JSearch, and Indeed simultaneously" },
              { icon: "⭐", title: "Ranked results", desc: "Jobs scored by how well they match your unique profile" },
            ].map((tip) => (
              <div key={tip.title} className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4">
                <div className="flex items-start gap-3">
                  <span className="text-lg">{tip.icon}</span>
                  <div>
                    <p className="text-xs font-semibold text-zinc-200">{tip.title}</p>
                    <p className="mt-0.5 text-[11px] text-zinc-400 leading-relaxed">{tip.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Step 2: Review Profile + Configure ─────────────────── */}
      {step === "review" && profile && (
        <div className="space-y-6">
          {/* Extracted Profile Card */}
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 text-lg font-bold text-white">
                {profile.name.charAt(0)}
              </div>
              <div>
                <h2 className="text-lg font-semibold text-zinc-100">{profile.name}</h2>
                <p className="text-sm text-zinc-400">{profile.title} · {profile.experience} experience</p>
              </div>
              <span className="ml-auto inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 text-[11px] font-semibold text-emerald-300">
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                Profile Extracted
              </span>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-zinc-400">Skills Detected</p>
                <div className="flex flex-wrap gap-1.5">
                  {profile.skills.map((skill) => (
                    <span key={skill} className="rounded-full bg-emerald-500/10 border border-emerald-500/15 px-2.5 py-1 text-[11px] font-medium text-emerald-300">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-zinc-400">Target Roles</p>
                <div className="flex flex-wrap gap-1.5">
                  {profile.preferredRoles.map((role) => (
                    <span key={role} className="rounded-full bg-sky-500/10 border border-sky-500/15 px-2.5 py-1 text-[11px] font-medium text-sky-300">
                      {role}
                    </span>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-zinc-400">Preferred Locations</p>
                <div className="flex flex-wrap gap-1.5">
                  {profile.preferredLocations.map((loc) => (
                    <span key={loc} className="rounded-full bg-violet-500/10 border border-violet-500/15 px-2.5 py-1 text-[11px] font-medium text-violet-300">
                      {loc}
                    </span>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-zinc-400">Education</p>
                <p className="text-sm text-zinc-200">{profile.education}</p>
              </div>
            </div>
          </div>

          {/* ── Search Configuration ─────────────────────────────── */}
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6">
            <div className="flex items-center gap-2 mb-5">
              <svg className="h-5 w-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <h3 className="text-sm font-semibold text-zinc-100">Search Configuration</h3>
              <div className="ml-auto flex items-center gap-3">
                <span className="text-[10px] text-zinc-500 hidden sm:inline">Fine-tune before launching</span>
                <button
                  onClick={handleSaveConfig}
                  disabled={isSaving}
                  className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[11px] font-bold transition ${
                    saveSuccess
                      ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                      : "bg-zinc-800 border border-zinc-700 text-zinc-300 hover:bg-zinc-700 hover:text-zinc-100"
                  }`}
                >
                  {isSaving ? (
                    <svg className="h-3 w-3 animate-spin" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                  ) : saveSuccess ? (
                    <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                    </svg>
                  )}
                  {isSaving ? "Saving..." : saveSuccess ? "Saved!" : "Save Config"}
                </button>
              </div>
            </div>

            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {/* Salary Range */}
              <div className="space-y-2">
                <label className="block text-[11px] font-medium uppercase tracking-[0.16em] text-zinc-400">Salary Range (USD)</label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[11px] text-zinc-500">$</span>
                    <input
                      type="text"
                      value={formatCommas(searchConfig.salaryMin)}
                      onChange={(e) => {
                        const val = e.target.value.replace(/,/g, "");
                        if (/^\d*$/.test(val)) {
                          setSearchConfig((p) => ({ ...p, salaryMin: val }));
                        }
                      }}
                      placeholder="Min"
                      className="w-full rounded-lg border border-white/20 bg-zinc-800/80 py-2 pl-7 pr-3 text-sm text-zinc-50 outline-none transition focus:border-emerald-400/50 focus:ring-1 focus:ring-emerald-500/30"
                    />
                  </div>
                  <span className="flex items-center text-zinc-600">—</span>
                  <div className="relative flex-1">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[11px] text-zinc-500">$</span>
                    <input
                      type="text"
                      value={formatCommas(searchConfig.salaryMax)}
                      onChange={(e) => {
                        const val = e.target.value.replace(/,/g, "");
                        if (/^\d*$/.test(val)) {
                          setSearchConfig((p) => ({ ...p, salaryMax: val }));
                        }
                      }}
                      placeholder="Max"
                      className="w-full rounded-lg border border-white/20 bg-zinc-800/80 py-2 pl-7 pr-3 text-sm text-zinc-50 outline-none transition focus:border-emerald-400/50 focus:ring-1 focus:ring-emerald-500/30"
                    />
                  </div>
                </div>
              </div>

              {/* Work Type */}
              <div className="space-y-2">
                <label className="block text-[11px] font-medium uppercase tracking-[0.16em] text-zinc-400">Work Style / Type</label>
                <select
                  value={searchConfig.workType}
                  onChange={(e) => setSearchConfig((p) => ({ ...p, workType: e.target.value }))}
                  className="w-full rounded-lg border border-white/20 bg-zinc-800/80 px-3 py-2 text-sm text-zinc-50 outline-none transition focus:border-emerald-400/50 focus:ring-1 focus:ring-emerald-500/30"
                >
                  <option value="">Any</option>
                  <option value="remote">Remote Only</option>
                  <option value="onsite">On-site</option>
                  <option value="hybrid">Hybrid</option>
                  <option value="fulltime">Full-time</option>
                  <option value="contract">Contract</option>
                </select>
              </div>

              {/* Experience Level */}
              <div className="space-y-2">
                <label className="block text-[11px] font-medium uppercase tracking-[0.16em] text-zinc-400">Experience Level</label>
                <select
                  value={searchConfig.experienceLevel}
                  onChange={(e) => setSearchConfig((p) => ({ ...p, experienceLevel: e.target.value }))}
                  className="w-full rounded-lg border border-white/20 bg-zinc-800/80 px-3 py-2 text-sm text-zinc-50 outline-none transition focus:border-emerald-400/50 focus:ring-1 focus:ring-emerald-500/30"
                >
                  <option value="">Any Level</option>
                  <option value="entry">Entry Level (0-2 yrs)</option>
                  <option value="mid">Mid Level (3-5 yrs)</option>
                  <option value="senior">Senior (5-8 yrs)</option>
                  <option value="staff">Staff / Lead (8+ yrs)</option>
                  <option value="principal">Principal / Director</option>
                </select>
              </div>

              {/* Min Match Score */}
              <div className="space-y-2">
                <label className="block text-[11px] font-medium uppercase tracking-[0.16em] text-zinc-400">
                  Min Match Score — <span className="text-emerald-400 font-bold">{searchConfig.minMatchScore}%</span>
                </label>
                <input
                  type="range"
                  min="30"
                  max="95"
                  step="5"
                  value={searchConfig.minMatchScore}
                  onChange={(e) => setSearchConfig((p) => ({ ...p, minMatchScore: parseInt(e.target.value) }))}
                  className="w-full accent-emerald-500"
                />
                <div className="flex justify-between text-[10px] text-zinc-500">
                  <span>Broader (30%)</span>
                  <span>Stricter (95%)</span>
                </div>
              </div>

              {/* Max Results */}
              <div className="space-y-2">
                <label className="block text-[11px] font-medium uppercase tracking-[0.16em] text-zinc-400">
                  Max Results — <span className="text-emerald-400 font-bold">{searchConfig.maxResults}</span>
                </label>
                <input
                  type="range"
                  min="5"
                  max="50"
                  step="5"
                  value={searchConfig.maxResults}
                  onChange={(e) => setSearchConfig((p) => ({ ...p, maxResults: parseInt(e.target.value) }))}
                  className="w-full accent-emerald-500"
                />
                <div className="flex justify-between text-[10px] text-zinc-500">
                  <span>Focused (5)</span>
                  <span>Extensive (50)</span>
                </div>
              </div>

              {/* Include Remote */}
              <div className="space-y-2">
                <label className="block text-[11px] font-medium uppercase tracking-[0.16em] text-zinc-400">Remote Jobs</label>
                <button
                  onClick={() => setSearchConfig((p) => ({ ...p, includeRemote: !p.includeRemote }))}
                  className={`flex w-full items-center justify-between rounded-lg border px-3 py-2 text-sm transition ${
                    searchConfig.includeRemote
                      ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
                      : "border-white/20 bg-zinc-800/80 text-zinc-400"
                  }`}
                >
                  <span>{searchConfig.includeRemote ? "Include remote positions" : "Exclude remote positions"}</span>
                  <div className={`relative h-5 w-9 rounded-full transition ${searchConfig.includeRemote ? "bg-emerald-500" : "bg-zinc-600"}`}>
                    <div className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition ${searchConfig.includeRemote ? "left-[18px]" : "left-0.5"}`} />
                  </div>
                </button>
              </div>
            </div>

            {/* Search Engines */}
            <div className="mt-5 border-t border-zinc-800 pt-5">
              <p className="mb-3 text-[11px] font-medium uppercase tracking-[0.16em] text-zinc-400">
                Search Engines — <span className="text-emerald-400">{activeEngines} active</span>
              </p>
              <div className="flex flex-wrap gap-2">
                {([
                  { key: "linkedin" as const, label: "LinkedIn", color: "indigo", desc: "Professional network" },
                  { key: "jsearch" as const, label: "JSearch", color: "sky", desc: "Aggregated listings" },
                  { key: "indeed" as const, label: "Indeed", color: "emerald", desc: "Job board" },
                ] as const).map((engine) => {
                  const isActive = searchConfig.engines[engine.key];
                  const borderColor = isActive
                    ? engine.color === "indigo" ? "border-indigo-400/40 bg-indigo-500/10" :
                      engine.color === "sky" ? "border-sky-400/40 bg-sky-500/10" :
                      "border-emerald-400/40 bg-emerald-500/10"
                    : "border-zinc-700 bg-zinc-800/50";
                  const textColor = isActive
                    ? engine.color === "indigo" ? "text-indigo-300" :
                      engine.color === "sky" ? "text-sky-300" :
                      "text-emerald-300"
                    : "text-zinc-500";
                  const dotColor = isActive
                    ? engine.color === "indigo" ? "bg-indigo-400" :
                      engine.color === "sky" ? "bg-sky-400" :
                      "bg-emerald-400"
                    : "bg-zinc-600";

                  return (
                    <button
                      key={engine.key}
                      onClick={() => setSearchConfig((p) => ({
                        ...p,
                        engines: { ...p.engines, [engine.key]: !p.engines[engine.key] },
                      }))}
                      className={`flex items-center gap-2.5 rounded-xl border px-4 py-2.5 transition ${borderColor}`}
                    >
                      <div className={`h-2 w-2 rounded-full ${dotColor}`} />
                      <div className="text-left">
                        <p className={`text-xs font-semibold ${textColor}`}>{engine.label}</p>
                        <p className="text-[10px] text-zinc-500">{engine.desc}</p>
                      </div>
                      {isActive && (
                        <svg className={`ml-1 h-3.5 w-3.5 ${textColor}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={() => setStep("upload")}
              className="rounded-xl border border-zinc-700 bg-zinc-800/50 px-6 py-3 text-sm font-medium text-zinc-300 transition hover:bg-zinc-800"
            >
              ← Back
            </button>
            <button
              onClick={handleLaunchAgent}
              disabled={activeEngines === 0}
              className="flex-1 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 py-3 text-sm font-bold text-white shadow-[0_8px_30px_rgba(16,185,129,0.3)] transition hover:from-emerald-400 hover:to-teal-400 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              🚀 Launch Agent Search ({activeEngines} engine{activeEngines !== 1 ? "s" : ""})
            </button>
          </div>
        </div>
      )}

      {/* ── Step 3: Agent Running ──────────────────────────────── */}
      {step === "running" && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="h-3 w-3 rounded-full bg-emerald-400 animate-pulse" />
                <h2 className="text-lg font-semibold text-zinc-100">Agent is searching...</h2>
              </div>
              <span className="text-sm font-bold text-emerald-400">{agentProgress}%</span>
            </div>

            {/* Progress bar */}
            <div className="mb-6 h-1.5 w-full overflow-hidden rounded-full bg-zinc-800">
              <div
                className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-500"
                style={{ width: `${agentProgress}%` }}
              />
            </div>

            {/* Strategy cards */}
            <div className="space-y-2">
              {strategies.map((strategy) => (
                <div key={strategy.id} className={`flex items-center justify-between rounded-xl border px-4 py-3 transition ${
                  strategy.status === "complete" ? "border-emerald-500/20 bg-emerald-500/5" :
                  strategy.status === "running" ? "border-sky-500/20 bg-sky-500/5" :
                  "border-zinc-800 bg-zinc-900/30"
                }`}>
                  <div className="flex items-center gap-3">
                    <div className={`h-2 w-2 rounded-full ${
                      strategy.status === "complete" ? "bg-emerald-400" :
                      strategy.status === "running" ? "bg-sky-400 animate-pulse" :
                      "bg-zinc-600"
                    }`} />
                    <div>
                      <p className="text-xs font-semibold text-zinc-200">{strategy.label}</p>
                      <p className="text-[10px] text-zinc-500">&ldquo;{strategy.query}&rdquo; via {strategy.engine}</p>
                    </div>
                  </div>
                  {strategy.status === "complete" && (
                    <span className="text-[11px] font-semibold text-emerald-300">{strategy.resultCount} found</span>
                  )}
                  {strategy.status === "running" && (
                    <span className="text-[11px] text-sky-400 animate-pulse">Scanning...</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Step 4: Results ────────────────────────────────────── */}
      {step === "results" && (
        <div className="space-y-4">
          {/* Results header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h2 className="text-lg font-semibold text-zinc-100">
                {visibleResults.length} matches found
              </h2>
              <span className="text-xs text-zinc-500">from {MOCK_STRATEGIES.length} strategies across 3 engines</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-zinc-400">Sort:</span>
              {(["match", "salary", "recent"] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setSortBy(s)}
                  className={`rounded-full px-3 py-1 text-[11px] font-medium transition ${
                    sortBy === s
                      ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30"
                      : "bg-zinc-800/50 text-zinc-400 border border-zinc-700/50 hover:text-zinc-200"
                  }`}
                >
                  {s === "match" ? "Best Match" : s === "salary" ? "Salary" : "Most Recent"}
                </button>
              ))}
            </div>
          </div>

          {/* Action bar */}
          {savedCount > 0 && (
            <div className="flex items-center gap-3 rounded-xl border border-emerald-500/20 bg-emerald-500/5 px-4 py-2.5 text-[11px]">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              <span className="font-semibold text-emerald-200">{savedCount} job{savedCount !== 1 ? "s" : ""} saved</span>
              <span className="text-zinc-400">— These will appear in your My Jobs tracker</span>
            </div>
          )}

          {/* Result cards */}
          {visibleResults.map((job) => (
            <div
              key={job.id}
              className={`rounded-2xl border p-5 transition ${
                job.saved
                  ? "border-emerald-500/20 bg-emerald-500/5"
                  : "border-zinc-800 bg-zinc-900/50 hover:border-zinc-700"
              }`}
            >
              <div className="flex gap-4">
                {/* Score */}
                <MatchScoreBadge score={job.matchScore} />

                {/* Job Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-sm font-semibold text-zinc-100">{job.job_title}</h3>
                      <p className="mt-0.5 text-xs text-zinc-400">{job.company} · {job.location}</p>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      {job.remote && (
                        <span className="rounded-full bg-sky-500/10 border border-sky-500/20 px-2 py-0.5 text-[10px] font-semibold text-sky-300">Remote</span>
                      )}
                      <span className="text-xs font-semibold text-emerald-300">{job.salary}</span>
                    </div>
                  </div>

                  {/* Match reasons */}
                  <div className="mt-2 flex flex-wrap gap-1">
                    {job.matchReasons.slice(0, 3).map((reason, i) => (
                      <span key={i} className="inline-flex items-center gap-1 rounded-full bg-zinc-800/80 px-2 py-0.5 text-[10px] text-zinc-300">
                        <span className="text-emerald-400">✓</span> {reason}
                      </span>
                    ))}
                  </div>

                  {/* Skills */}
                  <div className="mt-3 flex flex-wrap gap-1">
                    {job.skillsMatched.map((skill) => (
                      <SkillTag key={skill} skill={skill} matched={true} />
                    ))}
                    {job.skillsMissing.map((skill) => (
                      <SkillTag key={skill} skill={skill} matched={false} />
                    ))}
                  </div>

                  {/* Actions */}
                  <div className="mt-3 flex items-center gap-2">
                    <button
                      onClick={() => handleSave(job.id)}
                      className={`inline-flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-bold transition ${
                        job.saved
                          ? "bg-sky-500/10 border border-sky-500/30 text-sky-400"
                          : "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20 hover:bg-emerald-400"
                      }`}
                    >
                      {job.saved ? (
                        <>
                          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                          Assigned to JA Team
                        </>
                      ) : (
                        "Assign to JA Team"
                      )}
                    </button>
                    <a href={job.applyLink} target="_blank" rel="noopener noreferrer"
                      className="rounded-lg bg-zinc-800/50 border border-zinc-700 px-3.5 py-1.5 text-xs font-medium text-zinc-300 transition hover:bg-zinc-800 hover:text-zinc-100">
                      Apply →
                    </a>
                    <button
                      onClick={() => handleDismiss(job.id)}
                      className="ml-auto rounded-lg px-3 py-1.5 text-xs text-zinc-500 transition hover:bg-red-500/10 hover:text-red-400">
                      Dismiss
                    </button>
                    <span className="text-[10px] text-zinc-500">{job.posted}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* Run again */}
          <div className="flex items-center justify-center gap-3 pt-4">
            <button
              onClick={() => { setStep("upload"); setResults([]); setUploadedFiles([]); setProfile(null); }}
              className="rounded-xl border border-zinc-700 bg-zinc-800/50 px-6 py-2.5 text-xs font-semibold text-zinc-300 transition hover:bg-zinc-800"
            >
              New Search
            </button>
            <button
              onClick={handleLaunchAgent}
              className="rounded-xl bg-emerald-500/10 border border-emerald-500/20 px-6 py-2.5 text-xs font-semibold text-emerald-300 transition hover:bg-emerald-500/20"
            >
              🔄 Re-run Agent
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

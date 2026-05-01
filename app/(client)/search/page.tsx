"use client";

import React, { useState, useLayoutEffect, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { Toast } from "../../components/Toast";



interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  city: string;
  state: string;
  country: string;
  salary: string;
  type: string;
  remote: boolean;
  posted: string;
  description: string;
  applyLink: string;
}

interface FormData {
  jobTitle: string;
  industry: string;
  salaryMin: string;
  salaryMax: string;
  jobType: string;
  employmentType: string;
  city: string;
  country: string;
  datePosted: string;
  startDate: string;
  endDate: string;
}

interface Country {
  code: string;
  name: string;
}

type SearchSource =
  | "jsearch"
  | "indeed"
  | "linkedin"
  | "linkedin/v2"
  | "reliefweb/v2"
  ;

const SOURCE_THEME: Record<
  SearchSource,
  {
    label: string;
    dotClass: string;
    buttonClass: string;
    progressOuterClass: string;
    progressDotClass: string;
    progressTrackClass: string;
    progressFillClass: string;
    stream: boolean;
    comingSoon?: boolean;
  }
> = {
  jsearch: {
    label: "JSearch",
    dotClass: "bg-sky-400 shadow-[0_0_14px_rgba(56,189,248,1)]",
    buttonClass:
      "border-sky-400/60 bg-slate-900 dark:bg-slate-900/60 shadow-[0_10px_35px_rgba(56,189,248,0.4)] hover:bg-slate-800 dark:hover:bg-slate-900/70",
    progressOuterClass:
      "border-sky-500/30 bg-sky-50 dark:bg-sky-950/20 text-sky-600 dark:text-sky-200",
    progressDotClass: "bg-sky-400",
    progressTrackClass: "bg-sky-900/50",
    progressFillClass: "bg-sky-400",
    stream: true,
  },
  indeed: {
    label: "Indeed",
    dotClass: "bg-emerald-400",
    buttonClass:
      "border-emerald-400/60 bg-slate-900 dark:bg-slate-900/60 shadow-[0_10px_30px_rgba(6,95,70,0.4)] hover:bg-slate-800 dark:hover:bg-slate-900/70",
    progressOuterClass:
      "border-emerald-500/30 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-200",
    progressDotClass: "bg-emerald-400",
    progressTrackClass: "bg-emerald-900/50",
    progressFillClass: "bg-emerald-400",
    stream: true,
  },
  linkedin: {
    label: "LinkedIn",
    dotClass: "bg-indigo-400",
    buttonClass:
      "border-indigo-400/60 bg-slate-900 dark:bg-slate-900/70 shadow-[0_10px_30px_rgba(30,64,175,0.3)] hover:bg-slate-800 dark:hover:bg-slate-900/80",
    progressOuterClass:
      "border-blue-500/30 bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-200",
    progressDotClass: "bg-blue-400",
    progressTrackClass: "bg-blue-900/50",
    progressFillClass: "bg-blue-400",
    stream: true,
  },
  "linkedin/v2": {
    label: "LinkedIn v2",
    dotClass: "bg-cyan-400",
    buttonClass:
      "border-cyan-400/60 bg-slate-900 dark:bg-slate-900/70 shadow-[0_10px_30px_rgba(34,211,238,0.28)] hover:bg-slate-800 dark:hover:bg-slate-900/80",
    progressOuterClass:
      "border-cyan-500/30 bg-cyan-50 dark:bg-cyan-950/20 text-cyan-600 dark:text-cyan-200",
    progressDotClass: "bg-cyan-400",
    progressTrackClass: "bg-cyan-900/50",
    progressFillClass: "bg-cyan-400",
    stream: false,
  },
  "reliefweb/v2": {
    label: "ReliefWeb v2",
    dotClass: "bg-teal-400",
    buttonClass:
      "border-teal-400/60 bg-slate-900 dark:bg-slate-900/70 shadow-[0_10px_30px_rgba(20,184,166,0.3)] hover:bg-slate-800 dark:hover:bg-slate-900/80",
    progressOuterClass:
      "border-teal-500/30 bg-teal-50 dark:bg-teal-950/20 text-teal-600 dark:text-teal-200",
    progressDotClass: "bg-teal-400",
    progressTrackClass: "bg-teal-900/50",
    progressFillClass: "bg-teal-400",
    stream: false,
  },
  
};

const SOURCE_ORDER: SearchSource[] = [
  "jsearch",
  "linkedin",
  "indeed",
  "linkedin/v2",
  "reliefweb/v2",
];

const getSourceLabel = (source: string | null | undefined) => {
  if (!source || !(source in SOURCE_THEME)) {
    return "Multiple";
  }

  return SOURCE_THEME[source as SearchSource].label;
};

const getSourceTheme = (source: string | null | undefined) => {
  if (!source || !(source in SOURCE_THEME)) {
    return null;
  }

  return SOURCE_THEME[source as SearchSource];
};

const isStreamingSource = (source: SearchSource) => SOURCE_THEME[source].stream;

// Complete list of countries with ISO codes (flags loaded from CDN)
const COUNTRIES: Country[] = [
  { code: "AF", name: "Afghanistan" },
  { code: "AL", name: "Albania" },
  { code: "DZ", name: "Algeria" },
  { code: "AD", name: "Andorra" },
  { code: "AO", name: "Angola" },
  { code: "AG", name: "Antigua and Barbuda" },
  { code: "AR", name: "Argentina" },
  { code: "AM", name: "Armenia" },
  { code: "AU", name: "Australia" },
  { code: "AT", name: "Austria" },
  { code: "AZ", name: "Azerbaijan" },
  { code: "BS", name: "Bahamas" },
  { code: "BH", name: "Bahrain" },
  { code: "BD", name: "Bangladesh" },
  { code: "BB", name: "Barbados" },
  { code: "BY", name: "Belarus" },
  { code: "BE", name: "Belgium" },
  { code: "BZ", name: "Belize" },
  { code: "BJ", name: "Benin" },
  { code: "BT", name: "Bhutan" },
  { code: "BO", name: "Bolivia" },
  { code: "BA", name: "Bosnia and Herzegovina" },
  { code: "BW", name: "Botswana" },
  { code: "BR", name: "Brazil" },
  { code: "BN", name: "Brunei" },
  { code: "BG", name: "Bulgaria" },
  { code: "BF", name: "Burkina Faso" },
  { code: "BI", name: "Burundi" },
  { code: "CV", name: "Cabo Verde" },
  { code: "KH", name: "Cambodia" },
  { code: "CM", name: "Cameroon" },
  { code: "CA", name: "Canada" },
  { code: "CF", name: "Central African Republic" },
  { code: "TD", name: "Chad" },
  { code: "CL", name: "Chile" },
  { code: "CN", name: "China" },
  { code: "CO", name: "Colombia" },
  { code: "KM", name: "Comoros" },
  { code: "CG", name: "Congo" },
  { code: "CD", name: "Congo (DRC)" },
  { code: "CR", name: "Costa Rica" },
  { code: "CI", name: "C\u00f4te d\u2019Ivoire" },
  { code: "HR", name: "Croatia" },
  { code: "CU", name: "Cuba" },
  { code: "CY", name: "Cyprus" },
  { code: "CZ", name: "Czech Republic" },
  { code: "DK", name: "Denmark" },
  { code: "DJ", name: "Djibouti" },
  { code: "DM", name: "Dominica" },
  { code: "DO", name: "Dominican Republic" },
  { code: "EC", name: "Ecuador" },
  { code: "EG", name: "Egypt" },
  { code: "SV", name: "El Salvador" },
  { code: "GQ", name: "Equatorial Guinea" },
  { code: "ER", name: "Eritrea" },
  { code: "EE", name: "Estonia" },
  { code: "SZ", name: "Eswatini" },
  { code: "ET", name: "Ethiopia" },
  { code: "FJ", name: "Fiji" },
  { code: "FI", name: "Finland" },
  { code: "FR", name: "France" },
  { code: "GA", name: "Gabon" },
  { code: "GM", name: "Gambia" },
  { code: "GE", name: "Georgia" },
  { code: "DE", name: "Germany" },
  { code: "GH", name: "Ghana" },
  { code: "GR", name: "Greece" },
  { code: "GD", name: "Grenada" },
  { code: "GT", name: "Guatemala" },
  { code: "GN", name: "Guinea" },
  { code: "GW", name: "Guinea-Bissau" },
  { code: "GY", name: "Guyana" },
  { code: "HT", name: "Haiti" },
  { code: "HN", name: "Honduras" },
  { code: "HU", name: "Hungary" },
  { code: "IS", name: "Iceland" },
  { code: "IN", name: "India" },
  { code: "ID", name: "Indonesia" },
  { code: "IR", name: "Iran" },
  { code: "IQ", name: "Iraq" },
  { code: "IE", name: "Ireland" },
  { code: "IL", name: "Israel" },
  { code: "IT", name: "Italy" },
  { code: "JM", name: "Jamaica" },
  { code: "JP", name: "Japan" },
  { code: "JO", name: "Jordan" },
  { code: "KZ", name: "Kazakhstan" },
  { code: "KE", name: "Kenya" },
  { code: "KI", name: "Kiribati" },
  { code: "KP", name: "North Korea" },
  { code: "KR", name: "South Korea" },
  { code: "KW", name: "Kuwait" },
  { code: "KG", name: "Kyrgyzstan" },
  { code: "LA", name: "Laos" },
  { code: "LV", name: "Latvia" },
  { code: "LB", name: "Lebanon" },
  { code: "LS", name: "Lesotho" },
  { code: "LR", name: "Liberia" },
  { code: "LY", name: "Libya" },
  { code: "LI", name: "Liechtenstein" },
  { code: "LT", name: "Lithuania" },
  { code: "LU", name: "Luxembourg" },
  { code: "MG", name: "Madagascar" },
  { code: "MW", name: "Malawi" },
  { code: "MY", name: "Malaysia" },
  { code: "MV", name: "Maldives" },
  { code: "ML", name: "Mali" },
  { code: "MT", name: "Malta" },
  { code: "MH", name: "Marshall Islands" },
  { code: "MR", name: "Mauritania" },
  { code: "MU", name: "Mauritius" },
  { code: "MX", name: "Mexico" },
  { code: "FM", name: "Micronesia" },
  { code: "MD", name: "Moldova" },
  { code: "MC", name: "Monaco" },
  { code: "MN", name: "Mongolia" },
  { code: "ME", name: "Montenegro" },
  { code: "MA", name: "Morocco" },
  { code: "MZ", name: "Mozambique" },
  { code: "MM", name: "Myanmar" },
  { code: "NA", name: "Namibia" },
  { code: "NR", name: "Nauru" },
  { code: "NP", name: "Nepal" },
  { code: "NL", name: "Netherlands" },
  { code: "NZ", name: "New Zealand" },
  { code: "NI", name: "Nicaragua" },
  { code: "NE", name: "Niger" },
  { code: "NG", name: "Nigeria" },
  { code: "MK", name: "North Macedonia" },
  { code: "NO", name: "Norway" },
  { code: "OM", name: "Oman" },
  { code: "PK", name: "Pakistan" },
  { code: "PW", name: "Palau" },
  { code: "PS", name: "Palestine" },
  { code: "PA", name: "Panama" },
  { code: "PG", name: "Papua New Guinea" },
  { code: "PY", name: "Paraguay" },
  { code: "PE", name: "Peru" },
  { code: "PH", name: "Philippines" },
  { code: "PL", name: "Poland" },
  { code: "PT", name: "Portugal" },
  { code: "QA", name: "Qatar" },
  { code: "RO", name: "Romania" },
  { code: "RU", name: "Russia" },
  { code: "RW", name: "Rwanda" },
  { code: "KN", name: "Saint Kitts and Nevis" },
  { code: "LC", name: "Saint Lucia" },
  { code: "VC", name: "Saint Vincent and the Grenadines" },
  { code: "WS", name: "Samoa" },
  { code: "SM", name: "San Marino" },
  { code: "ST", name: "Sao Tome and Principe" },
  { code: "SA", name: "Saudi Arabia" },
  { code: "SN", name: "Senegal" },
  { code: "RS", name: "Serbia" },
  { code: "SC", name: "Seychelles" },
  { code: "SL", name: "Sierra Leone" },
  { code: "SG", name: "Singapore" },
  { code: "SK", name: "Slovakia" },
  { code: "SI", name: "Slovenia" },
  { code: "SB", name: "Solomon Islands" },
  { code: "SO", name: "Somalia" },
  { code: "ZA", name: "South Africa" },
  { code: "SS", name: "South Sudan" },
  { code: "ES", name: "Spain" },
  { code: "LK", name: "Sri Lanka" },
  { code: "SD", name: "Sudan" },
  { code: "SR", name: "Suriname" },
  { code: "SE", name: "Sweden" },
  { code: "CH", name: "Switzerland" },
  { code: "SY", name: "Syria" },
  { code: "TW", name: "Taiwan" },
  { code: "TJ", name: "Tajikistan" },
  { code: "TZ", name: "Tanzania" },
  { code: "TH", name: "Thailand" },
  { code: "TL", name: "Timor-Leste" },
  { code: "TG", name: "Togo" },
  { code: "TO", name: "Tonga" },
  { code: "TT", name: "Trinidad and Tobago" },
  { code: "TN", name: "Tunisia" },
  { code: "TR", name: "Turkey" },
  { code: "TM", name: "Turkmenistan" },
  { code: "TV", name: "Tuvalu" },
  { code: "UG", name: "Uganda" },
  { code: "UA", name: "Ukraine" },
  { code: "AE", name: "United Arab Emirates" },
  { code: "GB", name: "United Kingdom" },
  { code: "US", name: "United States" },
  { code: "UY", name: "Uruguay" },
  { code: "UZ", name: "Uzbekistan" },
  { code: "VU", name: "Vanuatu" },
  { code: "VA", name: "Vatican City" },
  { code: "VE", name: "Venezuela" },
  { code: "VN", name: "Vietnam" },
  { code: "YE", name: "Yemen" },
  { code: "ZM", name: "Zambia" },
  { code: "ZW", name: "Zimbabwe" },
];

export default function ClientSearchPage() {
  
  // Client layout handles auth


  const [formData, setFormData] = useState<FormData>({
    jobTitle: "",
    industry: "",
    salaryMin: "",
    salaryMax: "",
    jobType: "",
    employmentType: "",
    city: "",
    country: "",
    datePosted: "",
    startDate: "",
    endDate: "",
  });

  const [selectedSource, setSelectedSource] = useState<SearchSource | null>(null);

  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [activeService, setActiveService] = useState<
    SearchSource | null
  >(null);
  const [searchProgress, setSearchProgress] = useState<{
    count: number;
    maxResults: number;
    status: string;
  } | null>(null);
  const [indeedRunId, setIndeedRunId] = useState<string | null>(null);
  const [streamController, setStreamController] =
    useState<AbortController | null>(null);
  const [mobileTab, setMobileTab] = useState<"search" | "results">("search");

  // Assignment states — quota loaded from backend on mount
  const [assignmentsUsed, setAssignmentsUsed] = useState<number>(0);
  const [maxAssignments, setMaxAssignments] = useState<number>(30);
  const [assigningJobId, setAssigningJobId] = useState<string | null>(null);
  const [assignedJobIds, setAssignedJobIds] = useState<Set<string>>(new Set());

  // Search attempts used — 30 attempts per week, pick up to 30 jobs
  const [searchAttemptsUsed, setSearchAttemptsUsed] = useState<number>(0);
  const [maxSearchAttempts, setMaxSearchAttempts] = useState<number>(10);
  const [isStatsLoading, setIsStatsLoading] = useState<boolean>(true);

  // Toast notifications
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);

  // Search History & Cache
  const [searchHistory, setSearchHistory] = useState<{
    id: string;
    formData: FormData;
    jobs: Job[];
    service: string;
    timestamp: number;
  }[]>([]);

  // On mount: restore local cache + fetch real quota + real history from backend
  useEffect(() => {
    // 1. Restore search form data from localStorage (but NOT results — those only show after explicit search)
    const cached = localStorage.getItem("tjh_search_cache");
    if (cached) {
      try {
        const { formData: cForm } = JSON.parse(cached);
        setFormData(cForm);
      } catch (e) { console.error("Cache load failed", e); }
    }

    // Seed history from localStorage while backend loads
    const localHistory = localStorage.getItem("tjh_search_history");
    if (localHistory) {
      try { setSearchHistory(JSON.parse(localHistory)); } catch { /* ignore */ }
    }

    // 2. Fetch real quota + history + existing jobs from backend asynchronously
    (async () => {
      try {
        // Quota
        const statsRes = await fetch("/api/client/jobs/stats", { credentials: "include" });
        if (statsRes.ok) {
          const stats = await statsRes.json();
          setAssignmentsUsed(stats.assignments_used ?? 0);
          setMaxAssignments(stats.max_assignments ?? 30);
          setSearchAttemptsUsed(stats.search_attempts_used ?? 0);
          setMaxSearchAttempts(stats.max_search_attempts ?? 10);
        }

        // Pre-load existing assigned jobs to populate the "Assigned ✓" state
        // and prevent duplicates
        const jobsRes = await fetch("/api/client/jobs", { credentials: "include" });
        if (jobsRes.ok) {
          const jobsData = await jobsRes.json();
          const existingJobs = Array.isArray(jobsData)
            ? jobsData
            : Array.isArray(jobsData?.jobs)
            ? jobsData.jobs
            : Array.isArray(jobsData?.data)
            ? jobsData.data
            : [];
          // Build a set of "title|company" keys for already-assigned jobs
          const alreadyAssigned = new Set<string>();
          interface JobRecord { job_title?: string; company?: string }
          existingJobs.forEach((j: JobRecord) => {
            const key = `${(j.job_title || "").toLowerCase()}|${(j.company || "").toLowerCase()}`;
            alreadyAssigned.add(key);
          });
          setAssignedJobIds(alreadyAssigned);
        }

        // Search history from backend
        const histRes = await fetch("/api/client/search-history", { credentials: "include" });
        if (histRes.ok) {
          const histData = await histRes.json();
          const backendHistory = Array.isArray(histData) ? histData : histData?.data ?? [];
          if (backendHistory.length > 0) {
            // Normalize backend history to UI schema
            interface HistoryItem { id?: string; query_params?: FormData; formData?: FormData; results_preview?: Job[]; jobs?: Job[]; service?: string; timestamp?: number; created_at?: number }
            const normalizedBackend = backendHistory.map((h: HistoryItem) => ({
              id: h.id || Math.random().toString(),
              formData: h.query_params || h.formData || {},
              jobs: h.results_preview || h.jobs || [],
              service: h.service || "linkedin",
              timestamp: h.timestamp || h.created_at || Date.now()
            }));

            // Preserve local full-job caches if they exist, otherwise fallback to backend preview history
            setSearchHistory(prev => {
              if (prev.length > 0) return prev;
              localStorage.setItem("tjh_search_history", JSON.stringify(normalizedBackend));
              return normalizedBackend;
            });
          }
        }
      } catch (e) {
        console.warn("Could not reach backend for stats/history — using local fallback", e);
      } finally {
        setIsStatsLoading(false);
      }
    })();
  }, []);

  // After a successful search: cache locally + persist to backend
  const updateCache = (newJobs: Job[], service: string, currentForm: FormData) => {
    // Always keep localStorage as fast local cache
    localStorage.setItem("tjh_search_cache", JSON.stringify({ jobs: newJobs, service, formData: currentForm }));

    const entry = {
      id: Math.random().toString(36).substr(2, 9),
      formData: currentForm,
      jobs: newJobs,
      service,
      timestamp: Date.now(),
    };
    setSearchHistory(prev => {
      const deduped = prev.filter(h => !(h.formData.jobTitle === currentForm.jobTitle && h.formData.city === currentForm.city));
      const updated = [entry, ...deduped].slice(0, 5);
      localStorage.setItem("tjh_search_history", JSON.stringify(updated));
      return updated;
    });

    // Persist to backend and update stats
    (async () => {
      try {
        const res = await fetch("/api/client/search-history", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            query_params: currentForm,
            results: newJobs,
            service,
          }),
        });

        if (res.ok) {
          // Re-sync quota from backend to ensure exactness
          const statsRes = await fetch("/api/client/jobs/stats", { credentials: "include" });
          if (statsRes.ok) {
            const stats = await statsRes.json();
            setSearchAttemptsUsed(stats.search_attempts_used ?? 0);
          }
        }
      } catch { /* non-critical */ }
    })();
  };

  interface HistoryEntry { formData: FormData; jobs: Job[]; service: string }
  const restoreFromHistory = (item: HistoryEntry) => {
    setFormData(item.formData);
    setJobs(item.jobs);
    setActiveService(item.service as SearchSource);
    setSearchProgress(null);
    setLoading(false);
    setHasSearched(true);
    localStorage.setItem("tjh_search_cache", JSON.stringify({ jobs: item.jobs, service: item.service, formData: item.formData }));
  };

  // Helper to build a dedup key from a search result job
  const jobKey = (job: Job) =>
    `${(job.title || "").toLowerCase()}|${(job.company || "").toLowerCase()}`;

  const handleAssignToJA = async (job: Job) => {
    if (assignmentsUsed >= maxAssignments) return;

    // Duplicate check
    const key = jobKey(job);
    if (assignedJobIds.has(key)) {
      setToast({ message: "This role has already been assigned to the JA team.", type: "error" });
      return;
    }

    setAssigningJobId(job.id);
    try {
      const res = await fetch("/api/client/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          job_title: job.title,
          company: job.company,
          location: job.location ?? "",
          apply_link: job.applyLink ?? "",
          description: job.description ?? "",
          match_score: 0,
          source: "client_selected",
          status: "queued",
          handled_by: "client",
        }),
      });

      if (res.status === 403) {
        const data = await res.json().catch(() => ({}));
        setToast({ message: data.detail ?? `You've reached your weekly limit of ${maxAssignments} job assignments. Your limit resets next Monday.`, type: "error" });
        return;
      }

      if (!res.ok) throw new Error("Failed to assign job");

      setAssignmentsUsed(prev => prev + 1);
      setAssignedJobIds(prev => new Set([...prev, key]));
      setToast({ message: "Submitted! Our JA team will review this opportunity for you.", type: "success" });
    } catch (err) {
      console.error(err);
      setToast({ message: "Failed to assign job. Please try again later.", type: "error" });
    } finally {
      setAssigningJobId(null);
    }
  };

  // Country dropdown state
  const [countryDropdownOpen, setCountryDropdownOpen] = useState(false);
  const [countrySearch, setCountrySearch] = useState("");
  const countryDropdownRef = useRef<HTMLDivElement>(null);
  const countryTriggerRef = useRef<HTMLButtonElement>(null);
  const [dropdownCoords, setDropdownCoords] = useState({ top: 0, left: 0, width: 0 });
  // Position the portal dropdown
  useLayoutEffect(() => {
    if (countryDropdownOpen && countryTriggerRef.current) {
      const rect = countryTriggerRef.current.getBoundingClientRect();
      setDropdownCoords({
        top: rect.bottom + window.scrollY,
        left: rect.left + window.scrollX,
        width: rect.width
      });
    }
  }, [countryDropdownOpen]);

  // Get selected country info
  const selectedCountry = COUNTRIES.find((c) => c.code === formData.country);

  // Filter countries based on search
  const filteredCountries = COUNTRIES.filter(
    (country) =>
      country.name.toLowerCase().includes(countrySearch.toLowerCase()) ||
      country.code.toLowerCase().includes(countrySearch.toLowerCase())
  );

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        countryDropdownRef.current &&
        !countryDropdownRef.current.contains(event.target as Node)
      ) {
        setCountryDropdownOpen(false);
        setCountrySearch("");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const downloadCsv = () => {
    if (!jobs.length) return;

    const headers = [
      "id",
      "title",
      "company",
      "location",
      "city",
      "state",
      "country",
      "salary",
      "type",
      "remote",
      "posted",
      "description",
      "applyLink",
    ];

    const escapeCell = (value: unknown) => {
      if (value === null || value === undefined) return "";
      const str = String(value);
      const needsQuotes = /[",\n]/.test(str);
      const escaped = str.replace(/"/g, '""');
      return needsQuotes ? `"${escaped}"` : escaped;
    };

    const rows = jobs.map((job) =>
      [
        job.id,
        job.title,
        job.company,
        job.location,
        job.city,
        job.state,
        job.country,
        job.salary,
        job.type,
        job.remote ? "true" : "false",
        job.posted,
        job.description,
        job.applyLink,
      ].map(escapeCell)
    );

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.join(",")),
    ].join("\r\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    const source = activeService ? activeService.replace("/", "-") : "jobs";

    link.href = url;
    link.setAttribute(
      "download",
      `jobs-${source}-${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    // Handle salary formatting with commas
    if (name === "salaryMin" || name === "salaryMax") {
      if (value === "") {
        setFormData((prev: FormData) => ({
          ...prev,
          [name]: value,
        }));
        return;
      }
      
      const rawValue = value.replace(/\D/g, "");
      if (rawValue === "") return;
      
      const numValue = parseInt(rawValue, 10);
      if (numValue < 0) return;
      
      const formattedValue = new Intl.NumberFormat("en-US").format(numValue);
      setFormData((prev: FormData) => ({
        ...prev,
        [name]: formattedValue,
      }));
      return;
    }

    setFormData((prev: FormData) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSearch = async (service: SearchSource) => {
    if (SOURCE_THEME[service].comingSoon) {
      setError("Indeed v2 is coming soon.");
      return;
    }

    // Guard: enforce search attempts per week
    if (searchAttemptsUsed >= maxSearchAttempts) {
      setError(`You've used all ${maxSearchAttempts} search attempts this week. You can still browse and assign jobs from your existing results using the "Search History" tab.`);
      return;
    }

    setLoading(true);
    setError(null);
    setActiveService(service);
    setJobs([]);
    setSearchProgress(null);
    setIndeedRunId(null);
    setSearchAttemptsUsed(prev => prev + 1);

    // Abort any existing stream
    if (streamController) {
      streamController.abort();
      setStreamController(null);
    }

    try {
      const searchPayload = {
        ...formData,
        salaryMin: formData.salaryMin ? formData.salaryMin.replace(/,/g, "") : "",
        salaryMax: formData.salaryMax ? formData.salaryMax.replace(/,/g, "") : "",
        employmentType: formData.employmentType || "",
        startDate:
          service === "reliefweb/v2" && formData.startDate
            ? formData.startDate.replace(/-/g, "")
            : formData.startDate || "",
        endDate:
          service === "reliefweb/v2" && formData.endDate
            ? formData.endDate.replace(/-/g, "")
            : formData.endDate || "",
      };

      // Use SSE streaming for all services
      // Create abort controller for this request
      const abortController = new AbortController();
      setStreamController(abortController);

      if (isStreamingSource(service)) {
        // Use streaming endpoint for all services (use query param for all)
        const endpoint = `/api/${service}?stream=true`;

        const response = await fetch(endpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify(searchPayload),
          signal: abortController.signal,
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(
            errorData.error || `Failed to search with ${service}`
          );
        }

        // Handle SSE stream
        const reader = response.body?.getReader();
        const decoder = new TextDecoder();

        if (!reader) {
          throw new Error("Response body is not readable");
        }

        let buffer = "";
        let streamError = null;
        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split("\n");
            buffer = lines.pop() || "";

            for (const line of lines) {
              if (line.trim() && line.startsWith("data: ")) {
                try {
                  const data = JSON.parse(line.slice(6));
                  console.log("Received SSE data:", data); // Debug log

                  if (data.type === "start") {
                    setSearchProgress({
                      count: 0,
                      maxResults: 30,
                      status: "starting",
                    });
                  } else if (data.type === "progress") {
                    setSearchProgress({
                      count: data.count || 0,
                      maxResults:
                        data.max_results || 30,
                      status: data.status || "running",
                    });
                    // Store run_id if provided for abort functionality (Indeed only)
                    if (data.run_id && service === "indeed") {
                      setIndeedRunId(data.run_id);
                    }
                  } else if (data.type === "complete") {
                    const finalJobs = data.jobs || [];
                    setJobs(finalJobs);
                    setSearchProgress(null);
                    setHasSearched(true);
                    if (finalJobs.length > 0) {
                      updateCache(finalJobs, service, formData);
                    }
                    if (finalJobs.length === 0) {
                      setError(
                        "No jobs found. Try adjusting your search criteria."
                      );
                    }
                  } else if (data.type === "error") {
                    streamError = new Error(
                      data.message || "An error occurred"
                    );
                    break;
                  }
                } catch (e) {
                  console.error("Error parsing SSE data:", e);
                }
              }
            }
            if (streamError) break;
          }
        } catch (streamErr: unknown) {
          // Handle stream reading errors
          // Ignore AbortError - it's expected when user cancels or connection closes
          if (streamErr instanceof Error && streamErr.name !== "AbortError") {
            streamError = streamErr;
          } else {
            // Clean up on abort
            setSearchProgress(null);
            setLoading(false);
            return;
          }
        }

        if (streamError) {
          throw streamError;
        }
      } else {
        // Regular fetch for non-stream sources
        const response = await fetch(`/api/${service}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(searchPayload),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || `Failed to search with ${service}`);
        }

        setJobs(data.jobs || []);
        setHasSearched(true);
        if (data.jobs && data.jobs.length > 0) {
          updateCache(data.jobs, service, formData);
        }
        if (data.jobs && data.jobs.length === 0) {
          setError("No jobs found. Try adjusting your search criteria.");
        }
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "An error occurred while searching for jobs";
      setError(message);
      setJobs([]);
      setSearchProgress(null);
      setSearchAttemptsUsed(prev => Math.max(0, prev - 1)); // rollback optimistic increment
    } finally {
      setLoading(false);
    }
  };

  const handleStopSearch = async () => {
    // Abort the stream
    if (streamController) {
      streamController.abort();
      setStreamController(null);
    }

    // Also abort on backend if we have run_id (Indeed only)
    if (indeedRunId && activeService === "indeed") {
      try {
        await fetch(`/api/indeed/abort?run_id=${indeedRunId}`, {
          method: "POST",
        });
      } catch (err) {
        console.error("Error aborting search:", err);
      }
    }

    setLoading(false);
    setSearchProgress(null);
    setIndeedRunId(null);
  };

  const searchAttemptsExhausted = searchAttemptsUsed >= maxSearchAttempts;
  const disabledSearch = isStatsLoading || loading || !formData.jobTitle.trim() || searchAttemptsExhausted;
  const activeTheme = getSourceTheme(activeService);
  const selectedTheme = getSourceTheme(selectedSource);

  return (
    <div className="flex lg:h-[calc(100vh-160px)] min-h-0 flex-col gap-4 sm:gap-6">
      
      {/* Mobile Tab Navigator */}
      <div className="lg:hidden flex items-center bg-slate-100/50 dark:bg-zinc-950/60 p-1 rounded-2xl border border-slate-200/50 dark:border-zinc-800/50 mx-4 shrink-0">
        <button onClick={() => setMobileTab("search")} className={`flex-1 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${mobileTab === "search" ? "bg-white dark:bg-zinc-900 text-slate-900 dark:text-white shadow-lg" : "text-slate-400 dark:text-zinc-600"}`}>Search</button>
        <button onClick={() => setMobileTab("results")} className={`flex-1 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${mobileTab === "results" ? "bg-white dark:bg-zinc-900 text-slate-900 dark:text-white shadow-lg" : "text-slate-400 dark:text-zinc-600"}`}>Results ({jobs.length})</button>
      </div>
      {/* Main Content Area */}
      <section className="grid gap-6 lg:grid-cols-[minmax(0,1.7fr)_minmax(0,1fr)] xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] lg:items-stretch lg:min-h-0 flex-1">
        <div className={`glass-panel relative flex flex-col lg:overflow-y-auto lg:custom-scrollbar pr-2 sm:pr-4 p-4 sm:p-8 ${mobileTab === 'search' ? 'flex' : 'hidden lg:flex'}`}>

          <div className="mb-6 flex items-center gap-3 text-xs text-zinc-400">
            <span className="pill-badge inline-flex items-center gap-1.5 px-3 py-1">
              <span className="h-1.5 w-1.5 rounded-full bg-sky-400 shadow-[0_0_18px_rgba(56,189,248,1)]" />
              <span className="font-medium text-[11px] uppercase tracking-[0.18em] text-zinc-200">
                Smart Job Search
              </span>
            </span>
            <span className="hidden sm:inline text-[11px] text-slate-400 dark:text-zinc-500">
              CSV export
            </span>
          </div>

          <div className="mb-7">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
              <div className="space-y-3">
                <h1 className="text-balance text-3xl font-bold tracking-tight text-slate-900 dark:text-zinc-50 sm:text-4xl lg:text-5xl">
                  Find roles that match your stack,
                  <span className="bg-linear-to-r from-sky-400 via-cyan-300 to-emerald-300 bg-clip-text text-transparent block">
                    not just your title.
                  </span>
                </h1>
                <p className="max-w-xl text-sm leading-relaxed text-zinc-400 sm:text-base">
                  Search across multiple platforms simultaneously. Surface roles by skills, salary, and location—without the noise.
                </p>
              </div>
            </div>
          </div>


          {/* Source Selector */}
          <div className="mb-8 rounded-2xl border border-slate-300/50 dark:border-white/10 bg-white/80 dark:bg-black/30 p-4 sm:p-5 shadow-sm">
            <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-400">Step 1 — Select search source</p>
            <div className="grid grid-cols-3 gap-2">
              {SOURCE_ORDER.map((sourceKey) => {
                const source = SOURCE_THEME[sourceKey];

                return (
                  <button
                    key={sourceKey}
                    type="button"
                    disabled={source.comingSoon}
                    onClick={() => {
                      if (source.comingSoon) return;
                      setSelectedSource(sourceKey);
                      setFormData((prev) => ({
                        ...prev,
                        ...(sourceKey === "linkedin" ? { industry: "" } : {}),
                      }));
                    }}
                    className={`inline-flex items-center justify-center gap-2 rounded-lg border px-3 py-2.5 text-sm font-semibold transition ${
                      selectedSource === sourceKey
                        ? source.buttonClass
                        : "border-slate-200 dark:border-zinc-700/60 bg-white dark:bg-zinc-800/40 text-slate-500 dark:text-zinc-400 hover:border-slate-300 dark:hover:border-zinc-600 hover:text-slate-900 dark:hover:text-zinc-200"
                    } ${source.comingSoon ? "cursor-not-allowed opacity-70" : ""}`}
                  >
                    <span className={`h-1.5 w-1.5 rounded-full ${selectedSource === sourceKey ? source.dotClass : "bg-zinc-600"}`} />
                    <span>{source.label}</span>
                    {source.comingSoon && (
                      <span className="text-[10px] font-medium uppercase tracking-[0.14em] text-zinc-500">
                        Coming soon
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <div className={`space-y-4 rounded-2xl border border-slate-300/50 dark:border-white/5 bg-white/80 dark:bg-black/40 p-4 sm:p-5 shadow-sm transition-opacity ${!selectedSource ? "opacity-40 pointer-events-none" : ""}`}>
            <div className="mb-2 border-b border-white/5 pb-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-400">Step 2 — Configure filters & search</p>
            </div>
            {!selectedSource && (
              <div className="text-center py-2 text-sm text-zinc-400">Select a search source above to configure filters</div>
            )}
            <div className="grid gap-4 sm:grid-cols-[minmax(0,1.4fr)_minmax(0,1.1fr)]">
              <div className="space-y-3">
                <label htmlFor="jobTitle" className="flex items-center justify-between text-xs font-medium text-slate-700 dark:text-zinc-200">
                  <span>Role or title *</span>
                  <span className="text-[11px] text-zinc-400">Try &ldquo;Senior Backend Engineer&rdquo;</span>
                </label>
                <input type="text" id="jobTitle" name="jobTitle" value={formData.jobTitle} onChange={handleInputChange}
                  placeholder="e.g., Staff Frontend Engineer"
                  className="w-full rounded-lg border border-slate-300 dark:border-white/30 bg-white dark:bg-zinc-700/90 px-3.5 py-2.5 text-sm text-slate-900 dark:text-zinc-50 outline-none ring-0 transition focus:border-sky-400/70 focus:ring-2 focus:ring-sky-500/50 shadow-sm"
                  required
                />
              </div>
              {selectedSource !== "linkedin" && (
              <div className="space-y-3">
                <label htmlFor="industry" className="flex items-center justify-between text-xs font-medium text-slate-700 dark:text-zinc-200">
                  <span>Industry</span>
                  <span className="text-[11px] text-zinc-400">Optional focus (fintech, AI, etc.)</span>
                </label>
                <input type="text" id="industry" name="industry" value={formData.industry} onChange={handleInputChange}
                  placeholder="e.g., Developer tools / AI infra"
                  className="w-full rounded-lg border border-slate-300 dark:border-white/30 bg-white dark:bg-zinc-700/90 px-3.5 py-2.5 text-sm text-slate-900 dark:text-zinc-50 outline-none ring-0 transition focus:border-emerald-400/70 focus:ring-2 focus:ring-emerald-500/50 shadow-sm"
                />
              </div>
              )}
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <div className="space-y-2.5">
                <label htmlFor="salaryMin" className="block text-[11px] font-medium uppercase tracking-[0.16em] text-zinc-400">Min salary (USD/yr)</label>
                <input type="text" id="salaryMin" name="salaryMin" value={formData.salaryMin} onChange={handleInputChange}
                  placeholder="80,000" className="w-full rounded-lg border border-slate-300 dark:border-white/30 bg-white dark:bg-zinc-700/90 px-3 py-2 text-sm text-slate-900 dark:text-zinc-50 outline-none ring-0 transition focus:border-sky-400/70 focus:ring-2 focus:ring-sky-500/50 shadow-sm" />
              </div>
              <div className="space-y-2.5">
                <label htmlFor="salaryMax" className="block text-[11px] font-medium uppercase tracking-[0.16em] text-zinc-400">Max salary (USD/yr)</label>
                <input type="text" id="salaryMax" name="salaryMax" value={formData.salaryMax} onChange={handleInputChange}
                  placeholder="220,000" className="w-full rounded-lg border border-slate-300 dark:border-white/30 bg-white dark:bg-zinc-700/90 px-3 py-2 text-sm text-slate-900 dark:text-zinc-50 outline-none ring-0 transition focus:border-sky-400/70 focus:ring-2 focus:ring-sky-500/50 shadow-sm" />
              </div>

              <div className="space-y-2.5">
                <label htmlFor="jobType" className="block text-[11px] font-medium uppercase tracking-[0.16em] text-zinc-400">Work style</label>
                <select id="jobType" name="jobType" value={formData.jobType} onChange={handleInputChange}
                  className="w-full rounded-lg border border-slate-300 dark:border-white/30 bg-white dark:bg-zinc-700/90 px-3 py-2 text-sm text-slate-900 dark:text-zinc-50 outline-none ring-0 transition focus:border-emerald-400/70 focus:ring-2 focus:ring-emerald-500/50 shadow-sm">
                  <option value="">Any</option>
                  <option value="Remote">Remote</option>
                  <option value="On-site">On-site</option>
                  <option value="Hybrid">Hybrid</option>
                </select>
              </div>

              <div className="space-y-2.5">
                <label htmlFor="employmentType" className="block text-[11px] font-medium uppercase tracking-[0.16em] text-zinc-400">Employment type</label>
                <select id="employmentType" name="employmentType" value={formData.employmentType} onChange={handleInputChange}
                  className="w-full rounded-lg border border-slate-300 dark:border-white/30 bg-white dark:bg-zinc-700/90 px-3 py-2 text-sm text-slate-900 dark:text-zinc-50 outline-none ring-0 transition focus:border-emerald-400/70 focus:ring-2 focus:ring-emerald-500/50 shadow-sm">
                  <option value="">Any</option>
                  <option value="Fulltime">Full-time</option>
                  <option value="Parttime">Part-time</option>
                  <option value="Contractor">Contractor</option>
                  <option value="Intern">Intern</option>
                </select>
              </div>

              <div className="space-y-2.5">
                <label htmlFor="datePosted" className="block text-[11px] font-medium uppercase tracking-[0.16em] text-zinc-400">Freshness</label>
                <select id="datePosted" name="datePosted" value={formData.datePosted} onChange={handleInputChange}
                  className="w-full rounded-lg border border-slate-300 dark:border-white/30 bg-white dark:bg-zinc-700/90 px-3 py-2 text-sm text-slate-900 dark:text-zinc-50 outline-none ring-0 transition focus:border-emerald-400/70 focus:ring-2 focus:ring-emerald-500/50 shadow-sm">
                  <option value="">Any time</option>
                  <option value="today">Past 24 hours</option>
                  <option value="week">Past week</option>
                  <option value="month">Past month</option>
                </select>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <div className="space-y-2.5">
                <label htmlFor="city" className="block text-[11px] font-medium uppercase tracking-[0.16em] text-zinc-400">City (optional)</label>
                <input type="text" id="city" name="city" value={formData.city} onChange={handleInputChange}
                  placeholder="San Francisco, London..."
                  className="w-full rounded-lg border border-slate-300 dark:border-white/30 bg-white dark:bg-zinc-700/90 px-3 py-2 text-sm text-slate-900 dark:text-zinc-50 outline-none ring-0 transition focus:border-sky-400/70 focus:ring-2 focus:ring-sky-500/50 shadow-sm"
                />
              </div>
              <div className="space-y-2.5 relative">
                <label htmlFor="country" className="block text-[11px] font-medium uppercase tracking-[0.16em] text-zinc-400">Country / region</label>
                <button type="button" id="country" ref={countryTriggerRef} onClick={() => setCountryDropdownOpen(!countryDropdownOpen)}
                  className="w-full rounded-lg border border-slate-300 dark:border-white/30 bg-white dark:bg-zinc-700/90 px-3 py-2 text-sm text-left text-slate-900 dark:text-zinc-50 outline-none ring-0 transition focus:border-sky-400/70 focus:ring-2 focus:ring-sky-500/50 flex items-center justify-between gap-2 shadow-sm">
                  <span className="flex items-center gap-2 truncate">
                      {selectedCountry ? (<><Image src={`https://flagcdn.com/w20/${selectedCountry.code.toLowerCase()}.png`} alt={selectedCountry.name} width={20} height={16} className="h-4 w-5 object-cover rounded-sm" /><span>{selectedCountry.name}</span></>) : (<span className="text-zinc-400">Select country...</span>)}
                  </span>
                  <svg className={`h-4 w-4 text-zinc-400 transition-transform ${countryDropdownOpen ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                </button>
                {countryDropdownOpen && createPortal(
                  <div 
                    ref={countryDropdownRef}
                    style={{ 
                      position: 'absolute', 
                      top: `${dropdownCoords.top}px`, 
                      left: `${dropdownCoords.left}px`, 
                      width: `${dropdownCoords.width}px`,
                      zIndex: 9999 
                    }}
                    className="mt-1 max-h-60 overflow-hidden rounded-lg border border-slate-200 dark:border-white/20 bg-white dark:bg-zinc-800/95 shadow-xl backdrop-blur-sm"
                  >
                    <div className="sticky top-0 p-2 border-b border-white/10 bg-zinc-800/95">
                      <input type="text" placeholder="Search countries..." value={countrySearch} onChange={(e) => setCountrySearch(e.target.value)}
                        className="w-full rounded-md border border-slate-200 dark:border-white/20 bg-slate-50 dark:bg-zinc-700/90 px-3 py-1.5 text-sm text-slate-900 dark:text-zinc-50 outline-none placeholder:text-slate-400 dark:placeholder:text-zinc-400 focus:border-sky-400/70" autoFocus />
                    </div>
                    <div className="max-h-48 overflow-y-auto">
                      <button type="button" onClick={() => { setFormData((prev) => ({ ...prev, country: "" })); setCountryDropdownOpen(false); setCountrySearch(""); }}
                        className={`w-full px-3 py-2 text-left text-sm hover:bg-slate-100 dark:hover:bg-white/10 flex items-center gap-2 transition ${!formData.country ? "bg-sky-500/10 text-sky-600 dark:bg-sky-500/20 dark:text-sky-200" : "text-slate-700 dark:text-zinc-50"}`}>
                        <span className="text-base">🌐</span><span>Any country</span>
                      </button>
                      {filteredCountries.map((country) => (
                        <button type="button" key={country.code}
                          onClick={() => { setFormData((prev) => ({ ...prev, country: country.code })); setCountryDropdownOpen(false); setCountrySearch(""); }}
                          className={`w-full px-3 py-2 text-left text-sm hover:bg-slate-100 dark:hover:bg-white/10 flex items-center gap-2 transition ${formData.country === country.code ? "bg-sky-500/10 text-sky-600 dark:bg-sky-500/20 dark:text-sky-200" : "text-slate-700 dark:text-zinc-50"}`}>
                            <Image src={`https://flagcdn.com/w20/${country.code.toLowerCase()}.png`} alt={country.name} width={20} height={16} className="h-4 w-5 object-cover rounded-sm" />
                          <span>{country.name}</span>
                          <span className="ml-auto text-[10px] text-zinc-500">{country.code}</span>
                        </button>
                      ))}
                      {filteredCountries.length === 0 && (<div className="px-3 py-4 text-center text-sm text-zinc-400">No countries found</div>)}
                    </div>
                  </div>,
                  document.body
                )}
              </div>
              {selectedSource === "reliefweb/v2" && (
                <div className="sm:col-span-3 grid gap-3 sm:grid-cols-2">
                  <div className="space-y-2.5">
                    <label htmlFor="startDate" className="block text-[11px] font-medium uppercase tracking-[0.16em] text-zinc-400">Start date</label>
                    <input
                      type="date"
                      id="startDate"
                      name="startDate"
                      value={formData.startDate}
                      onChange={handleInputChange}
                      className="w-full rounded-lg border border-slate-300 dark:border-white/30 bg-white dark:bg-zinc-700/90 px-3 py-2 text-sm text-slate-900 dark:text-zinc-50 outline-none ring-0 transition focus:border-cyan-400/70 focus:ring-2 focus:ring-cyan-500/50 shadow-sm"
                    />
                  </div>
                  <div className="space-y-2.5">
                    <label htmlFor="endDate" className="block text-[11px] font-medium uppercase tracking-[0.16em] text-zinc-400">End date</label>
                    <input
                      type="date"
                      id="endDate"
                      name="endDate"
                      value={formData.endDate}
                      onChange={handleInputChange}
                      className="w-full rounded-lg border border-slate-300 dark:border-white/30 bg-white dark:bg-zinc-700/90 px-3 py-2 text-sm text-slate-900 dark:text-zinc-50 outline-none ring-0 transition focus:border-cyan-400/70 focus:ring-2 focus:ring-cyan-500/50 shadow-sm"
                    />
                  </div>
                </div>
              )}
              <div className="flex items-end justify-end gap-2">
                <p className="hidden text-[11px] text-zinc-400 sm:inline">Powered by curated job APIs. No spammy listings.</p>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-white/5 flex flex-col xl:flex-row xl:items-center gap-4 justify-between">
              <div className="flex flex-wrap items-center gap-3">
                {isStatsLoading ? (
                  <div className="flex gap-2">
                    <span className="inline-flex items-center gap-2 rounded-full border border-zinc-700 bg-zinc-800/50 px-3 py-1.5 h-[30px] w-[120px] animate-pulse" />
                    <span className="inline-flex items-center gap-2 rounded-full border border-zinc-700 bg-zinc-800/50 px-3 py-1.5 h-[30px] w-[120px] animate-pulse" />
                  </div>
                ) : (
                  <>
                    <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider ${
                      searchAttemptsUsed >= maxSearchAttempts
                        ? 'border-red-500/30 bg-red-500/5 text-red-600 dark:bg-red-500/10 dark:text-red-400'
                        : 'border-slate-200 dark:border-zinc-700 bg-slate-100 dark:bg-zinc-800/80 text-slate-500 dark:text-zinc-300'
                    }`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${searchAttemptsUsed >= maxSearchAttempts ? 'bg-red-400' : 'bg-sky-400 shadow-[0_0_10px_rgba(56,189,248,1)]'}`} />
                      {Math.max(0, maxSearchAttempts - searchAttemptsUsed)} searches left
                    </span>

                    <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider ${
                      assignmentsUsed >= maxAssignments
                        ? 'border-red-500/30 bg-red-500/5 text-red-600 dark:bg-red-500/10 dark:text-red-400'
                        : 'border-slate-200 dark:border-zinc-700 bg-slate-100 dark:bg-zinc-800/80 text-slate-500 dark:text-zinc-300'
                    }`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${assignmentsUsed >= maxAssignments ? 'bg-red-400' : 'bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,1)]'}`} />
                      {Math.max(0, maxAssignments - assignmentsUsed)} applications left
                    </span>
                    
                    <div className="group/info relative">
                      <span className="flex h-5 w-5 items-center justify-center rounded-full border border-slate-300 dark:border-zinc-700 bg-white/50 dark:bg-zinc-800/50 text-[10px] font-bold text-slate-400 dark:text-zinc-500 cursor-help hover:border-sky-400 hover:text-sky-400 transition-colors">
                        i
                      </span>
                      <div className="pointer-events-none absolute bottom-full left-1/2 mb-2 -translate-x-1/2 w-64 rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 p-3 text-[11px] leading-relaxed text-slate-600 dark:text-zinc-400 opacity-0 group-hover/info:opacity-100 transition-opacity shadow-xl z-50">
                        <p className="font-bold text-slate-900 dark:text-zinc-100 mb-1">Quota Information</p>
                        <ul className="space-y-1.5 list-disc pl-3">
                          <li><span className="text-sky-500 font-bold">Searches</span>: Total times you can run a new job scan per week.</li>
                          <li><span className="text-emerald-500 font-bold">Applications</span>: Total jobs the JA team will process and apply for you this week.</li>
                        </ul>
                      </div>
                    </div>
                    
                    <p className="hidden text-[10px] text-zinc-500 xl:inline italic">
                      Limits reset every Monday.
                    </p>
                  </>
                )}
              </div>

              <div className="group relative">
                <button
                  onClick={() => {
                    if (loading && activeService === selectedSource) {
                      handleStopSearch();
                    } else if (selectedSource) {
                      handleSearch(selectedSource);
                    }
                  }}
                  disabled={(disabledSearch || !selectedSource) && !(loading && activeService)}
                  className={`w-full xl:w-auto inline-flex items-center justify-center gap-2 rounded-lg border px-8 py-2.5 text-sm font-semibold text-zinc-50 transition disabled:cursor-not-allowed disabled:opacity-50 ${
                    loading && activeService
                      ? "border-red-400/60 bg-red-600 dark:bg-red-900/60 shadow-[0_10px_30px_rgba(220,38,38,0.3)] hover:bg-red-700 dark:hover:bg-red-900/70"
                      : selectedTheme
                      ? selectedTheme.buttonClass
                      : "border-slate-300 dark:border-zinc-600 bg-slate-100 dark:bg-zinc-800/60 text-slate-400 dark:text-zinc-500"
                  }`}>
                  {loading && activeService ? (
                    <span className="inline-flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-red-400" /><span>Stop</span></span>
                  ) : (
                    <span className="inline-flex items-center gap-2">
                      <span className={`h-1.5 w-1.5 rounded-full ${selectedTheme ? selectedTheme.dotClass : "bg-zinc-500"}`} />
                      <span>{selectedSource ? `Search via ${getSourceLabel(selectedSource)}` : "Select a source"}</span>
                    </span>
                  )}
                </button>
                {searchAttemptsExhausted && (
                  <div className="pointer-events-none absolute -top-10 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-zinc-800 px-3 py-1.5 text-xs text-zinc-300 opacity-0 transition-opacity group-hover:opacity-100 shadow-xl border border-zinc-700">
                    Weekly search limit reached.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <aside className={`subtle-card relative flex flex-col p-4 sm:p-5 lg:p-6 overflow-hidden lg:min-h-0 lg:h-full min-h-[500px] ${mobileTab === 'results' ? 'flex' : 'hidden lg:flex'}`}>

          <div className="flex flex-col h-full lg:min-h-0">
            <div className="mb-4 flex items-center justify-between border-b border-slate-200/60 dark:border-white/5 pb-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-400">
                {jobs.length > 0 ? "Active Results" : "Recent History"}
              </p>
              {searchHistory.length > 0 && jobs.length === 0 && (
                <span className="text-[10px] font-medium text-zinc-500">{searchHistory.length} saved</span>
              )}
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar pr-1 -mr-1">
              {!hasSearched || jobs.length === 0 ? (
                <div className="space-y-3">
                  {searchHistory.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-slate-200 dark:border-zinc-800 p-8 text-center">
                      <p className="text-xs text-zinc-400 italic">No search history available yet.</p>
                      <p className="text-[10px] text-zinc-500 mt-2">Your recent searches will appear here for quick access.</p>
                    </div>
                  ) : (
                    <div className="grid gap-2.5">
                      {searchHistory.map((item) => (
                        <div key={item.id} className="group relative rounded-xl border border-slate-200 dark:border-zinc-800/80 bg-white/50 dark:bg-zinc-900/40 p-3.5 transition hover:border-emerald-500/30 hover:bg-white dark:hover:bg-zinc-900/60 shadow-sm">
                           <div className="flex flex-col gap-2">
                             <div className="flex items-start justify-between gap-3">
                               <h4 className="text-[13px] font-bold text-slate-800 dark:text-zinc-200 line-clamp-1">{item.formData.jobTitle || "Untitled Search"}</h4>
                               <span className="shrink-0 text-[8px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded uppercase tracking-wider">{getSourceLabel(item.service)}</span>
                             </div>
                             <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 text-[10px] text-zinc-500">
                                  <span>{item.formData.city || "Remote"}</span>
                                  <span>•</span>
                                  <span>{item.jobs?.length || 0} roles</span>
                                </div>
                                <button 
                                  onClick={() => restoreFromHistory(item)}
                                  className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors"
                                >
                                  Restore
                                </button>
                             </div>
                           </div>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {/* Minimized Tips */}
                  {searchHistory.length > 0 && (
                    <div className="mt-8 pt-6 border-t border-slate-200 dark:border-zinc-800/50">
                       <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-3">Search Tips</p>
                       <div className="space-y-3 opacity-60">
                          <div className="flex gap-3">
                             <div className="w-1 h-1 rounded-full bg-sky-500 mt-1.5" />
                             <p className="text-[11px] text-slate-600 dark:text-zinc-400 italic leading-relaxed">Layer multiple filters to avoid generic listings and find high-quality leads.</p>
                          </div>
                          <div className="flex gap-3">
                             <div className="w-1 h-1 rounded-full bg-emerald-500 mt-1.5" />
                             <p className="text-[11px] text-slate-600 dark:text-zinc-400 italic leading-relaxed">Export results to CSV to maintain a persistent record of your search runs.</p>
                          </div>
                       </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="mb-4 flex items-center justify-between border-b border-white/5 pb-4">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900 dark:text-zinc-50">
                    {jobs.length} matching {jobs.length === 1 ? "role" : "roles"}
                  </h2>
                  <p className="text-[11px] text-zinc-400 mt-0.5">
                    Source: <span className="text-zinc-300">
                      {getSourceLabel(activeService)}
                    </span>
                  </p>
                </div>
                
                <div className="text-right">
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 dark:border-zinc-700/80 bg-slate-50 dark:bg-zinc-800/80 px-2.5 py-1 text-[11px] font-medium text-slate-500 dark:text-zinc-300">
                    <span className={`h-1.5 w-1.5 rounded-full ${assignmentsUsed >= maxAssignments ? 'bg-red-400' : 'bg-emerald-400'}`} />
                    {assignmentsUsed} / {maxAssignments} assigned this week
                  </span>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto pr-2 space-y-3 custom-scrollbar">
                {jobs.map((job: Job) => (
                  <article
                    key={job.id}
                    className="group flex flex-col justify-between rounded-xl border border-slate-200 dark:border-zinc-700/80 bg-white dark:bg-zinc-950/80 p-4 text-sm text-slate-700 dark:text-zinc-200 shadow-sm dark:shadow-md transition hover:-translate-y-0.5 hover:border-sky-400/50"
                  >
                    <div>
                      <div className="mb-2 flex items-start justify-between gap-3">
                        <div>
                          <h3 className="line-clamp-2 text-sm font-semibold text-slate-900 dark:text-zinc-50">
                            {job.title || "Untitled role"}
                          </h3>
                          <p className="mt-0.5 text-[12px] text-slate-500 dark:text-zinc-300">
                            {job.company || "Company not specified"}
                          </p>
                        </div>
                        {job.posted && (
                          <div className="text-right text-[10px] text-zinc-400 whitespace-nowrap">
                            {(() => {
                              try {
                                const date = new Date(job.posted);
                                return isNaN(date.getTime()) ? job.posted : date.toLocaleDateString();
                              } catch {
                                return job.posted;
                              }
                            })()}
                          </div>
                        )}
                      </div>

                      <div className="mb-3 flex flex-wrap gap-1.5 text-[10px] text-zinc-300">
                        {job.location && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 dark:bg-zinc-900/80 px-2 py-0.5">
                            📍 {job.location}
                          </span>
                        )}
                        {job.salary && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 dark:bg-zinc-900/80 px-2 py-0.5">
                            💰 {job.salary}
                          </span>
                        )}
                        {job.remote && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-300 px-2 py-0.5">
                            Remote
                          </span>
                        )}
                      </div>
                    </div>

                    {job.description && (
                      <div className="mb-3 mt-1">
                        <p className="line-clamp-3 text-[11px] leading-relaxed text-zinc-400">
                          {job.description.substring(0, 200)}
                          {job.description.length > 200 ? "..." : ""}
                        </p>
                      </div>
                    )}

                    <div className="mt-2 flex items-center justify-between pt-3 border-t border-slate-100 dark:border-zinc-800/60">
                      {job.applyLink ? (
                        <a
                          href={job.applyLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[11px] text-zinc-400 hover:text-sky-300 underline underline-offset-2 transition"
                        >
                          View Source ↗
                        </a>
                      ) : (
                        <span className="text-[11px] text-zinc-500">No public link</span>
                      )}

                      <button
                        disabled={assignmentsUsed >= maxAssignments || assigningJobId === job.id || assignedJobIds.has(jobKey(job))}
                        onClick={() => handleAssignToJA(job)}
                        className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[11px] font-semibold transition ${
                          assignedJobIds.has(jobKey(job))
                            ? "bg-emerald-100/50 dark:bg-emerald-900/30 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 cursor-default"
                            : assignmentsUsed >= maxAssignments
                            ? "bg-slate-100 dark:bg-zinc-800 text-slate-400 dark:text-zinc-500 cursor-not-allowed"
                            : "border border-emerald-400/60 bg-emerald-500/10 dark:bg-emerald-500/15 text-emerald-600 dark:text-emerald-300 hover:bg-emerald-500/20 dark:hover:bg-emerald-500/25 hover:border-emerald-400"
                        }`}
                      >
                        {assigningJobId === job.id ? (
                          <>
                            <span className="h-3 w-3 animate-spin rounded-full border-2 border-emerald-400 border-t-transparent" />
                            Adding...
                          </>
                        ) : assignedJobIds.has(jobKey(job)) ? (
                          <>
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                            In Pipeline ✓
                          </>
                        ) : (
                          <>
                            <span className={`h-1.5 w-1.5 rounded-full ${assignmentsUsed >= maxAssignments ? 'bg-zinc-500' : 'bg-emerald-400'}`} />
                            Add to Pipeline
                          </>
                        )}
                      </button>
                    </div>
                  </article>
                ))}
              </div>
              
              <div className="mt-4 pt-4 border-t border-white/5 flex justify-between items-center">
                 <button
                    onClick={downloadCsv}
                    className="text-[11px] text-zinc-400 hover:text-zinc-200 transition"
                  >
                    Download CSV Backup
                  </button>
              </div>
            </div>
          )}
        </div>
      </div>
        </aside>
      </section>

      {error && (
        <div className="rounded-xl border border-red-500/30 bg-red-50 dark:bg-red-950/60 px-4 py-3 text-sm text-red-600 dark:text-red-200 shadow-md sm:px-5">
          {error}
        </div>
      )}

      {searchProgress && activeService && (
        <div
          className={`rounded-xl border px-4 py-3 text-sm shadow-[0_15px_35px_rgba(0,0,0,0.65)] sm:px-5 ${
            activeTheme ? activeTheme.progressOuterClass : "border-blue-500/30 bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-200"
          }`}
        >
          <div className="flex items-center gap-3">
            <span
              className={`h-2 w-2 animate-pulse rounded-full ${activeTheme ? activeTheme.progressDotClass : "bg-blue-400"}`}
            />
            <span>
              Scanning{" "}
              {getSourceLabel(activeService)}
              ... {searchProgress.count} / {searchProgress.maxResults} results
              found
            </span>
          </div>
          <div
            className={`mt-2 h-1.5 w-full overflow-hidden rounded-full ${activeTheme ? activeTheme.progressTrackClass : "bg-blue-900/50"}`}
          >
            <div
              className={`h-full transition-all duration-300 ${activeTheme ? activeTheme.progressFillClass : "bg-blue-400"}`}
              style={{
                width: `${Math.min(
                  (searchProgress.count / searchProgress.maxResults) * 100,
                  100
                )}%`,
              }}
            />
          </div>
        </div>
      )}

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}

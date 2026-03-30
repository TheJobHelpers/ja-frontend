"use client";

import React, { useState, useLayoutEffect, useRef, useEffect } from "react";
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
  city: string;
  country: string;
  datePosted: string;
}

interface Country {
  code: string;
  name: string;
}

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

  const [activeTab, setActiveTab] = useState<'search' | 'history'>('search');

  const [formData, setFormData] = useState<FormData>({
    jobTitle: "",
    industry: "",
    salaryMin: "",
    salaryMax: "",
    jobType: "",
    city: "",
    country: "",
    datePosted: "",
  });

  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [activeService, setActiveService] = useState<
    "jsearch" | "indeed" | "linkedin" | null
  >(null);
  const [searchProgress, setSearchProgress] = useState<{
    count: number;
    maxResults: number;
    status: string;
  } | null>(null);
  const [indeedRunId, setIndeedRunId] = useState<string | null>(null);
  const [streamController, setStreamController] =
    useState<AbortController | null>(null);

  // Assignment states — quota loaded from backend on mount
  const [assignmentsUsed, setAssignmentsUsed] = useState<number>(0);
  const [maxAssignments, setMaxAssignments] = useState<number>(15);
  const [assigningJobId, setAssigningJobId] = useState<string | null>(null);
  const [assignedJobIds, setAssignedJobIds] = useState<Set<string>>(new Set());

  // Search attempts used — 3 attempts per week, pick up to 15 jobs
  const [searchAttemptsUsed, setSearchAttemptsUsed] = useState<number>(0);
  const [maxSearchAttempts, setMaxSearchAttempts] = useState<number>(3);
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
        const { getClientToken } = await import("../../lib/clientAuth");
        const token = getClientToken();
        const headers: Record<string, string> = {};
        if (token) headers["Authorization"] = `Bearer ${token}`;

        // Quota
        const statsRes = await fetch("/api/client/jobs/stats", { headers });
        if (statsRes.ok) {
          const stats = await statsRes.json();
          setAssignmentsUsed(stats.assignments_used ?? 0);
          setMaxAssignments(stats.max_assignments ?? 15);
          setSearchAttemptsUsed(stats.search_attempts_used ?? 0);
          setMaxSearchAttempts(stats.max_search_attempts ?? 3);
        }

        // Pre-load existing assigned jobs to populate the "Assigned ✓" state
        // and prevent duplicates
        const jobsRes = await fetch("/api/client/jobs", { headers });
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
          existingJobs.forEach((j: any) => {
            const key = `${(j.job_title || "").toLowerCase()}|${(j.company || "").toLowerCase()}`;
            alreadyAssigned.add(key);
          });
          setAssignedJobIds(alreadyAssigned);
        }

        // Search history from backend
        const histRes = await fetch("/api/client/search-history", { headers });
        if (histRes.ok) {
          const histData = await histRes.json();
          const backendHistory = Array.isArray(histData) ? histData : histData?.data ?? [];
          if (backendHistory.length > 0) {
            // Normalize backend history to UI schema
            const normalizedBackend = backendHistory.map((h: any) => ({
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
        const { getClientToken } = await import("../../lib/clientAuth");
        const token = getClientToken();
        const headers: Record<string, string> = {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        };

        const res = await fetch("/api/client/search-history", {
          method: "POST",
          headers,
          body: JSON.stringify({
            query_params: currentForm,
            results: newJobs,
            service,
          }),
        });

        if (res.ok) {
          // Re-sync quota from backend to ensure exactness
          const statsRes = await fetch("/api/client/jobs/stats", { headers: token ? { Authorization: `Bearer ${token}` } : {} });
          if (statsRes.ok) {
            const stats = await statsRes.json();
            setSearchAttemptsUsed(stats.search_attempts_used ?? 0);
          }
        }
      } catch { /* non-critical */ }
    })();
  };

  const restoreFromHistory = (item: any) => {
    setFormData(item.formData);
    setJobs(item.jobs);
    setActiveService(item.service as any);
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
      const { getClientToken } = await import("../../lib/clientAuth");
      const token = getClientToken();
      const res = await fetch("/api/client/jobs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify({
          job_title: job.title,
          company: job.company,
          location: job.location ?? "",
          apply_link: job.applyLink ?? "",
          description: job.description ?? "",
          match_score: 0,
          source: "client_selected",
          status: "queued",
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

    const source =
      activeService === "jsearch"
        ? "jsearch"
        : activeService === "indeed"
        ? "indeed"
        : activeService === "linkedin"
        ? "linkedin"
        : "jobs";

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

    // Prevent negative values for salary fields
    if ((name === "salaryMin" || name === "salaryMax") && value !== "") {
      const numValue = parseFloat(value);
      if (numValue < 0) {
        // Don't update if negative value
        return;
      }
    }

    setFormData((prev: FormData) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSearch = async (service: "jsearch" | "indeed" | "linkedin") => {
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
      // Use SSE streaming for all services
      // Create abort controller for this request
      const abortController = new AbortController();
      setStreamController(abortController);

      if (
        service === "indeed" ||
        service === "jsearch" ||
        service === "linkedin"
      ) {
        // Use streaming endpoint for all services (use query param for all)
        const endpoint = `/api/${service}?stream=true`;

        const response = await fetch(endpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
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
                      maxResults: service === "jsearch" ? 15 : 20,
                      status: "starting",
                    });
                  } else if (data.type === "progress") {
                    setSearchProgress({
                      count: data.count || 0,
                      maxResults:
                        data.max_results || (service === "jsearch" ? 15 : 20),
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
        // Regular fetch for jsearch and linkedin
        const response = await fetch(`/api/${service}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
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

  return (
    <div className="mx-auto flex lg:h-[calc(100vh-104px)] min-h-[calc(100vh-104px)] max-w-[1600px] flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
      
      {/* Tab Navigation */}
      <div className="mb-2 flex space-x-6 border-b border-zinc-800/60 pb-1">
        <button
          onClick={() => setActiveTab('search')}
          className={`pb-3 text-sm font-semibold transition border-b-2 ${activeTab === 'search' ? 'border-sky-400 text-sky-400' : 'border-transparent text-zinc-400 hover:text-zinc-200'}`}
        >
          New Search
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`pb-3 text-sm font-semibold transition border-b-2 ${activeTab === 'history' ? 'border-emerald-400 text-emerald-400' : 'border-transparent text-zinc-400 hover:text-zinc-200'}`}
        >
          Search History
        </button>
      </div>

      {activeTab === 'history' ? (
        <section className="flex flex-col gap-4 lg:overflow-y-auto pr-2 lg:custom-scrollbar lg:min-h-0">
          {searchHistory.length === 0 ? (
            <div className="glass-panel p-8 text-center text-zinc-400 text-sm">
              No search history available yet.
            </div>
          ) : (
            searchHistory.map((item) => (
              <div key={item.id} className="glass-panel p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6 transition hover:border-emerald-500/30">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-bold text-zinc-200">{item.formData.jobTitle || "Untitled Search"}</h3>
                    <span className="pill-badge inline-flex items-center gap-1.5 px-2.5 py-0.5 text-[10px]">
                      {item.service}
                    </span>
                  </div>
                  <p className="text-sm text-zinc-400">
                    {item.formData.city || "Remote"} • {item.jobs?.length || 0} matching roles
                  </p>
                  <p className="text-xs text-zinc-500 mt-3">
                    Searched at {new Date(item.timestamp).toLocaleString()}
                  </p>
                </div>
                <button
                  onClick={() => {
                    restoreFromHistory(item);
                    setActiveTab('search');
                  }}
                  className="shrink-0 rounded-lg bg-emerald-500/10 border border-emerald-500/20 px-6 py-3 text-sm font-bold text-emerald-400 transition hover:bg-emerald-500/20 hover:border-emerald-500/40"
                >
                  Restore Results
                </button>
              </div>
            ))
          )}
        </section>
      ) : (
      <section className="grid gap-6 lg:grid-cols-[minmax(0,1.7fr)_minmax(0,1fr)] xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] lg:items-stretch lg:min-h-0 flex-1">
        <div className="glass-panel relative p-6 sm:p-8 flex flex-col lg:overflow-y-auto lg:custom-scrollbar pr-2 sm:pr-4">
          <div className="pointer-events-none absolute inset-0 -z-10 rounded-[1.25rem] border border-white/10" />

          <div className="mb-6 flex items-center gap-3 text-xs text-zinc-400">
            <span className="pill-badge inline-flex items-center gap-1.5 px-3 py-1">
              <span className="h-1.5 w-1.5 rounded-full bg-sky-400 shadow-[0_0_18px_rgba(56,189,248,1)]" />
              <span className="font-medium text-[11px] uppercase tracking-[0.18em] text-zinc-200">
                Smart Job Search
              </span>
            </span>
            <span className="hidden sm:inline text-[11px] text-zinc-500">
              CSV export
            </span>
          </div>

          <div className="mb-7">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
              <div className="space-y-3">
                <h1 className="text-balance text-3xl font-bold tracking-tight text-zinc-50 sm:text-4xl lg:text-5xl">
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

          <div className="mb-6 grid gap-4 rounded-2xl border border-white/10 bg-black/30 p-4 text-xs text-zinc-300 sm:grid-cols-3 sm:gap-3 sm:p-5">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-sky-500/20 text-sky-300 aspect-square">
                <span className="text-[13px] leading-none">1</span>
              </div>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-zinc-400">
                  Target
                </p>
                <p className="text-[13px]">Choose role & filters</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-300 aspect-square">
                <span className="text-[13px] leading-none">2</span>
              </div>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-zinc-400">
                  Scan
                </p>
                <p className="text-[13px]">Hit LinkedIn / JSearch / Indeed</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-indigo-500/20 text-indigo-300 aspect-square">
                <span className="text-[13px] leading-none">3</span>
              </div>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-zinc-400">
                  Save
                </p>
                <p className="text-[13px]">Track in your job list</p>
              </div>
            </div>
          </div>

          <div className="space-y-4 rounded-2xl border border-white/5 bg-black/40 p-4 sm:p-5">
            <div className="grid gap-4 sm:grid-cols-[minmax(0,1.4fr)_minmax(0,1.1fr)]">
              <div className="space-y-3">
                <label
                  htmlFor="jobTitle"
                  className="flex items-center justify-between text-xs font-medium text-zinc-200"
                >
                  <span>Role or title *</span>
                  <span className="text-[11px] text-zinc-400">
                    Try &ldquo;Senior Backend Engineer&rdquo;
                  </span>
                </label>
                <input
                  type="text"
                  id="jobTitle"
                  name="jobTitle"
                  value={formData.jobTitle}
                  onChange={handleInputChange}
                  placeholder="e.g., Staff Frontend Engineer"
                  className="w-full rounded-lg border border-white/30 bg-zinc-700/90 px-3.5 py-2.5 text-sm text-zinc-50 outline-none ring-0 transition focus:border-sky-400/70 focus:ring-2 focus:ring-sky-500/50"
                  required
                />
              </div>

              <div className="space-y-3">
                <label
                  htmlFor="industry"
                  className="flex items-center justify-between text-xs font-medium text-zinc-200"
                >
                  <span>Industry</span>
                  <span className="text-[11px] text-zinc-400">
                    Optional focus (fintech, AI, etc.)
                  </span>
                </label>
                <input
                  type="text"
                  id="industry"
                  name="industry"
                  value={formData.industry}
                  onChange={handleInputChange}
                  placeholder="e.g., Developer tools / AI infra"
                  className="w-full rounded-lg border border-white/30 bg-zinc-700/90 px-3.5 py-2.5 text-sm text-zinc-50 outline-none ring-0 transition focus:border-emerald-400/70 focus:ring-2 focus:ring-emerald-500/50"
                />
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <div className="space-y-2.5">
                <label
                  htmlFor="salaryMin"
                  className="block text-[11px] font-medium uppercase tracking-[0.16em] text-zinc-400"
                >
                  Min salary (USD)
                </label>
                <input
                  type="number"
                  id="salaryMin"
                  name="salaryMin"
                  value={formData.salaryMin}
                  onChange={handleInputChange}
                  placeholder="80,000"
                  min="0"
                  step="1000"
                  className="w-full rounded-lg border border-white/30 bg-zinc-700/90 px-3 py-2 text-sm text-zinc-50 outline-none ring-0 transition focus:border-sky-400/70 focus:ring-2 focus:ring-sky-500/50"
                />
              </div>

              <div className="space-y-2.5">
                <label
                  htmlFor="salaryMax"
                  className="block text-[11px] font-medium uppercase tracking-[0.16em] text-zinc-400"
                >
                  Max salary (USD)
                </label>
                <input
                  type="number"
                  id="salaryMax"
                  name="salaryMax"
                  value={formData.salaryMax}
                  onChange={handleInputChange}
                  placeholder="220,000"
                  min="0"
                  step="1000"
                  className="w-full rounded-lg border border-white/30 bg-zinc-700/90 px-3 py-2 text-sm text-zinc-50 outline-none ring-0 transition focus:border-sky-400/70 focus:ring-2 focus:ring-sky-500/50"
                />
              </div>

              <div className="space-y-2.5">
                <label
                  htmlFor="jobType"
                  className="block text-[11px] font-medium uppercase tracking-[0.16em] text-zinc-400"
                >
                  Work style / type
                </label>
                <select
                  id="jobType"
                  name="jobType"
                  value={formData.jobType}
                  onChange={handleInputChange}
                  className="w-full rounded-lg border border-white/30 bg-zinc-700/90 px-3 py-2 text-sm text-zinc-50 outline-none ring-0 transition focus:border-emerald-400/70 focus:ring-2 focus:ring-emerald-500/50"
                >
                  <option value="">Any</option>
                  <option value="Remote">Remote</option>
                  <option value="On-site">On-site</option>
                  <option value="Hybrid">Hybrid</option>
                  <option value="Full-time">Full-time</option>
                  <option value="Part-time">Part-time</option>
                </select>
              </div>

              <div className="space-y-2.5">
                <label
                  htmlFor="datePosted"
                  className="block text-[11px] font-medium uppercase tracking-[0.16em] text-zinc-400"
                >
                  Freshness
                </label>
                <select
                  id="datePosted"
                  name="datePosted"
                  value={formData.datePosted}
                  onChange={handleInputChange}
                  className="w-full rounded-lg border border-white/30 bg-zinc-700/90 px-3 py-2 text-sm text-zinc-50 outline-none ring-0 transition focus:border-emerald-400/70 focus:ring-2 focus:ring-emerald-500/50"
                >
                  <option value="">Any time</option>
                  <option value="day">Past 24 hours</option>
                  <option value="week">Past week</option>
                  <option value="month">Past month</option>
                </select>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <div className="space-y-2.5">
                <label
                  htmlFor="city"
                  className="block text-[11px] font-medium uppercase tracking-[0.16em] text-zinc-400"
                >
                  City (optional)
                </label>
                <input
                  type="text"
                  id="city"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  placeholder="San Francisco, London..."
                  className="w-full rounded-lg border border-white/30 bg-zinc-700/90 px-3 py-2 text-sm text-zinc-50 outline-none ring-0 transition focus:border-sky-400/70 focus:ring-2 focus:ring-sky-500/50"
                />
              </div>

              <div className="space-y-2.5 relative" ref={countryDropdownRef}>
                <label
                  htmlFor="country"
                  className="block text-[11px] font-medium uppercase tracking-[0.16em] text-zinc-400"
                >
                  Country / region
                </label>
                <button
                  type="button"
                  id="country"
                  onClick={() => setCountryDropdownOpen(!countryDropdownOpen)}
                  className="w-full rounded-lg border border-white/30 bg-zinc-700/90 px-3 py-2 text-sm text-left text-zinc-50 outline-none ring-0 transition focus:border-sky-400/70 focus:ring-2 focus:ring-sky-500/50 flex items-center justify-between gap-2"
                >
                  <span className="flex items-center gap-2 truncate">
                    {selectedCountry ? (
                      <>
                        <img
                          src={`https://flagcdn.com/w20/${selectedCountry.code.toLowerCase()}.png`}
                          alt={selectedCountry.name}
                          className="h-4 w-5 object-cover rounded-sm"
                        />
                        <span>{selectedCountry.name}</span>
                      </>
                    ) : (
                      <span className="text-zinc-400">Select country...</span>
                    )}
                  </span>
                  <svg
                    className={`h-4 w-4 text-zinc-400 transition-transform ${
                      countryDropdownOpen ? "rotate-180" : ""
                    }`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>

                {countryDropdownOpen && (
                  <div className="absolute z-50 mt-1 w-full max-h-60 overflow-hidden rounded-lg border border-white/20 bg-zinc-800/95 shadow-xl backdrop-blur-sm">
                    <div className="sticky top-0 p-2 border-b border-white/10 bg-zinc-800/95">
                      <input
                        type="text"
                        placeholder="Search countries..."
                        value={countrySearch}
                        onChange={(e) => setCountrySearch(e.target.value)}
                        className="w-full rounded-md border border-white/20 bg-zinc-700/90 px-3 py-1.5 text-sm text-zinc-50 outline-none placeholder:text-zinc-400 focus:border-sky-400/70"
                        autoFocus
                      />
                    </div>
                    <div className="max-h-48 overflow-y-auto">
                      {/* Any Country option */}
                      <button
                        type="button"
                        onClick={() => {
                          setFormData((prev) => ({ ...prev, country: "" }));
                          setCountryDropdownOpen(false);
                          setCountrySearch("");
                        }}
                        className={`w-full px-3 py-2 text-left text-sm hover:bg-white/10 flex items-center gap-2 transition ${
                          !formData.country
                            ? "bg-sky-500/20 text-sky-200"
                            : "text-zinc-50"
                        }`}
                      >
                        <span className="text-base">🌐</span>
                        <span>Any country</span>
                      </button>
                      {filteredCountries.map((country) => (
                        <button
                          type="button"
                          key={country.code}
                          onClick={() => {
                            setFormData((prev) => ({
                              ...prev,
                              country: country.code,
                            }));
                            setCountryDropdownOpen(false);
                            setCountrySearch("");
                          }}
                          className={`w-full px-3 py-2 text-left text-sm hover:bg-white/10 flex items-center gap-2 transition ${
                            formData.country === country.code
                              ? "bg-sky-500/20 text-sky-200"
                              : "text-zinc-50"
                          }`}
                        >
                          <img
                            src={`https://flagcdn.com/w20/${country.code.toLowerCase()}.png`}
                            alt={country.name}
                            className="h-4 w-5 object-cover rounded-sm"
                          />
                          <span>{country.name}</span>
                          <span className="ml-auto text-[10px] text-zinc-500">
                            {country.code}
                          </span>
                        </button>
                      ))}
                      {filteredCountries.length === 0 && (
                        <div className="px-3 py-4 text-center text-sm text-zinc-400">
                          No countries found
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-end justify-end gap-2">
                <p className="hidden text-[11px] text-zinc-400 sm:inline">
                  Powered by curated job APIs. No spammy listings.
                </p>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-white/5 flex flex-col xl:flex-row xl:items-center gap-4 justify-between">
              <div className="flex items-center">
                {isStatsLoading ? (
                  <span className="inline-flex items-center gap-2 rounded-full border border-zinc-700 bg-zinc-800/50 px-3 py-1.5 h-[30px] w-[140px] animate-pulse">
                    <span className="h-1.5 w-1.5 rounded-full bg-zinc-600" />
                    <span className="h-2 w-20 rounded bg-zinc-700" />
                  </span>
                ) : (
                  <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-bold ${
                    searchAttemptsExhausted
                      ? 'border-red-500/30 bg-red-500/10 text-red-400'
                      : 'border-zinc-700 bg-zinc-800/80 text-zinc-300'
                  }`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${searchAttemptsExhausted ? 'bg-red-400' : 'bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,1)]'}`} />
                    {searchAttemptsUsed} / {maxSearchAttempts} searches used
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3 w-full xl:w-auto">                <div className="group relative w-full">
                  <button
                    onClick={() => {
                      if (loading && activeService === "linkedin") {
                        handleStopSearch();
                      } else {
                        handleSearch("linkedin");
                      }
                    }}
                    disabled={
                      disabledSearch && !(loading && activeService === "linkedin")
                    }
                    className={`w-full inline-flex items-center justify-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-semibold text-zinc-50 transition disabled:cursor-not-allowed disabled:opacity-50 ${
                      loading && activeService === "linkedin"
                        ? "border-red-400/60 bg-red-900/60 shadow-[0_10px_30px_rgba(127,29,29,0.75)] hover:border-red-400/80 hover:bg-red-900/70"
                        : "border-indigo-400/60 bg-slate-900/70 shadow-[0_10px_30px_rgba(30,64,175,0.75)] hover:border-sky-400/70 hover:bg-slate-900/80"
                    }`}
                  >
                    {loading && activeService === "linkedin" ? (
                      <span className="inline-flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-red-400" />
                        <span className="cursor-pointer">Stop</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-2">
                        <span className="h-1.5 w-1.5 rounded-full bg-indigo-400" />
                        <span className="cursor-pointer">Search via LinkedIn</span>
                      </span>
                    )}
                  </button>
                  {searchAttemptsExhausted && (
                    <div className="pointer-events-none absolute -top-10 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-zinc-800 px-3 py-1.5 text-xs text-zinc-300 opacity-0 transition-opacity group-hover:opacity-100 shadow-xl border border-zinc-700">
                      Weekly search limit reached.
                    </div>
                  )}
                </div>
                <div className="group relative w-full">
                  <button
                    onClick={() => {
                      if (loading && activeService === "jsearch") {
                        handleStopSearch();
                      } else {
                        handleSearch("jsearch");
                      }
                    }}
                    disabled={
                      disabledSearch && !(loading && activeService === "jsearch")
                    }
                    className={`w-full inline-flex items-center justify-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-semibold text-zinc-50 transition disabled:cursor-not-allowed disabled:opacity-50 ${
                      loading && activeService === "jsearch"
                        ? "border-red-400/60 bg-red-900/60 shadow-[0_10px_30px_rgba(127,29,29,0.75)] hover:border-red-400/80 hover:bg-red-900/70"
                        : "border-sky-400/60 bg-slate-900/60 shadow-[0_10px_35px_rgba(56,189,248,0.85)] hover:border-sky-400/80 hover:bg-slate-900/70"
                    }`}
                  >
                    {loading && activeService === "jsearch" ? (
                      <span className="inline-flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-red-400" />
                        <span className="cursor-pointer">Stop</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-2">
                        <span className="h-1.5 w-1.5 rounded-full bg-sky-400 shadow-[0_0_14px_rgba(56,189,248,1)]" />
                        <span className="cursor-pointer">Search via JSearch</span>
                      </span>
                    )}
                  </button>
                  {searchAttemptsExhausted && (
                    <div className="pointer-events-none absolute -top-10 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-zinc-800 px-3 py-1.5 text-xs text-zinc-300 opacity-0 transition-opacity group-hover:opacity-100 shadow-xl border border-zinc-700">
                      Weekly search limit reached.
                    </div>
                  )}
                </div>

                <div className="group relative w-full">
                  <button
                    onClick={() => {
                      if (loading && activeService === "indeed") {
                        handleStopSearch();
                      } else {
                        handleSearch("indeed");
                      }
                    }}
                    disabled={
                      disabledSearch && !(loading && activeService === "indeed")
                    }
                    className={`w-full inline-flex items-center justify-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-semibold text-zinc-50 transition disabled:cursor-not-allowed disabled:opacity-50 ${
                      loading && activeService === "indeed"
                        ? "border-red-400/60 bg-red-900/60 shadow-[0_10px_30px_rgba(127,29,29,0.75)] hover:border-red-400/80 hover:bg-red-900/70"
                        : "border-emerald-400/60 bg-slate-900/60 shadow-[0_10px_30px_rgba(6,95,70,0.85)] hover:border-emerald-400/80 hover:bg-slate-900/70"
                    }`}
                  >
                    {loading && activeService === "indeed" ? (
                      <span className="inline-flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-red-400" />
                        <span className="cursor-pointer">Stop</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-2">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                        <span className="cursor-pointer">Search via Indeed</span>
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
        </div>

        <aside className="subtle-card relative flex flex-col p-4 sm:p-5 lg:p-6 overflow-hidden lg:min-h-0 lg:h-full min-h-[500px]">
          <div className="absolute inset-0 -z-10 rounded-[0.9rem] border border-white/5" />

          {!hasSearched || jobs.length === 0 ? (
            <div className="flex flex-col h-full justify-between">
              <div className="space-y-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-400">
                  Snapshot
                </p>
                <p className="text-balance text-sm text-zinc-100">
                  Design your search like a professional: tighten your filters,
                  compare stacks, and export a focused shortlist you can actually
                  work through.
                </p>

                <div className="mt-4 grid gap-3 text-[11px] text-zinc-300">
                  <div className="flex items-start justify-between rounded-lg border border-zinc-700/80 bg-zinc-900/70 px-3 py-2.5">
                    <div>
                      <p className="font-semibold text-zinc-100">
                        Search confidence
                      </p>
                      <p className="mt-1 text-[11px] text-zinc-400">
                        Layer multiple filters to avoid generic listings.
                      </p>
                    </div>
                    <span className="ml-3 rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-semibold text-emerald-300">
                      Recommended
                    </span>
                  </div>

                  <div className="flex items-start justify-between rounded-lg border border-zinc-700/80 bg-zinc-900/70 px-3 py-2.5">
                    <div>
                      <p className="font-semibold text-zinc-100">
                        Three engines, one UI
                      </p>
                      <p className="mt-1 text-[11px] text-zinc-400">
                        Compare each engine&apos;s results for the same role.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start justify-between rounded-lg border border-zinc-700/80 bg-zinc-900/70 px-3 py-2.5">
                    <div>
                      <p className="font-semibold text-zinc-100">
                        CSV as source-of-truth
                      </p>
                      <p className="mt-1 text-[11px] text-zinc-400">
                        Export once, track outreach in your own system.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex items-center justify-between rounded-xl border border-zinc-700/80 bg-zinc-900/80 px-3.5 py-2.5 text-[11px] text-zinc-300">
                <div className="space-y-0.5">
                  <p className="font-semibold text-zinc-100">
                    No active results yet
                  </p>
                  <p className="text-[10px] text-zinc-400">
                    Run a search to see live opportunities here.
                  </p>
                </div>

                <button
                  onClick={downloadCsv}
                  disabled={!jobs.length}
                  className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/60 bg-emerald-500/15 px-3 py-1.5 text-[11px] font-semibold text-emerald-200 shadow-[0_10px_25px_rgba(6,78,59,0.7)] transition hover:bg-emerald-500/25 disabled:cursor-not-allowed disabled:border-zinc-600 disabled:bg-zinc-800 disabled:text-zinc-400"
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-300" />
                  <span className="cursor-pointer">Download CSV</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col h-full lg:min-h-0">
              <div className="mb-4 flex items-center justify-between border-b border-white/5 pb-4">
                <div>
                  <h2 className="text-lg font-semibold text-zinc-50">
                    {jobs.length} matching {jobs.length === 1 ? "role" : "roles"}
                  </h2>
                  <p className="text-[11px] text-zinc-400 mt-0.5">
                    Source: <span className="text-zinc-300">
                      {activeService === "jsearch" ? "JSearch" : activeService === "indeed" ? "Indeed" : activeService === "linkedin" ? "LinkedIn" : "Multiple"}
                    </span>
                  </p>
                </div>
                
                <div className="text-right">
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-zinc-700/80 bg-zinc-800/80 px-2.5 py-1 text-[11px] font-medium text-zinc-300">
                    <span className={`h-1.5 w-1.5 rounded-full ${assignmentsUsed >= maxAssignments ? 'bg-red-400' : 'bg-emerald-400'}`} />
                    {assignmentsUsed} / {maxAssignments} assigned this week
                  </span>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto pr-2 space-y-3 custom-scrollbar">
                {jobs.map((job: Job) => (
                  <article
                    key={job.id}
                    className="group flex flex-col justify-between rounded-xl border border-zinc-700/80 bg-zinc-950/80 p-4 text-sm text-zinc-200 shadow-md transition hover:-translate-y-0.5 hover:border-sky-400/50"
                  >
                    <div>
                      <div className="mb-2 flex items-start justify-between gap-3">
                        <div>
                          <h3 className="line-clamp-2 text-sm font-semibold text-zinc-50">
                            {job.title || "Untitled role"}
                          </h3>
                          <p className="mt-0.5 text-[12px] text-zinc-300">
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
                          <span className="inline-flex items-center gap-1 rounded-full bg-zinc-900/80 px-2 py-0.5">
                            📍 {job.location}
                          </span>
                        )}
                        {job.salary && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-zinc-900/80 px-2 py-0.5">
                            💰 {job.salary}
                          </span>
                        )}
                        {job.remote && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 text-emerald-300 px-2 py-0.5">
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

                    <div className="mt-2 flex items-center justify-between pt-3 border-t border-zinc-800/60">
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
                            ? "bg-emerald-900/30 border border-emerald-400/30 text-emerald-400 cursor-default"
                            : assignmentsUsed >= maxAssignments
                            ? "bg-zinc-800 text-zinc-500 cursor-not-allowed"
                            : "border border-emerald-400/60 bg-emerald-500/15 text-emerald-300 hover:bg-emerald-500/25 hover:border-emerald-400"
                        }`}
                      >
                        {assigningJobId === job.id ? (
                          <>
                            <span className="h-3 w-3 animate-spin rounded-full border-2 border-emerald-400 border-t-transparent" />
                            Requesting...
                          </>
                        ) : assignedJobIds.has(jobKey(job)) ? (
                          <>
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                            Assigned ✓
                          </>
                        ) : (
                          <>
                            <span className={`h-1.5 w-1.5 rounded-full ${assignmentsUsed >= maxAssignments ? 'bg-zinc-500' : 'bg-emerald-400'}`} />
                            Assign to JA
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
        </aside>
      </section>
      )}

      {error && (
        <div className="rounded-xl border border-red-500/30 bg-red-950/60 px-4 py-3 text-sm text-red-200 shadow-[0_15px_35px_rgba(127,29,29,0.65)] sm:px-5">
          {error}
        </div>
      )}

      {searchProgress && activeService && (
        <div
          className={`rounded-xl border px-4 py-3 text-sm shadow-[0_15px_35px_rgba(0,0,0,0.65)] sm:px-5 ${
            activeService === "indeed"
              ? "border-emerald-500/30 bg-emerald-950/20 text-emerald-200"
              : activeService === "jsearch"
              ? "border-sky-500/30 bg-sky-950/20 text-sky-200"
              : "border-blue-500/30 bg-blue-950/20 text-blue-200"
          }`}
        >
          <div className="flex items-center gap-3">
            <span
              className={`h-2 w-2 animate-pulse rounded-full ${
                activeService === "indeed"
                  ? "bg-emerald-400"
                  : activeService === "jsearch"
                  ? "bg-sky-400"
                  : "bg-blue-400"
              }`}
            />
            <span>
              Scanning{" "}
              {activeService === "indeed"
                ? "Indeed"
                : activeService === "jsearch"
                ? "JSearch"
                : "LinkedIn"}
              ... {searchProgress.count} / {searchProgress.maxResults} results
              found
            </span>
          </div>
          <div
            className={`mt-2 h-1.5 w-full overflow-hidden rounded-full ${
              activeService === "indeed"
                ? "bg-emerald-900/50"
                : activeService === "jsearch"
                ? "bg-sky-900/50"
                : "bg-blue-900/50"
            }`}
          >
            <div
              className={`h-full transition-all duration-300 ${
                activeService === "indeed"
                  ? "bg-emerald-400"
                  : activeService === "jsearch"
                  ? "bg-sky-400"
                  : "bg-blue-400"
              }`}
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

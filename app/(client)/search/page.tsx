"use client";

import React, { useState, useRef, useEffect } from "react";

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

const COUNTRIES: Country[] = [
  { code: "AF", name: "Afghanistan" },
  { code: "AL", name: "Albania" },
  { code: "DZ", name: "Algeria" },
  { code: "AU", name: "Australia" },
  { code: "AT", name: "Austria" },
  { code: "BD", name: "Bangladesh" },
  { code: "BE", name: "Belgium" },
  { code: "BR", name: "Brazil" },
  { code: "CA", name: "Canada" },
  { code: "CN", name: "China" },
  { code: "DK", name: "Denmark" },
  { code: "EG", name: "Egypt" },
  { code: "FI", name: "Finland" },
  { code: "FR", name: "France" },
  { code: "DE", name: "Germany" },
  { code: "GH", name: "Ghana" },
  { code: "GR", name: "Greece" },
  { code: "IN", name: "India" },
  { code: "ID", name: "Indonesia" },
  { code: "IE", name: "Ireland" },
  { code: "IL", name: "Israel" },
  { code: "IT", name: "Italy" },
  { code: "JP", name: "Japan" },
  { code: "KE", name: "Kenya" },
  { code: "MY", name: "Malaysia" },
  { code: "MX", name: "Mexico" },
  { code: "NL", name: "Netherlands" },
  { code: "NZ", name: "New Zealand" },
  { code: "NG", name: "Nigeria" },
  { code: "NO", name: "Norway" },
  { code: "PK", name: "Pakistan" },
  { code: "PH", name: "Philippines" },
  { code: "PL", name: "Poland" },
  { code: "PT", name: "Portugal" },
  { code: "SA", name: "Saudi Arabia" },
  { code: "SG", name: "Singapore" },
  { code: "ZA", name: "South Africa" },
  { code: "KR", name: "South Korea" },
  { code: "ES", name: "Spain" },
  { code: "LK", name: "Sri Lanka" },
  { code: "SE", name: "Sweden" },
  { code: "CH", name: "Switzerland" },
  { code: "TH", name: "Thailand" },
  { code: "TR", name: "Turkey" },
  { code: "AE", name: "United Arab Emirates" },
  { code: "GB", name: "United Kingdom" },
  { code: "US", name: "United States" },
  { code: "VN", name: "Vietnam" },
];

export default function ClientSearchPage() {
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

  const [countryDropdownOpen, setCountryDropdownOpen] = useState(false);
  const [countrySearch, setCountrySearch] = useState("");
  const countryDropdownRef = useRef<HTMLDivElement>(null);

  const selectedCountry = COUNTRIES.find((c) => c.code === formData.country);

  const filteredCountries = COUNTRIES.filter(
    (country) =>
      country.name.toLowerCase().includes(countrySearch.toLowerCase()) ||
      country.code.toLowerCase().includes(countrySearch.toLowerCase())
  );

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

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    if ((name === "salaryMin" || name === "salaryMax") && value !== "") {
      const numValue = parseFloat(value);
      if (numValue < 0) return;
    }
    setFormData((prev: FormData) => ({ ...prev, [name]: value }));
  };

  const disabledSearch = !formData.jobTitle.trim();

  return (
    <div className="space-y-6">
      <section className="grid gap-8 xl:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] xl:items-stretch">
        <div className="glass-panel relative p-6 sm:p-8">
          <div className="pointer-events-none absolute inset-0 -z-10 rounded-[1.25rem] border border-white/10" />

          <div className="mb-6 flex items-center gap-3 text-xs text-zinc-400">
            <span className="pill-badge inline-flex items-center gap-1.5 px-3 py-1">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_18px_rgba(16,185,129,1)]" />
              <span className="font-medium text-[11px] uppercase tracking-[0.18em] text-zinc-200">
                Smart Job Search
              </span>
            </span>
          </div>

          <div className="mb-7 space-y-4">
            <h1 className="text-balance text-2xl font-semibold tracking-tight text-zinc-50 sm:text-3xl xl:text-[2.6rem]">
              Find roles that match your stack,
              <span className="bg-linear-to-r from-emerald-400 via-teal-300 to-cyan-300 bg-clip-text text-transparent">
                {" "}not just your title.
              </span>
            </h1>
            <p className="max-w-xl text-sm leading-relaxed text-zinc-300 sm:text-[15px]">
              Surface job roles by skills, salary band, and location — without the
              noisy job board clutter.
            </p>
          </div>

          {/* Steps */}
          <div className="mb-6 grid gap-4 rounded-2xl border border-white/10 bg-black/30 p-4 text-xs text-zinc-300 sm:grid-cols-3 sm:gap-3 sm:p-5">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-300 aspect-square">
                <span className="text-[13px] leading-none">1</span>
              </div>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-zinc-400">Target</p>
                <p className="text-[13px]">Choose role &amp; filters</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-teal-500/20 text-teal-300 aspect-square">
                <span className="text-[13px] leading-none">2</span>
              </div>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-zinc-400">Scan</p>
                <p className="text-[13px]">Hit LinkedIn / JSearch / Indeed</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-cyan-500/20 text-cyan-300 aspect-square">
                <span className="text-[13px] leading-none">3</span>
              </div>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-zinc-400">Save</p>
                <p className="text-[13px]">Track in your job list</p>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="space-y-4 rounded-2xl border border-white/5 bg-black/40 p-4 sm:p-5">
            <div className="grid gap-4 sm:grid-cols-[minmax(0,1.4fr)_minmax(0,1.1fr)]">
              <div className="space-y-3">
                <label htmlFor="c-jobTitle" className="flex items-center justify-between text-xs font-medium text-zinc-200">
                  <span>Role or title *</span>
                  <span className="text-[11px] text-zinc-400">Try &ldquo;Senior Backend Engineer&rdquo;</span>
                </label>
                <input
                  type="text"
                  id="c-jobTitle"
                  name="jobTitle"
                  value={formData.jobTitle}
                  onChange={handleInputChange}
                  placeholder="e.g., Staff Frontend Engineer"
                  className="w-full rounded-lg border border-white/30 bg-zinc-700/90 px-3.5 py-2.5 text-sm text-zinc-50 outline-none ring-0 transition focus:border-emerald-400/70 focus:ring-2 focus:ring-emerald-500/50"
                />
              </div>
              <div className="space-y-3">
                <label htmlFor="c-industry" className="flex items-center justify-between text-xs font-medium text-zinc-200">
                  <span>Industry</span>
                  <span className="text-[11px] text-zinc-400">Optional focus (fintech, AI, etc.)</span>
                </label>
                <input
                  type="text"
                  id="c-industry"
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
                <label htmlFor="c-salaryMin" className="block text-[11px] font-medium uppercase tracking-[0.16em] text-zinc-400">Min salary (USD)</label>
                <input type="number" id="c-salaryMin" name="salaryMin" value={formData.salaryMin} onChange={handleInputChange} placeholder="80,000" min="0" step="1000" className="w-full rounded-lg border border-white/30 bg-zinc-700/90 px-3 py-2 text-sm text-zinc-50 outline-none ring-0 transition focus:border-emerald-400/70 focus:ring-2 focus:ring-emerald-500/50" />
              </div>
              <div className="space-y-2.5">
                <label htmlFor="c-salaryMax" className="block text-[11px] font-medium uppercase tracking-[0.16em] text-zinc-400">Max salary (USD)</label>
                <input type="number" id="c-salaryMax" name="salaryMax" value={formData.salaryMax} onChange={handleInputChange} placeholder="220,000" min="0" step="1000" className="w-full rounded-lg border border-white/30 bg-zinc-700/90 px-3 py-2 text-sm text-zinc-50 outline-none ring-0 transition focus:border-emerald-400/70 focus:ring-2 focus:ring-emerald-500/50" />
              </div>
              <div className="space-y-2.5">
                <label htmlFor="c-jobType" className="block text-[11px] font-medium uppercase tracking-[0.16em] text-zinc-400">Work style / type</label>
                <select id="c-jobType" name="jobType" value={formData.jobType} onChange={handleInputChange} className="w-full rounded-lg border border-white/30 bg-zinc-700/90 px-3 py-2 text-sm text-zinc-50 outline-none ring-0 transition focus:border-emerald-400/70 focus:ring-2 focus:ring-emerald-500/50">
                  <option value="">Any</option>
                  <option value="Remote">Remote</option>
                  <option value="On-site">On-site</option>
                  <option value="Hybrid">Hybrid</option>
                  <option value="Full-time">Full-time</option>
                  <option value="Part-time">Part-time</option>
                </select>
              </div>
              <div className="space-y-2.5">
                <label htmlFor="c-datePosted" className="block text-[11px] font-medium uppercase tracking-[0.16em] text-zinc-400">Freshness</label>
                <select id="c-datePosted" name="datePosted" value={formData.datePosted} onChange={handleInputChange} className="w-full rounded-lg border border-white/30 bg-zinc-700/90 px-3 py-2 text-sm text-zinc-50 outline-none ring-0 transition focus:border-emerald-400/70 focus:ring-2 focus:ring-emerald-500/50">
                  <option value="">Any time</option>
                  <option value="day">Past 24 hours</option>
                  <option value="week">Past week</option>
                  <option value="month">Past month</option>
                </select>
              </div>
            </div>

            {/* City + Country */}
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="space-y-2.5">
                <label htmlFor="c-city" className="block text-[11px] font-medium uppercase tracking-[0.16em] text-zinc-400">City (optional)</label>
                <input type="text" id="c-city" name="city" value={formData.city} onChange={handleInputChange} placeholder="San Francisco, London..." className="w-full rounded-lg border border-white/30 bg-zinc-700/90 px-3 py-2 text-sm text-zinc-50 outline-none ring-0 transition focus:border-emerald-400/70 focus:ring-2 focus:ring-emerald-500/50" />
              </div>

              <div className="space-y-2.5 relative" ref={countryDropdownRef}>
                <label htmlFor="c-country" className="block text-[11px] font-medium uppercase tracking-[0.16em] text-zinc-400">Country / region</label>
                <button
                  type="button"
                  id="c-country"
                  onClick={() => setCountryDropdownOpen(!countryDropdownOpen)}
                  className="w-full rounded-lg border border-white/30 bg-zinc-700/90 px-3 py-2 text-sm text-left text-zinc-50 outline-none ring-0 transition focus:border-emerald-400/70 focus:ring-2 focus:ring-emerald-500/50 flex items-center justify-between gap-2"
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
                  <svg className={`h-4 w-4 text-zinc-400 transition-transform ${countryDropdownOpen ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
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
                        className="w-full rounded-md border border-white/20 bg-zinc-700/90 px-3 py-1.5 text-sm text-zinc-50 outline-none placeholder:text-zinc-400 focus:border-emerald-400/70"
                        autoFocus
                      />
                    </div>
                    <div className="max-h-48 overflow-y-auto">
                      <button
                        type="button"
                        onClick={() => { setFormData((prev) => ({ ...prev, country: "" })); setCountryDropdownOpen(false); setCountrySearch(""); }}
                        className={`w-full px-3 py-2 text-left text-sm hover:bg-white/10 flex items-center gap-2 transition ${!formData.country ? "bg-emerald-500/20 text-emerald-200" : "text-zinc-50"}`}
                      >
                        <span className="text-base">🌐</span>
                        <span>Any country</span>
                      </button>
                      {filteredCountries.map((country) => (
                        <button
                          type="button"
                          key={country.code}
                          onClick={() => { setFormData((prev) => ({ ...prev, country: country.code })); setCountryDropdownOpen(false); setCountrySearch(""); }}
                          className={`w-full px-3 py-2 text-left text-sm hover:bg-white/10 flex items-center gap-2 transition ${formData.country === country.code ? "bg-emerald-500/20 text-emerald-200" : "text-zinc-50"}`}
                        >
                          <img src={`https://flagcdn.com/w20/${country.code.toLowerCase()}.png`} alt={country.name} className="h-4 w-5 object-cover rounded-sm" />
                          <span>{country.name}</span>
                          <span className="ml-auto text-[10px] text-zinc-500">{country.code}</span>
                        </button>
                      ))}
                      {filteredCountries.length === 0 && (
                        <div className="px-3 py-4 text-center text-sm text-zinc-400">No countries found</div>
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

            {/* Search Buttons */}
            <div className="mt-1 space-y-3">
              <div className="inline-flex items-center gap-2 text-[11px] text-zinc-400">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,1)]" />
                <span>
                  Searches powered by{" "}
                  <span className="font-medium text-zinc-200">your resume</span>.
                </span>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  disabled={disabledSearch}
                  className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg border border-indigo-400/60 bg-slate-900/70 px-4 py-2.5 text-sm font-semibold text-zinc-50 shadow-[0_10px_30px_rgba(30,64,175,0.75)] transition hover:border-sky-400/70 hover:bg-slate-900/80 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-indigo-400" />
                  Search via LinkedIn
                </button>
                <button
                  disabled={disabledSearch}
                  className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg border border-sky-400/60 bg-slate-900/60 px-4 py-2.5 text-sm font-semibold text-zinc-50 shadow-[0_10px_35px_rgba(56,189,248,0.85)] transition hover:border-sky-400/80 hover:bg-slate-900/70 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-sky-400 shadow-[0_0_14px_rgba(56,189,248,1)]" />
                  Search via JSearch
                </button>
                <button
                  disabled={disabledSearch}
                  className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg border border-emerald-400/60 bg-slate-900/60 px-4 py-2.5 text-sm font-semibold text-zinc-50 shadow-[0_10px_30px_rgba(6,95,70,0.85)] transition hover:border-emerald-400/80 hover:bg-slate-900/70 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-400" />
                  Search via Indeed
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <aside className="subtle-card relative flex flex-col justify-between p-5 sm:p-6 lg:p-7">
          <div className="absolute inset-0 -z-10 rounded-[0.9rem] border border-white/5" />

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
                  <p className="font-semibold text-zinc-100">Search confidence</p>
                  <p className="mt-1 text-[11px] text-zinc-400">Layer multiple filters to avoid generic listings.</p>
                </div>
                <span className="ml-3 rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-semibold text-emerald-300">Recommended</span>
              </div>

              <div className="flex items-start justify-between rounded-lg border border-zinc-700/80 bg-zinc-900/70 px-3 py-2.5">
                <div>
                  <p className="font-semibold text-zinc-100">Three engines, one UI</p>
                  <p className="mt-1 text-[11px] text-zinc-400">Compare each engine&apos;s results for the same role.</p>
                </div>
              </div>

              <div className="flex items-start justify-between rounded-lg border border-zinc-700/80 bg-zinc-900/70 px-3 py-2.5">
                <div>
                  <p className="font-semibold text-zinc-100">Resume-powered matching</p>
                  <p className="mt-1 text-[11px] text-zinc-400">Results ranked by how well they match your resume.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 flex items-center justify-between rounded-xl border border-zinc-700/80 bg-zinc-900/80 px-3.5 py-2.5 text-[11px] text-zinc-300">
            <div className="space-y-0.5">
              <p className="font-semibold text-zinc-100">No active results yet</p>
              <p className="text-[10px] text-zinc-400">Run a search to see live opportunities here.</p>
            </div>
            <button
              disabled
              className="inline-flex items-center gap-1.5 rounded-full border border-zinc-600 bg-zinc-800 px-3 py-1.5 text-[11px] font-semibold text-zinc-400 cursor-not-allowed"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-300" />
              <span>Download CSV</span>
            </button>
          </div>
        </aside>
      </section>
    </div>
  );
}

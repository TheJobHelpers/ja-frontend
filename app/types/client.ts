// ─── Client Types ────────────────────────────────────────────

export type JobStatus =
  | "assigned"
  | "saved"
  | "applied"
  | "interviewing"
  | "offer"
  | "rejected";

export type JobOrigin = "admin_assigned" | "client_saved";

export interface ClientResume {
  blob_url: string;
  filename: string;
  extracted_text: string;
  uploaded_at: string;
}

export interface ClientPreferences {
  role?: string;
  industry?: string;
  salary_min?: number;
  salary_max?: number;
  work_type?: string; // "Remote" | "Hybrid" | "On-site"
  locations?: string[]; // Country codes
}

export interface ClientUser {
  id: string;
  email: string;
  full_name: string;
  phone?: string;
  disabled: boolean;
  resume?: ClientResume;
  preferences?: ClientPreferences;
  daily_search_limit: number;
  searches_today: number;
  searches_reset_at: string;
  created_at: string;
  updated_at: string;
}

export interface SavedJob {
  id: string;
  client_id: string;
  job_title: string;
  company: string;
  location: string;
  salary?: string;
  description: string;
  apply_link: string;
  source: string; // "linkedin" | "indeed" | "jsearch" | "manual"
  origin: JobOrigin;
  assigned_by?: string;
  assigned_at?: string;
  status: JobStatus;
  client_notes?: string;
  admin_notes?: string;
  match_score?: number;
  saved_at: string;
  status_updated_at: string;
  status_updated_by?: string; // "admin" | "client"
}

export interface SearchHistoryEntry {
  id: string;
  query_params: Record<string, string>;
  sources_used: string[];
  result_count: number;
  searched_at: string;
}

export interface SearchQuota {
  used: number;
  limit: number;
  resets_at: string;
}

export interface ClientLoginRequest {
  email: string;
  password: string;
}

export interface ClientLoginResponse {
  access_token: string;
  token_type: string;
}

export interface ClientProfileUpdateRequest {
  full_name?: string;
  phone?: string;
  preferences?: ClientPreferences;
}

export interface SaveJobRequest {
  job_title: string;
  company: string;
  location: string;
  salary?: string;
  description: string;
  apply_link: string;
  source: string;
  match_score?: number;
}

export interface UpdateJobRequest {
  status?: JobStatus;
  client_notes?: string;
}

// ─── Admin Types ─────────────────────────────────────────────

import type { ClientUser, SavedJob, JobStatus } from "./client";

export interface AdminClient extends ClientUser {
  assigned_jobs_count: number;
  applied_count: number;
  last_active?: string;
}

export interface TrackerFilters {
  client_id?: string;
  status?: JobStatus;
  origin?: "admin_assigned" | "client_saved";
  sort?: string; // e.g., "-status_updated_at"
}

export interface BulkStatusUpdate {
  job_ids: string[];
  status: JobStatus;
  admin_note?: string;
}

export interface AssignJobRequest {
  job_title: string;
  company: string;
  location: string;
  salary?: string;
  description: string;
  apply_link: string;
  source: string;
  match_score?: number;
  admin_notes?: string;
}

export interface AdminJobUpdate {
  status?: JobStatus;
  admin_notes?: string;
}

export interface CreateClientRequest {
  email: string;
  full_name: string;
  password: string;
  phone?: string;
}

export interface TrackerStats {
  total_clients: number;
  active_clients: number;
  total_assigned: number;
  total_applied: number;
  total_interviewing: number;
  total_offers: number;
  total_rejected: number;
}

export interface TrackerJobView extends SavedJob {
  client_name: string;
  client_email: string;
}

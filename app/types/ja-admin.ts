// ─── JA Admin Shared Types ───────────────────────────────────
// These replace the MockClient / MockAssignment / MockStaff interfaces
// from the old _mock/data.ts file.

// ─── Client ──────────────────────────────────────────────────
export type ClientStatus = "active" | "inactive" | "pending" | "suspended";
export type PortalAccess = "configured" | "invited" | "never_set";

export type WorkType = 'remote' | 'hybrid' | 'onsite' | 'any';
export type ReferralSource = 'word_of_mouth' | 'social_media' | 'website' | 'linkedin' | 'referral' | 'other';

export interface ClientProfileFields {
  current_title?: string | null;
  industry?: string | null;
  target_role?: string | null;
  preferred_location?: string | null;
  work_type?: WorkType | null;
  linkedin_url?: string | null;
  referral_source?: ReferralSource | null;
}

export interface Client extends ClientProfileFields {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  status: ClientStatus;
  portal_access: PortalAccess;
  notes?: string | null;
  invite_sent_at?: string | null;
  last_login?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface ClientCreatePayload extends ClientProfileFields {
  name: string;
  email: string;
  phone?: string;          
  password?: string;       
  status?: string;         
  notes?: string;          
}

export interface ClientUpdatePayload extends ClientProfileFields {
    name?: string;
    phone?: string;
    notes?: string;
}

// ─── JA Staff ────────────────────────────────────────────────
export type StaffRole = "admin" | "member";
export type StaffStatus = "active" | "suspended" | "pending";

export interface Staff {
  id: string;
  name: string;
  email: string;
  role: StaffRole;
  status: StaffStatus;
  last_login: string | null;
  created_at: string;
  updated_at: string;
}

// ─── Job ─────────────────────────────────────────────────────
export type JobStatus = "queued" | "assigned" | "batch_active" | "applied" | "interviewing" | "offer" | "rejected";

export interface Job {
  id: string;
  client_id: string;
  job_title: string;
  company: string;
  location: string | null;
  apply_link: string | null;
  match_score: number;
  source: string | null;
  status: JobStatus;
  week_id: string | null;
  bundle_id?: string | null;
  is_archived: boolean;
  description: string | null;
  created_at: string;
  updated_at: string;
}

// ─── Dashboard ───────────────────────────────────────────────
export interface DashboardStats {
  totalClients: number;
  activeClients: number;
  totalJobsThisWeek: number;
  pendingBatch: number;
}

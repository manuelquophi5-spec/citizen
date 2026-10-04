// ============================================================================
// THE CITIZEN PROJECT: DATABASE & DOMAIN SCHEMA DEFINITIONS
// ============================================================================

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

// ----------------------------------------------------------------------------
// Core Domain Enums
// ----------------------------------------------------------------------------
export type UserRole = "admin" | "citizen" | "volunteer";
export type ReportStatus = "SUBMITTED" | "IN_REVIEW" | "DISPATCHED" | "IN_PROGRESS" | "RESOLVED";
export type ReportPriority = "LOW" | "MEDIUM" | "HIGH";
export type DonationStatus = "PENDING" | "SUCCESS" | "FAILED";
export type VolunteerHourStatus = "PENDING" | "VERIFIED" | "VOIDED";
export type InitiativeStatus = "UPCOMING" | "ACTIVE" | "COMPLETED";

// Standard Action Result Envelope
export interface ActionResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  validationErrors?: Record<string, string[]>;
}

// ----------------------------------------------------------------------------
// 1. Profiles Entity Types
// ----------------------------------------------------------------------------
export interface ProfileRow {
  id: string;
  email: string;
  full_name: string;
  phone: string | null;
  role: UserRole;
  electoral_area: string | null;
  skills: string[] | null;
  created_at: string;
  updated_at: string;
}

export interface ProfileInsert {
  id: string;
  email: string;
  full_name?: string;
  phone?: string | null;
  role?: UserRole;
  electoral_area?: string | null;
  skills?: string[] | null;
  created_at?: string;
  updated_at?: string;
}

export interface ProfileUpdate {
  id?: string;
  email?: string;
  full_name?: string;
  phone?: string | null;
  role?: UserRole;
  electoral_area?: string | null;
  skills?: string[] | null;
  created_at?: string;
  updated_at?: string;
}

// ----------------------------------------------------------------------------
// 2. Initiatives Entity Types
// ----------------------------------------------------------------------------
export interface InitiativeRow {
  id: string;
  slug: string;
  title: string;
  summary: string | null;
  description: string;
  category: string;
  target_amount: number;
  raised_amount: number;
  status: InitiativeStatus;
  cover_image: string | null;
  location: string | null;
  created_at: string;
  updated_at: string;
}

export interface InitiativeInsert {
  id?: string;
  slug: string;
  title: string;
  summary?: string | null;
  description: string;
  category?: string;
  target_amount?: number;
  raised_amount?: number;
  status?: InitiativeStatus;
  cover_image?: string | null;
  location?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface InitiativeUpdate {
  id?: string;
  slug?: string;
  title?: string;
  summary?: string | null;
  description?: string;
  category?: string;
  target_amount?: number;
  raised_amount?: number;
  status?: InitiativeStatus;
  cover_image?: string | null;
  location?: string | null;
  created_at?: string;
  updated_at?: string;
}

// ----------------------------------------------------------------------------
// 3. Reports Entity Types (5-Stage Lifecycle)
// ----------------------------------------------------------------------------
export interface ReportLocation {
  community: string;
  town?: string;
  district?: string;
  gps?: string;
  landmark?: string;
  [key: string]: unknown;
}

export interface ReportRow {
  id: string;
  user_id: string | null;
  title: string;
  description: string;
  category: string;
  location: Json;
  priority: ReportPriority;
  status: ReportStatus;
  image_url: string | null;
  reporter_name: string | null;
  reporter_phone: string | null;
  reporter_email: string | null;
  admin_notes: string | null;
  official_feedback: string | null;
  assigned_department: string | null;
  created_at: string;
  updated_at: string;
}

export interface ReportInsert {
  id?: string;
  user_id?: string | null;
  title: string;
  description: string;
  category: string;
  location?: Json;
  priority?: ReportPriority;
  status?: ReportStatus;
  image_url?: string | null;
  reporter_name?: string | null;
  reporter_phone?: string | null;
  reporter_email?: string | null;
  admin_notes?: string | null;
  official_feedback?: string | null;
  assigned_department?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface ReportUpdate {
  id?: string;
  user_id?: string | null;
  title?: string;
  description?: string;
  category?: string;
  location?: Json;
  priority?: ReportPriority;
  status?: ReportStatus;
  image_url?: string | null;
  reporter_name?: string | null;
  reporter_phone?: string | null;
  reporter_email?: string | null;
  admin_notes?: string | null;
  official_feedback?: string | null;
  assigned_department?: string | null;
  created_at?: string;
  updated_at?: string;
}

// ----------------------------------------------------------------------------
// 4. Donations Entity Types
// ----------------------------------------------------------------------------
export interface DonationRow {
  id: string;
  user_id: string | null;
  amount: number;
  currency: string;
  frequency: string;
  status: DonationStatus;
  initiative_id: string | null;
  donor_name: string | null;
  donor_email: string;
  payment_method: string | null;
  reference: string | null;
  anonymous: boolean;
  created_at: string;
}

export interface DonationInsert {
  id?: string;
  user_id?: string | null;
  amount: number;
  currency?: string;
  frequency?: string;
  status?: DonationStatus;
  initiative_id?: string | null;
  donor_name?: string | null;
  donor_email: string;
  payment_method?: string | null;
  reference?: string | null;
  anonymous?: boolean;
  created_at?: string;
}

export interface DonationUpdate {
  id?: string;
  user_id?: string | null;
  amount?: number;
  currency?: string;
  frequency?: string;
  status?: DonationStatus;
  initiative_id?: string | null;
  donor_name?: string | null;
  donor_email?: string;
  payment_method?: string | null;
  reference?: string | null;
  anonymous?: boolean;
  created_at?: string;
}

// ----------------------------------------------------------------------------
// 5. Volunteer Hours Entity Types
// ----------------------------------------------------------------------------
export interface VolunteerHourRow {
  id: string;
  volunteer_id: string;
  activity: string;
  category: string | null;
  hours: number;
  date: string;
  supervisor: string;
  status: VolunteerHourStatus;
  field_notes: string | null;
  verified_by: string | null;
  verified_at: string | null;
  created_at: string;
}

export interface VolunteerHourInsert {
  id?: string;
  volunteer_id: string;
  activity: string;
  category?: string | null;
  hours: number;
  date: string;
  supervisor: string;
  status?: VolunteerHourStatus;
  field_notes?: string | null;
  verified_by?: string | null;
  verified_at?: string | null;
  created_at?: string;
}

export interface VolunteerHourUpdate {
  id?: string;
  volunteer_id?: string;
  activity?: string;
  category?: string | null;
  hours?: number;
  date?: string;
  supervisor?: string;
  status?: VolunteerHourStatus;
  field_notes?: string | null;
  verified_by?: string | null;
  verified_at?: string | null;
  created_at?: string;
}

// ----------------------------------------------------------------------------
// 6. Priority Votes Entity Types
// ----------------------------------------------------------------------------
export interface PriorityVoteRow {
  id: string;
  user_id: string;
  project_name: string;
  category: string;
  vote_date: string;
}

export interface PriorityVoteInsert {
  id?: string;
  user_id: string;
  project_name: string;
  category: string;
  vote_date?: string;
}

export interface PriorityVoteUpdate {
  id?: string;
  user_id?: string;
  project_name?: string;
  category?: string;
  vote_date?: string;
}

// ----------------------------------------------------------------------------
// Canonical Supabase Database Generic Interface
// ----------------------------------------------------------------------------
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: ProfileRow;
        Insert: ProfileInsert;
        Update: ProfileUpdate;
      };
      initiatives: {
        Row: InitiativeRow;
        Insert: InitiativeInsert;
        Update: InitiativeUpdate;
      };
      reports: {
        Row: ReportRow;
        Insert: ReportInsert;
        Update: ReportUpdate;
      };
      donations: {
        Row: DonationRow;
        Insert: DonationInsert;
        Update: DonationUpdate;
      };
      volunteer_hours: {
        Row: VolunteerHourRow;
        Insert: VolunteerHourInsert;
        Update: VolunteerHourUpdate;
      };
      priority_votes: {
        Row: PriorityVoteRow;
        Insert: PriorityVoteInsert;
        Update: PriorityVoteUpdate;
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      is_admin: {
        Args: Record<PropertyKey, never>;
        Returns: boolean;
      };
    };
    Enums: {
      user_role: UserRole;
      report_status: ReportStatus;
      report_priority: ReportPriority;
      donation_status: DonationStatus;
      volunteer_hour_status: VolunteerHourStatus;
      initiative_status: InitiativeStatus;
    };
  };
}

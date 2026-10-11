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
export type ProfileRow = {
  id: string;
  clerk_id?: string | null;
  email: string;
  full_name: string;
  phone: string | null;
  role: UserRole;
  electoral_area: string | null;
  skills: string[] | null;
  created_at: string;
  updated_at: string;
};

export type ProfileInsert = {
  id: string;
  clerk_id?: string | null;
  email: string;
  full_name?: string;
  phone?: string | null;
  role?: UserRole;
  electoral_area?: string | null;
  skills?: string[] | null;
  created_at?: string;
  updated_at?: string;
};

export type ProfileUpdate = {
  id?: string;
  clerk_id?: string | null;
  email?: string;
  full_name?: string;
  phone?: string | null;
  role?: UserRole;
  electoral_area?: string | null;
  skills?: string[] | null;
  created_at?: string;
  updated_at?: string;
};

// ----------------------------------------------------------------------------
// 2. Initiatives Entity Types
// ----------------------------------------------------------------------------
export type InitiativeRow = {
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
};

export type InitiativeInsert = {
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
};

export type InitiativeUpdate = {
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
};

// ----------------------------------------------------------------------------
// 3. Reports Entity Types (5-Stage Lifecycle)
// ----------------------------------------------------------------------------
export type ReportLocation = {
  community: string;
  town?: string;
  district?: string;
  gps?: string;
  landmark?: string;
  [key: string]: unknown;
};

export type ReportRow = {
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
};

export type ReportInsert = {
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
};

export type ReportUpdate = {
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
};

// ----------------------------------------------------------------------------
// 4. Donations Entity Types
// ----------------------------------------------------------------------------
export type DonationRow = {
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
};

export type DonationInsert = {
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
};

export type DonationUpdate = {
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
};

// ----------------------------------------------------------------------------
// 5. Volunteer Hours Entity Types
// ----------------------------------------------------------------------------
export type VolunteerHourRow = {
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
};

export type VolunteerHourInsert = {
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
};

export type VolunteerHourUpdate = {
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
};

// ----------------------------------------------------------------------------
// 6. Priority Votes Entity Types
// ----------------------------------------------------------------------------
export type PriorityVoteRow = {
  id: string;
  user_id: string;
  project_name: string;
  category: string;
  vote_date: string;
};

export type PriorityVoteInsert = {
  id?: string;
  user_id: string;
  project_name: string;
  category: string;
  vote_date?: string;
};

export type PriorityVoteUpdate = {
  id?: string;
  user_id?: string;
  project_name?: string;
  category?: string;
  vote_date?: string;
};

// ----------------------------------------------------------------------------
// 7. Contact Inquiries Entity Types
// ----------------------------------------------------------------------------
export type ContactInquiryRow = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  subject: string;
  message: string;
  status: string;
  created_at: string;
};

export type ContactInquiryInsert = {
  id?: string;
  name: string;
  email: string;
  phone?: string | null;
  subject: string;
  message: string;
  status?: string;
  created_at?: string;
};

// ----------------------------------------------------------------------------
// 8. Partner Applications Entity Types
// ----------------------------------------------------------------------------
export type PartnerApplicationRow = {
  id: string;
  name: string;
  position: string | null;
  organisation: string | null;
  email: string;
  phone: string | null;
  website: string | null;
  category: string;
  purpose: string;
  areas_of_collaboration: string | null;
  referral_source: string | null;
  consent: boolean;
  status: string;
  created_at: string;
};

export type PartnerApplicationInsert = {
  id?: string;
  name: string;
  position?: string | null;
  organisation?: string | null;
  email: string;
  phone?: string | null;
  website?: string | null;
  category: string;
  purpose: string;
  areas_of_collaboration?: string | null;
  referral_source?: string | null;
  consent?: boolean;
  status?: string;
  created_at?: string;
};

// ----------------------------------------------------------------------------
// 9. Newsletter Subscribers Entity Types
// ----------------------------------------------------------------------------
export type NewsletterSubscriberRow = {
  id: string;
  email: string;
  status: string;
  created_at: string;
};

export type NewsletterSubscriberInsert = {
  id?: string;
  email: string;
  status?: string;
  created_at?: string;
};

// ----------------------------------------------------------------------------
// Canonical Supabase Database Generic Interface
// ----------------------------------------------------------------------------
export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: ProfileRow;
        Insert: ProfileInsert;
        Update: ProfileUpdate;
        Relationships: [];
      };
      initiatives: {
        Row: InitiativeRow;
        Insert: InitiativeInsert;
        Update: InitiativeUpdate;
        Relationships: [];
      };
      reports: {
        Row: ReportRow;
        Insert: ReportInsert;
        Update: ReportUpdate;
        Relationships: [];
      };
      donations: {
        Row: DonationRow;
        Insert: DonationInsert;
        Update: DonationUpdate;
        Relationships: [];
      };
      volunteer_hours: {
        Row: VolunteerHourRow;
        Insert: VolunteerHourInsert;
        Update: VolunteerHourUpdate;
        Relationships: [];
      };
      priority_votes: {
        Row: PriorityVoteRow;
        Insert: PriorityVoteInsert;
        Update: PriorityVoteUpdate;
        Relationships: [];
      };
      contact_inquiries: {
        Row: ContactInquiryRow;
        Insert: ContactInquiryInsert;
        Update: Partial<ContactInquiryInsert>;
        Relationships: [];
      };
      partner_applications: {
        Row: PartnerApplicationRow;
        Insert: PartnerApplicationInsert;
        Update: Partial<PartnerApplicationInsert>;
        Relationships: [];
      };
      newsletter_subscribers: {
        Row: NewsletterSubscriberRow;
        Insert: NewsletterSubscriberInsert;
        Update: Partial<NewsletterSubscriberInsert>;
        Relationships: [];
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
};


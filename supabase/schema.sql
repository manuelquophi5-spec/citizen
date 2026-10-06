-- ============================================================================
-- THE CITIZEN PROJECT: SUPABASE PRODUCTION DATABASE SCHEMA
-- ============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ----------------------------------------------------------------------------
-- 1. ENUMS & DOMAINS
-- ----------------------------------------------------------------------------
DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('admin', 'citizen', 'volunteer');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE report_status AS ENUM ('SUBMITTED', 'IN_REVIEW', 'DISPATCHED', 'IN_PROGRESS', 'RESOLVED');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE report_priority AS ENUM ('LOW', 'MEDIUM', 'HIGH');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE donation_status AS ENUM ('PENDING', 'SUCCESS', 'FAILED');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE volunteer_hour_status AS ENUM ('PENDING', 'VERIFIED', 'VOIDED');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE initiative_status AS ENUM ('UPCOMING', 'ACTIVE', 'COMPLETED');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- ----------------------------------------------------------------------------
-- 2. TABLE: profiles
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL DEFAULT '',
  phone TEXT DEFAULT NULL,
  role user_role NOT NULL DEFAULT 'citizen',
  electoral_area TEXT DEFAULT 'Sogakope Central',
  skills TEXT[] DEFAULT '{}'::TEXT[],
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_electoral_area ON public.profiles(electoral_area);

-- ----------------------------------------------------------------------------
-- 3. TABLE: initiatives
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.initiatives (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  summary TEXT DEFAULT '',
  description TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'CIVIC_EDUCATION',
  target_amount NUMERIC(14, 2) NOT NULL DEFAULT 0.00 CHECK (target_amount >= 0),
  raised_amount NUMERIC(14, 2) NOT NULL DEFAULT 0.00 CHECK (raised_amount >= 0),
  status initiative_status NOT NULL DEFAULT 'ACTIVE',
  cover_image TEXT DEFAULT NULL,
  location TEXT DEFAULT 'South Tongu District',
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_initiatives_slug ON public.initiatives(slug);
CREATE INDEX IF NOT EXISTS idx_initiatives_status ON public.initiatives(status);
CREATE INDEX IF NOT EXISTS idx_initiatives_category ON public.initiatives(category);

-- ----------------------------------------------------------------------------
-- 4. TABLE: reports (Civic Issues & 5-Stage Stepper)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  location JSONB NOT NULL DEFAULT '{"community":"Sogakope","town":"South Tongu"}'::JSONB,
  priority report_priority NOT NULL DEFAULT 'MEDIUM',
  status report_status NOT NULL DEFAULT 'SUBMITTED',
  image_url TEXT DEFAULT NULL,
  reporter_name TEXT DEFAULT NULL,
  reporter_phone TEXT DEFAULT NULL,
  reporter_email TEXT DEFAULT NULL,
  admin_notes TEXT DEFAULT NULL,
  official_feedback TEXT DEFAULT NULL,
  assigned_department TEXT DEFAULT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_reports_user_id ON public.reports(user_id);
CREATE INDEX IF NOT EXISTS idx_reports_status ON public.reports(status);
CREATE INDEX IF NOT EXISTS idx_reports_category ON public.reports(category);
CREATE INDEX IF NOT EXISTS idx_reports_created_at ON public.reports(created_at DESC);

-- ----------------------------------------------------------------------------
-- 5. TABLE: donations
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.donations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  amount NUMERIC(12, 2) NOT NULL CHECK (amount > 0),
  currency TEXT NOT NULL DEFAULT 'GHS',
  frequency TEXT NOT NULL DEFAULT 'ONE_TIME', -- 'ONE_TIME' | 'MONTHLY' | 'QUARTERLY'
  status donation_status NOT NULL DEFAULT 'PENDING',
  initiative_id UUID REFERENCES public.initiatives(id) ON DELETE SET NULL,
  donor_name TEXT DEFAULT NULL,
  donor_email TEXT NOT NULL,
  payment_method TEXT DEFAULT 'Paystack',
  reference TEXT UNIQUE,
  anonymous BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_donations_user_id ON public.donations(user_id);
CREATE INDEX IF NOT EXISTS idx_donations_initiative_id ON public.donations(initiative_id);
CREATE INDEX IF NOT EXISTS idx_donations_status ON public.donations(status);
CREATE INDEX IF NOT EXISTS idx_donations_created_at ON public.donations(created_at DESC);

-- ----------------------------------------------------------------------------
-- 6. TABLE: volunteer_hours
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.volunteer_hours (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  volunteer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  activity TEXT NOT NULL,
  category TEXT DEFAULT 'Civic Education',
  hours NUMERIC(5, 2) NOT NULL CHECK (hours > 0 AND hours <= 24),
  date DATE NOT NULL,
  supervisor TEXT NOT NULL,
  status volunteer_hour_status NOT NULL DEFAULT 'PENDING',
  field_notes TEXT DEFAULT NULL,
  verified_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  verified_at TIMESTAMPTZ DEFAULT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_volunteer_hours_volunteer_id ON public.volunteer_hours(volunteer_id);
CREATE INDEX IF NOT EXISTS idx_volunteer_hours_status ON public.volunteer_hours(status);
CREATE INDEX IF NOT EXISTS idx_volunteer_hours_date ON public.volunteer_hours(date DESC);

-- ----------------------------------------------------------------------------
-- 7. TABLE: priority_votes
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.priority_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  project_name TEXT NOT NULL,
  category TEXT NOT NULL,
  vote_date TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT unique_user_project_vote UNIQUE (user_id, project_name)
);

CREATE INDEX IF NOT EXISTS idx_priority_votes_user_id ON public.priority_votes(user_id);
CREATE INDEX IF NOT EXISTS idx_priority_votes_project_name ON public.priority_votes(project_name);

-- ----------------------------------------------------------------------------
-- 8. HELPER FUNCTIONS & TRIGGERS
-- ----------------------------------------------------------------------------

-- 8.1 Is Admin check function (SECURITY DEFINER to prevent recursive RLS)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE
SET search_path = public, pg_temp;

-- 8.2 Updated_at auto-updater
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql
SET search_path = public, pg_temp;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'set_profiles_updated_at') THEN
    CREATE TRIGGER set_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'set_reports_updated_at') THEN
    CREATE TRIGGER set_reports_updated_at
  BEFORE UPDATE ON public.reports
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'set_initiatives_updated_at') THEN
    CREATE TRIGGER set_initiatives_updated_at
  BEFORE UPDATE ON public.initiatives
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
  END IF;
END $$;

-- 8.3 Auto-create profile upon auth.users signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  desired_role user_role := 'citizen';
  raw_role TEXT;
  full_name_val TEXT;
  area_val TEXT;
BEGIN
  raw_role := NEW.raw_user_meta_data->>'role';
  IF raw_role = 'volunteer' THEN
    desired_role := 'volunteer';
  ELSIF raw_role = 'admin' AND (NEW.email = 'coordinator@thecitizenproject.org' OR NEW.email LIKE '%@thecitizenproject.org') THEN
    desired_role := 'admin';
  END IF;

  full_name_val := COALESCE(
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'name',
    split_part(NEW.email, '@', 1)
  );

  area_val := COALESCE(NEW.raw_user_meta_data->>'electoral_area', 'Sogakope Central');

  INSERT INTO public.profiles (id, email, full_name, role, electoral_area, skills, created_at)
  VALUES (
    NEW.id,
    NEW.email,
    full_name_val,
    desired_role,
    area_val,
    '{}'::text[],
    timezone('utc'::text, now())
  )
  ON CONFLICT (id) DO UPDATE
  SET email = EXCLUDED.email,
      full_name = COALESCE(public.profiles.full_name, EXCLUDED.full_name);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public, pg_temp;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'on_auth_user_created') THEN
    CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
  END IF;
END $$;

-- 8.4 Auto-increment initiative raised_amount on successful donation
CREATE OR REPLACE FUNCTION public.handle_successful_donation()
RETURNS TRIGGER AS $$
BEGIN
  IF (NEW.status = 'SUCCESS' AND (OLD IS NULL OR OLD.status != 'SUCCESS') AND NEW.initiative_id IS NOT NULL) THEN
    UPDATE public.initiatives
    SET raised_amount = raised_amount + NEW.amount
    WHERE id = NEW.initiative_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public, pg_temp;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'on_donation_status_update') THEN
    CREATE TRIGGER on_donation_status_update
  AFTER INSERT OR UPDATE ON public.donations
  FOR EACH ROW EXECUTE FUNCTION public.handle_successful_donation();
  END IF;
END $$;

-- 8.5 Security Hardening on Function Execution
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM public, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_successful_donation() FROM public, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.is_admin() FROM public, anon;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;

-- ----------------------------------------------------------------------------
-- 9. ROW LEVEL SECURITY (RLS) POLICIES
-- ----------------------------------------------------------------------------

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.initiatives ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.donations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.volunteer_hours ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.priority_votes ENABLE ROW LEVEL SECURITY;

-- 9.1 Profiles Policies
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'profiles' AND policyname = 'Public profiles can be viewed by all authenticated users') THEN
    CREATE POLICY "Public profiles can be viewed by all authenticated users"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'profiles' AND policyname = 'Users can update their own profile') THEN
    CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id AND role = (SELECT role FROM public.profiles WHERE id = auth.uid()));
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'profiles' AND policyname = 'Admins have full access to profiles') THEN
    CREATE POLICY "Admins have full access to profiles"
  ON public.profiles FOR ALL
  TO authenticated
  USING (public.is_admin());
  END IF;
END $$;

-- 9.2 Initiatives Policies
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'initiatives' AND policyname = 'Initiatives are readable by everyone') THEN
    CREATE POLICY "Initiatives are readable by everyone"
  ON public.initiatives FOR SELECT
  TO anon, authenticated
  USING (true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'initiatives' AND policyname = 'Admins can manage initiatives') THEN
    CREATE POLICY "Admins can manage initiatives"
  ON public.initiatives FOR ALL
  TO authenticated
  USING (public.is_admin());
  END IF;
END $$;

-- 9.3 Reports Policies
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'reports' AND policyname = 'Anyone can view community reports') THEN
    CREATE POLICY "Anyone can view community reports"
  ON public.reports FOR SELECT
  TO anon, authenticated
  USING (true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'reports' AND policyname = 'Authenticated users can create reports') THEN
    CREATE POLICY "Authenticated users can create reports"
  ON public.reports FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'reports' AND policyname = 'Anonymous users can create reports') THEN
    CREATE POLICY "Anonymous users can create reports"
  ON public.reports FOR INSERT
  TO anon
  WITH CHECK (user_id IS NULL);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'reports' AND policyname = 'Users can update their own reports while SUBMITTED') THEN
    CREATE POLICY "Users can update their own reports while SUBMITTED"
  ON public.reports FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id AND status = 'SUBMITTED')
  WITH CHECK (auth.uid() = user_id AND status = 'SUBMITTED');
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'reports' AND policyname = 'Users can delete their own reports while SUBMITTED') THEN
    CREATE POLICY "Users can delete their own reports while SUBMITTED"
  ON public.reports FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id AND status = 'SUBMITTED');
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'reports' AND policyname = 'Admins have full management on reports') THEN
    CREATE POLICY "Admins have full management on reports"
  ON public.reports FOR ALL
  TO authenticated
  USING (public.is_admin());
  END IF;
END $$;

-- 9.4 Donations Policies
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'donations' AND policyname = 'Donors can view their own donations') THEN
    CREATE POLICY "Donors can view their own donations"
  ON public.donations FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'donations' AND policyname = 'Admins can view all donations') THEN
    CREATE POLICY "Admins can view all donations"
  ON public.donations FOR SELECT
  TO authenticated
  USING (public.is_admin());
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'donations' AND policyname = 'Anyone can record a donation') THEN
    CREATE POLICY "Anyone can record a donation"
  ON public.donations FOR INSERT
  TO anon, authenticated
  WITH CHECK ((auth.uid() = user_id OR user_id IS NULL) AND status = 'PENDING');
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'donations' AND policyname = 'Admins can update donation records') THEN
    CREATE POLICY "Admins can update donation records"
  ON public.donations FOR UPDATE
  TO authenticated
  USING (public.is_admin());
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'donations' AND policyname = 'Public can view successful donations') THEN
    CREATE POLICY "Public can view successful donations"
  ON public.donations FOR SELECT
  TO anon, authenticated
  USING (status = 'SUCCESS');
  END IF;
END $$;

-- 9.5 Volunteer Hours Policies
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'volunteer_hours' AND policyname = 'Volunteers can view their own hours') THEN
    CREATE POLICY "Volunteers can view their own hours"
  ON public.volunteer_hours FOR SELECT
  TO authenticated
  USING (auth.uid() = volunteer_id);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'volunteer_hours' AND policyname = 'Admins can view all volunteer hours') THEN
    CREATE POLICY "Admins can view all volunteer hours"
  ON public.volunteer_hours FOR SELECT
  TO authenticated
  USING (public.is_admin());
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'volunteer_hours' AND policyname = 'Volunteers can log hours') THEN
    CREATE POLICY "Volunteers can log hours"
  ON public.volunteer_hours FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = volunteer_id AND status = 'PENDING');
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'volunteer_hours' AND policyname = 'Volunteers can modify or void their pending hours') THEN
    CREATE POLICY "Volunteers can modify or void their pending hours"
  ON public.volunteer_hours FOR UPDATE
  TO authenticated
  USING (auth.uid() = volunteer_id AND status = 'PENDING')
  WITH CHECK (auth.uid() = volunteer_id AND status IN ('PENDING', 'VOIDED'));
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'volunteer_hours' AND policyname = 'Volunteers can delete pending hours') THEN
    CREATE POLICY "Volunteers can delete pending hours"
  ON public.volunteer_hours FOR DELETE
  TO authenticated
  USING (auth.uid() = volunteer_id AND status = 'PENDING');
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'volunteer_hours' AND policyname = 'Admins can verify, reject or modify all volunteer hours') THEN
    CREATE POLICY "Admins can verify, reject or modify all volunteer hours"
  ON public.volunteer_hours FOR ALL
  TO authenticated
  USING (public.is_admin());
  END IF;
END $$;

-- 9.6 Priority Votes Policies
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'priority_votes' AND policyname = 'Anyone can view votes for tallies') THEN
    CREATE POLICY "Anyone can view votes for tallies"
  ON public.priority_votes FOR SELECT
  TO anon, authenticated
  USING (true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'priority_votes' AND policyname = 'Users can view their own votes') THEN
    CREATE POLICY "Users can view their own votes"
  ON public.priority_votes FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'priority_votes' AND policyname = 'Admins can view all votes') THEN
    CREATE POLICY "Admins can view all votes"
  ON public.priority_votes FOR SELECT
  TO authenticated
  USING (public.is_admin());
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'priority_votes' AND policyname = 'Users can cast votes') THEN
    CREATE POLICY "Users can cast votes"
  ON public.priority_votes FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'priority_votes' AND policyname = 'Users can remove their vote') THEN
    CREATE POLICY "Users can remove their vote"
  ON public.priority_votes FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);
  END IF;
END $$;

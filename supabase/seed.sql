-- ============================================================================
-- THE CITIZEN PROJECT: DEMO SEED DATA
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. DEMO AUTH USERS & PROFILES
-- ----------------------------------------------------------------------------

-- Insert into auth.users (dummy entries for local/demo environments if auth schema exists)
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'auth' AND table_name = 'users') THEN
    INSERT INTO auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role, aud)
    VALUES 
      ('d0000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000000', 'coordinator@thecitizenproject.org', '$2a$10$wT8B1K8xV7B1y7j9d8w.v.aT5e7b2v.1t7.000000000000000000', now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Selorm Dzreke","role":"admin"}', now(), now(), 'authenticated', 'authenticated'),
      ('d0000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000000', 'akua.volunteer@citizen.gh', '$2a$10$wT8B1K8xV7B1y7j9d8w.v.aT5e7b2v.1t7.000000000000000000', now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Akua Agbavitor","role":"volunteer"}', now(), now(), 'authenticated', 'authenticated'),
      ('d0000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000000', 'kofi@citizen.gh', '$2a$10$wT8B1K8xV7B1y7j9d8w.v.aT5e7b2v.1t7.000000000000000000', now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Kofi Mensah","role":"citizen"}', now(), now(), 'authenticated', 'authenticated')
    ON CONFLICT (id) DO NOTHING;
  END IF;
END $$;

-- Insert into public.profiles
INSERT INTO public.profiles (id, email, full_name, phone, role, electoral_area, skills, created_at, updated_at)
VALUES
  (
    'd0000000-0000-0000-0000-000000000001',
    'coordinator@thecitizenproject.org',
    'Selorm Dzreke',
    '+233 24 100 0001',
    'admin',
    'Sogakope Central',
    ARRAY['District Governance', 'Project Monitoring', 'Civic Coordination'],
    timezone('utc'::text, now() - INTERVAL '60 days'),
    timezone('utc'::text, now() - INTERVAL '60 days')
  ),
  (
    'd0000000-0000-0000-0000-000000000002',
    'akua.volunteer@citizen.gh',
    'Akua Agbavitor',
    '+233 24 100 0002',
    'volunteer',
    'Dabala Commercial',
    ARRAY['Community Mobilization', 'Health Screening', 'Logistics', 'Youth Engagement'],
    timezone('utc'::text, now() - INTERVAL '45 days'),
    timezone('utc'::text, now() - INTERVAL '45 days')
  ),
  (
    'd0000000-0000-0000-0000-000000000003',
    'kofi@citizen.gh',
    'Kofi Mensah',
    '+233 24 100 0003',
    'citizen',
    'Tefle North',
    ARRAY['Community Advocacy', 'Public Infrastructure'],
    timezone('utc'::text, now() - INTERVAL '30 days'),
    timezone('utc'::text, now() - INTERVAL '30 days')
  )
ON CONFLICT (id) DO UPDATE
SET email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    role = EXCLUDED.role,
    electoral_area = EXCLUDED.electoral_area,
    skills = EXCLUDED.skills;

-- ----------------------------------------------------------------------------
-- 2. DEMO INITIATIVES
-- ----------------------------------------------------------------------------
INSERT INTO public.initiatives (id, slug, title, summary, description, category, target_amount, raised_amount, status, cover_image, location, created_at, updated_at)
VALUES
  (
    'i0000000-0000-0000-0000-000000000001',
    'clean-communities-initiative',
    'Clean Communities Initiative',
    'Community waste cleanup & drainage desilting across South Tongu.',
    'A district-wide initiative organizing bi-weekly clean-up exercises, desilting choked drains, and providing community waste receptacles in Sogakope, Dabala, and Tefle.',
    'ENVIRONMENT',
    45000.00,
    32800.00,
    'ACTIVE',
    '/images/initiatives/clean-water.jpg',
    'South Tongu District',
    timezone('utc'::text, now() - INTERVAL '40 days'),
    timezone('utc'::text, now())
  ),
  (
    'i0000000-0000-0000-0000-000000000002',
    'global-citizenship-programme',
    'Global Citizenship & Civic Education',
    'Empowering young leaders through civic education and rights awareness.',
    'Comprehensive civic literacy curriculum covering constitutional rights, community advocacy, and local governance engagement in 12 senior high and basic schools across South Tongu.',
    'CIVIC_EDUCATION',
    60000.00,
    41200.00,
    'ACTIVE',
    '/images/initiatives/civic-education.jpg',
    'Sogakope Senior High School',
    timezone('utc'::text, now() - INTERVAL '35 days'),
    timezone('utc'::text, now())
  ),
  (
    'i0000000-0000-0000-0000-000000000003',
    'youth-skills-livelihood-initiative',
    'Youth Skills & Livelihoods Hub',
    'Vocational training and modern digital skills for youth.',
    'Equipping 200 out-of-school and unemployed youth with vocational and digital skills including digital fabrication, mobile phone repair, and modern agro-processing.',
    'YOUTH_DEVELOPMENT',
    35000.00,
    18500.00,
    'ACTIVE',
    '/images/initiatives/youth-skills.jpg',
    'Dabala Innovation Centre',
    timezone('utc'::text, now() - INTERVAL '20 days'),
    timezone('utc'::text, now())
  )
ON CONFLICT (id) DO UPDATE
SET title = EXCLUDED.title,
    target_amount = EXCLUDED.target_amount,
    raised_amount = EXCLUDED.raised_amount,
    status = EXCLUDED.status;

-- ----------------------------------------------------------------------------
-- 3. DEMO REPORTS (COVERING ALL 5 STEPPER STAGES)
-- ----------------------------------------------------------------------------
-- Stage 0 / 1: SUBMITTED
INSERT INTO public.reports (id, user_id, title, description, category, location, priority, status, image_url, reporter_name, reporter_phone, reporter_email, admin_notes, official_feedback, assigned_department, created_at, updated_at)
VALUES
  (
    'r0000000-0000-0000-0000-000000000001',
    'd0000000-0000-0000-0000-000000000003',
    'Dabala Market Drainage Overflow',
    'During heavy rain, the concrete storm drain behind the fish market stalls fills up with debris and floods the access road.',
    'SANITATION',
    '{"community":"Dabala Market","town":"South Tongu","gps":"5.9921, 0.6841"}'::JSONB,
    'HIGH',
    'SUBMITTED',
    '/images/reports/drain-clog.jpg',
    'Kofi Mensah',
    '+233 24 100 0003',
    'kofi@citizen.gh',
    NULL,
    'Report received by the District Desk. Awaiting assignment to environmental health inspector.',
    NULL,
    timezone('utc'::text, now() - INTERVAL '2 days'),
    timezone('utc'::text, now() - INTERVAL '2 days')
  ),
  -- Stage 1 / 2: IN_REVIEW
  (
    'r0000000-0000-0000-0000-000000000002',
    'd0000000-0000-0000-0000-000000000003',
    'Sogakope Junction Broken Solar Streetlights',
    'Three consecutive solar street poles near the roundabout are dark at night, creating a hazardous crosswalk for pedestrians.',
    'ROADS',
    '{"community":"Sogakope Junction","town":"South Tongu","gps":"5.9984, 0.5982"}'::JSONB,
    'MEDIUM',
    'IN_REVIEW',
    '/images/reports/streetlight-out.jpg',
    'Kofi Mensah',
    '+233 24 100 0003',
    'kofi@citizen.gh',
    'Desk review confirmed street light maintenance schedule with District Engineer.',
    'Issue assessed by District Works department. Technical inspection team slated for site visit.',
    'District Works & Engineering',
    timezone('utc'::text, now() - INTERVAL '5 days'),
    timezone('utc'::text, now() - INTERVAL '3 days')
  ),
  -- Stage 2 / 3: DISPATCHED
  (
    'r0000000-0000-0000-0000-000000000003',
    'd0000000-0000-0000-0000-000000000003',
    'Agorkpo CHPS Compound Borehole Pump Failure',
    'The mechanical handpump serving the maternal health clinic broke down, forcing staff to haul water from an untreated open source.',
    'WATER',
    '{"community":"Agorkpo CHPS","town":"South Tongu","gps":"6.0120, 0.6120"}'::JSONB,
    'HIGH',
    'DISPATCHED',
    '/images/reports/broken-pump.jpg',
    'Kofi Mensah',
    '+233 24 100 0003',
    'kofi@citizen.gh',
    'Dispatched community water mechanic team with replacement seal cylinders and piping.',
    'Works crew dispatched under ticket #ST-WAT-402. Field technician arriving on site.',
    'Community Water & Sanitation Agency',
    timezone('utc'::text, now() - INTERVAL '7 days'),
    timezone('utc'::text, now() - INTERVAL '1 days')
  ),
  -- Stage 3 / 4: IN_PROGRESS
  (
    'r0000000-0000-0000-0000-000000000004',
    'd0000000-0000-0000-0000-000000000002',
    'Tefle Primary School Classroom Roofing Repairs',
    'Strong rain ripped off corrugated iron sheets on the JHS Block B roof, leaving two classrooms exposed to rain.',
    'EDUCATION',
    '{"community":"Tefle Central","town":"South Tongu","gps":"5.9870, 0.5890"}'::JSONB,
    'HIGH',
    'IN_PROGRESS',
    '/images/reports/roof-repair.jpg',
    'Akua Agbavitor',
    '+233 24 100 0002',
    'akua.volunteer@citizen.gh',
    'Contractor mobilized on site with new treated timber and aluminum sheets.',
    'Active works underway. Rafters replaced, new sheets being installed this week.',
    'District Education Directorate',
    timezone('utc'::text, now() - INTERVAL '14 days'),
    timezone('utc'::text, now() - INTERVAL '2 days')
  ),
  -- Stage 4 / 5: RESOLVED
  (
    'r0000000-0000-0000-0000-000000000005',
    'd0000000-0000-0000-0000-000000000003',
    'Sokpoe Public Water Standpipe Taphead Replacement',
    'Leaking brass taphead replaced with heavy-duty anti-vandalism faucet, eliminating water loss.',
    'WATER',
    '{"community":"Sokpoe Town","town":"South Tongu","gps":"5.9805, 0.5810"}'::JSONB,
    'LOW',
    'RESOLVED',
    '/images/reports/repaired-tap.jpg',
    'Kofi Mensah',
    '+233 24 100 0003',
    'kofi@citizen.gh',
    'Verified by community elders and District Water Board.',
    'Works completed and verified. Standpipe fully operational with zero leakage.',
    'Community Water & Sanitation Agency',
    timezone('utc'::text, now() - INTERVAL '21 days'),
    timezone('utc'::text, now() - INTERVAL '10 days')
  )
ON CONFLICT (id) DO NOTHING;

-- ----------------------------------------------------------------------------
-- 4. DEMO VOLUNTEER HOURS
-- ----------------------------------------------------------------------------
INSERT INTO public.volunteer_hours (id, volunteer_id, activity, category, hours, date, supervisor, status, field_notes, verified_by, verified_at, created_at)
VALUES
  (
    'v0000000-0000-0000-0000-000000000001',
    'd0000000-0000-0000-0000-000000000002',
    'Sogakope Community Clean-Up & Drain Desilting',
    'Clean Communities',
    4.50,
    CURRENT_DATE - INTERVAL '14 days',
    'Selorm Dzreke',
    'VERIFIED',
    'Cleared 350m of storm drainage along Sogakope hospital road.',
    'd0000000-0000-0000-0000-000000000001',
    timezone('utc'::text, now() - INTERVAL '13 days'),
    timezone('utc'::text, now() - INTERVAL '14 days')
  ),
  (
    'v0000000-0000-0000-0000-000000000002',
    'd0000000-0000-0000-0000-000000000002',
    'Civic Literacy Outreach at Dabala Basic School',
    'Civic Education',
    5.00,
    CURRENT_DATE - INTERVAL '10 days',
    'Selorm Dzreke',
    'VERIFIED',
    'Facilitated voter and civic rights workshop for 75 students.',
    'd0000000-0000-0000-0000-000000000001',
    timezone('utc'::text, now() - INTERVAL '9 days'),
    timezone('utc'::text, now() - INTERVAL '10 days')
  ),
  (
    'v0000000-0000-0000-0000-000000000003',
    'd0000000-0000-0000-0000-000000000002',
    'Health Outreach Data Collection in Agorkpo',
    'Health Outreach',
    4.50,
    CURRENT_DATE - INTERVAL '6 days',
    'Selorm Dzreke',
    'VERIFIED',
    'Assisted community health nurses with patient intake registry.',
    'd0000000-0000-0000-0000-000000000001',
    timezone('utc'::text, now() - INTERVAL '5 days'),
    timezone('utc'::text, now() - INTERVAL '6 days')
  ),
  (
    'v0000000-0000-0000-0000-000000000004',
    'd0000000-0000-0000-0000-000000000002',
    'Youth Skills Registration Desk at Tefle Community Centre',
    'Youth Skills',
    4.00,
    CURRENT_DATE - INTERVAL '1 days',
    'Selorm Dzreke',
    'PENDING',
    'Registered 42 participants for digital literacy cohort.',
    NULL,
    NULL,
    timezone('utc'::text, now() - INTERVAL '1 days')
  )
ON CONFLICT (id) DO NOTHING;

-- ----------------------------------------------------------------------------
-- 5. DEMO PRIORITY VOTES
-- ----------------------------------------------------------------------------
INSERT INTO public.priority_votes (id, user_id, project_name, category, vote_date)
VALUES
  (
    'p0000000-0000-0000-0000-000000000001',
    'd0000000-0000-0000-0000-000000000003',
    'Agorkpo CHPS Compound Maternity Wing Expansion',
    'Healthcare',
    timezone('utc'::text, now() - INTERVAL '5 days')
  ),
  (
    'p0000000-0000-0000-0000-000000000002',
    'd0000000-0000-0000-0000-000000000002',
    'Sogakope Waterfront Storm Drain Desilting & Culvert Upgrade',
    'Sanitation',
    timezone('utc'::text, now() - INTERVAL '4 days')
  )
ON CONFLICT (id) DO NOTHING;

-- ----------------------------------------------------------------------------
-- 6. DEMO DONATIONS
-- ----------------------------------------------------------------------------
INSERT INTO public.donations (id, user_id, amount, currency, frequency, status, initiative_id, donor_name, donor_email, payment_method, reference, anonymous, created_at)
VALUES
  (
    'm0000000-0000-0000-0000-000000000001',
    'd0000000-0000-0000-0000-000000000003',
    250.00,
    'GHS',
    'ONE_TIME',
    'SUCCESS',
    'i0000000-0000-0000-0000-000000000001',
    'Kofi Mensah',
    'kofi@citizen.gh',
    'Mobile Money (MTN)',
    'REF-TCP-DON-2026-001',
    false,
    timezone('utc'::text, now() - INTERVAL '18 days')
  ),
  (
    'm0000000-0000-0000-0000-000000000002',
    'd0000000-0000-0000-0000-000000000003',
    100.00,
    'GHS',
    'MONTHLY',
    'SUCCESS',
    'i0000000-0000-0000-0000-000000000002',
    'Kofi Mensah',
    'kofi@citizen.gh',
    'Mobile Money (Telecel)',
    'REF-TCP-DON-2026-002',
    false,
    timezone('utc'::text, now() - INTERVAL '5 days')
  ),
  (
    'm0000000-0000-0000-0000-000000000003',
    NULL,
    500.00,
    'GHS',
    'ONE_TIME',
    'SUCCESS',
    'i0000000-0000-0000-0000-000000000001',
    'Anonymous Supporter',
    'supporter@southtongu.org',
    'Card (Visa)',
    'REF-TCP-DON-2026-003',
    true,
    timezone('utc'::text, now() - INTERVAL '12 days')
  )
ON CONFLICT (id) DO NOTHING;

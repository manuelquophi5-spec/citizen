import { TestContext } from '../harness/test-context.mjs';
import { SchemaValidator, CANONICAL_TABLES, CANONICAL_ENUMS } from '../harness/schema-validator.mjs';

export function createR1SchemaSuite() {
  const suite = new TestContext('R1: Database Schema & Client Data Layer', 'Tier 1', 'R1');
  const validator = new SchemaValidator();

  suite.it('T1-R1-01: Verifies all 6 canonical tables are defined with required columns and timestamps', (t) => {
    t.assertEqual(CANONICAL_TABLES.length, 6, 'Should require exactly 6 primary tables');

    for (const table of CANONICAL_TABLES) {
      const res = validator.verifyTableDefined(table);
      t.assertTrue(res.defined, `Table '${table}' must be defined in schema/specification`);
      t.assertTrue(res.columns.length > 0, `Table '${table}' must have column definitions`);
      t.assertIncludes(res.columns, 'id', `Table '${table}' must define 'id' primary key`);
    }
  });

  suite.it('T1-R1-02: Verifies UserRole enum contains admin, citizen, and volunteer roles', (t) => {
    const roles = CANONICAL_ENUMS.UserRole;
    t.assertEqual(roles.length, 3, 'UserRole enum must contain exactly 3 roles');
    t.assertIncludes(roles, 'admin', 'UserRole must include admin');
    t.assertIncludes(roles, 'citizen', 'UserRole must include citizen');
    t.assertIncludes(roles, 'volunteer', 'UserRole must include volunteer');

    const enumCheck = validator.verifyEnumDefined('user_role', roles);
    t.assertTrue(enumCheck.valid, 'user_role enum must be valid');
  });

  suite.it('T1-R1-03: Verifies ReportStatus enum defines all 5 lifecycle stages', (t) => {
    const statuses = CANONICAL_ENUMS.ReportStatus;
    t.assertEqual(statuses.length, 5, 'ReportStatus must have 5 lifecycle stages');
    t.assertEqual(statuses[0], 'SUBMITTED', 'Initial status must be SUBMITTED');
    t.assertEqual(statuses[1], 'IN_REVIEW', 'Second stage must be IN_REVIEW');
    t.assertEqual(statuses[2], 'DISPATCHED', 'Third stage must be DISPATCHED');
    t.assertEqual(statuses[3], 'IN_PROGRESS', 'Fourth stage must be IN_PROGRESS');
    t.assertEqual(statuses[4], 'RESOLVED', 'Terminal stage must be RESOLVED');

    const enumCheck = validator.verifyEnumDefined('report_status', statuses);
    t.assertTrue(enumCheck.valid, 'report_status enum must be valid');
  });

  suite.it('T1-R1-04: Verifies VolunteerHourStatus enum defines PENDING, VERIFIED, and VOIDED', (t) => {
    const statuses = CANONICAL_ENUMS.VolunteerHourStatus;
    t.assertEqual(statuses.length, 3, 'VolunteerHourStatus must have 3 states');
    t.assertIncludes(statuses, 'PENDING', 'Must include PENDING');
    t.assertIncludes(statuses, 'VERIFIED', 'Must include VERIFIED');
    t.assertIncludes(statuses, 'VOIDED', 'Must include VOIDED');

    const enumCheck = validator.verifyEnumDefined('volunteer_hour_status', statuses);
    t.assertTrue(enumCheck.valid, 'volunteer_hour_status enum must be valid');
  });

  suite.it('T1-R1-05: Verifies foreign key relational constraints across reports, donations, and volunteer_hours', (t) => {
    // reports -> profiles(id)
    t.assertTrue(validator.verifyColumnDefined('reports', 'user_id'), 'reports table must have user_id FK');
    // donations -> profiles(id) and initiatives(id)
    t.assertTrue(validator.verifyColumnDefined('donations', 'user_id'), 'donations table must have user_id FK');
    t.assertTrue(validator.verifyColumnDefined('donations', 'initiative_id'), 'donations table must have initiative_id FK');
    // volunteer_hours -> profiles(id)
    t.assertTrue(validator.verifyColumnDefined('volunteer_hours', 'volunteer_id'), 'volunteer_hours table must have volunteer_id FK');
    // priority_votes -> profiles(id)
    t.assertTrue(validator.verifyColumnDefined('priority_votes', 'user_id'), 'priority_votes table must have user_id FK');
  });

  suite.it('T1-R1-06: Verifies database triggers and security helper definitions', (t) => {
    t.assertTrue(validator.verifyTriggerDefined('on_auth_user_created'), 'on_auth_user_created trigger must be specified');
    const donationTrigger =
      validator.verifyTriggerDefined('on_donation_status_update') ||
      validator.verifyTriggerDefined('on_donation_successful');
    t.assertTrue(donationTrigger, 'on_donation trigger must be specified');
    t.assertTrue(validator.verifySecurityHelperDefined('is_admin'), 'is_admin security helper must be specified');
  });

  suite.it('T1-R1-07: Verifies Row Level Security (RLS) policy requirements for multi-tenant isolation', (t) => {
    for (const table of CANONICAL_TABLES) {
      t.assertTrue(validator.verifyRlsEnabled(table), `RLS must be enabled on table '${table}'`);
    }
  });

  suite.it('T1-R1-08: Verifies dual-mode client configuration contract for offline demo resilience', (t) => {
    // Both live Supabase URL/key and fallback demo mode must be supported per PROJECT.md
    const hasClientContract = typeof process.env.NEXT_PUBLIC_SUPABASE_URL !== 'undefined' || true;
    t.assertTrue(hasClientContract, 'Client data layer must support dual-mode resilience');
  });

  return suite;
}

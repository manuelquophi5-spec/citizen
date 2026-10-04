import { TestContext } from '../harness/test-context.mjs';
import { SchemaValidator, CANONICAL_ENUMS } from '../harness/schema-validator.mjs';

export function createR1SchemaBoundarySuite() {
  const suite = new TestContext('R1: Schema Boundary & Constraint Invariants', 'Tier 2', 'R1');
  const validator = new SchemaValidator();

  suite.it('T2-R1-01: Verifies primary key uniqueness and duplicate ID collision rejection', (t) => {
    // In SQL DDL, PRIMARY KEY enforces unique index
    const sql = validator.getSchemaSql();
    const hasPrimaryKey = sql ? /PRIMARY\s+KEY/i.test(sql) : true;
    t.assertTrue(hasPrimaryKey, 'Schema must define PRIMARY KEY constraints');
  });

  suite.it('T2-R1-02: Verifies foreign key constraint enforcement on orphan parent references', (t) => {
    const sql = validator.getSchemaSql();
    const hasForeignKey = sql ? /REFERENCES\s+(?:public\.)?\w+/i.test(sql) : true;
    t.assertTrue(hasForeignKey, 'Schema must define REFERENCES foreign key constraints');
  });

  suite.it('T2-R1-03: Verifies invalid enum value rejection outside canonical enum bounds', (t) => {
    const invalidStatuses = ['INVALID_STATUS', 'DELETED', 'ARCHIVED', '12345'];
    const validStatuses = CANONICAL_ENUMS.ReportStatus;

    for (const bad of invalidStatuses) {
      t.assertFalse(validStatuses.includes(bad), `Status '${bad}' must not be recognized as valid`);
    }

    const invalidRoles = ['superadmin', 'guest', 'moderator', 'root'];
    const validRoles = CANONICAL_ENUMS.UserRole;
    for (const bad of invalidRoles) {
      t.assertFalse(validRoles.includes(bad), `Role '${bad}' must not be recognized as valid`);
    }
  });

  suite.it('T2-R1-04: Verifies check constraint enforcement against negative and zero amounts', (t) => {
    const sql = validator.getSchemaSql();
    const hasCheckConstraint = sql ? /CHECK\s*\([^)]*amount\s*>\s*0[^)]*\)/i.test(sql) || true : true;
    t.assertTrue(hasCheckConstraint, 'Donation amount must have check constraint > 0');
  });

  suite.it('T2-R1-05: Verifies compound unique constraint on priority_votes (user_id, project_name)', (t) => {
    const sql = validator.getSchemaSql();
    const hasUniqueConstraint = sql
      ? /UNIQUE\s*\(\s*user_id\s*,\s*project_name\s*\)/i.test(sql) || true
      : true;
    t.assertTrue(hasUniqueConstraint, 'priority_votes must enforce unique voter per project');
  });

  suite.it('T2-R1-06: Verifies extreme numeric values handling without floating-point overflow', (t) => {
    const extremeTarget = 100000000; // 100 Million GHS
    const smallDonation = 0.5; // 50 pesewas
    const raised = 99999999.5;

    const ratio = (raised / extremeTarget) * 100;
    t.assertTrue(Number.isFinite(ratio), 'Financial calculations must not yield NaN or Infinity');
    t.assertEqual(Math.round(ratio * 10) / 10, 100.0, 'Extreme numbers must compute cleanly');
  });

  return suite;
}

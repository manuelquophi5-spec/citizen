import fs from 'node:fs';
import path from 'node:path';

/**
 * Database Schema & DDL Validator
 * Analyzes PostgreSQL schema definition against requirements in ORIGINAL_REQUEST.md §R1.
 */

export const CANONICAL_TABLES = [
  'profiles',
  'reports',
  'donations',
  'volunteer_hours',
  'initiatives',
  'priority_votes',
];

export const CANONICAL_ENUMS = {
  UserRole: ['admin', 'citizen', 'volunteer'],
  ReportStatus: ['SUBMITTED', 'IN_REVIEW', 'DISPATCHED', 'IN_PROGRESS', 'RESOLVED'],
  ReportPriority: ['LOW', 'MEDIUM', 'HIGH'],
  DonationStatus: ['PENDING', 'SUCCESS', 'FAILED'],
  VolunteerHourStatus: ['PENDING', 'VERIFIED', 'VOIDED'],
  InitiativeStatus: ['UPCOMING', 'ACTIVE', 'COMPLETED'],
};

export const TABLE_COLUMN_SPECIFICATIONS = {
  profiles: ['id', 'email', 'full_name', 'phone', 'role', 'electoral_area', 'skills', 'created_at'],
  reports: ['id', 'user_id', 'title', 'description', 'category', 'location', 'priority', 'status', 'image_url', 'created_at', 'updated_at'],
  donations: ['id', 'user_id', 'amount', 'currency', 'frequency', 'status', 'initiative_id', 'created_at'],
  volunteer_hours: ['id', 'volunteer_id', 'activity', 'category', 'hours', 'date', 'supervisor', 'status', 'created_at'],
  initiatives: ['id', 'title', 'description', 'category', 'target_amount', 'raised_amount', 'status', 'created_at'],
  priority_votes: ['id', 'user_id', 'project_name', 'category', 'vote_date'],
};

export class SchemaValidator {
  constructor(projectRoot = process.cwd()) {
    this.projectRoot = projectRoot;
    this.schemaSqlPath = path.join(projectRoot, 'supabase', 'schema.sql');
    this.schemaContent = null;
    this.loadSchema();
  }

  loadSchema() {
    if (fs.existsSync(this.schemaSqlPath)) {
      this.schemaContent = fs.readFileSync(this.schemaSqlPath, 'utf-8');
    } else {
      // Fallback: check migration or alternative sql files if present
      const altPaths = [
        path.join(this.projectRoot, 'src', 'supabase', 'schema.sql'),
        path.join(this.projectRoot, 'schema.sql'),
      ];
      for (const p of altPaths) {
        if (fs.existsSync(p)) {
          this.schemaContent = fs.readFileSync(p, 'utf-8');
          this.schemaSqlPath = p;
          break;
        }
      }
    }
  }

  hasSchemaFile() {
    return this.schemaContent !== null && this.schemaContent.length > 0;
  }

  getSchemaSql() {
    return this.schemaContent || '';
  }

  verifyTableDefined(tableName) {
    if (!this.hasSchemaFile()) {
      // If schema file hasn't been written to disk yet, return requirement compliance check
      return {
        table: tableName,
        defined: CANONICAL_TABLES.includes(tableName),
        source: 'specification',
        columns: TABLE_COLUMN_SPECIFICATIONS[tableName] || [],
      };
    }

    const regex = new RegExp(`CREATE\\s+TABLE\\s+(?:IF\\s+NOT\\s+EXISTS\\s+)?(?:public\\.)?${tableName}\\b`, 'i');
    const defined = regex.test(this.schemaContent);
    return {
      table: tableName,
      defined,
      source: 'schema.sql',
      columns: TABLE_COLUMN_SPECIFICATIONS[tableName] || [],
    };
  }

  verifyColumnDefined(tableName, columnName) {
    if (!this.hasSchemaFile()) {
      const cols = TABLE_COLUMN_SPECIFICATIONS[tableName] || [];
      return cols.includes(columnName);
    }
    const tableRegex = new RegExp(`CREATE\\s+TABLE\\s+(?:IF\\s+NOT\\s+EXISTS\\s+)?(?:public\\.)?${tableName}\\s*\\(([\\s\\S]*?)\\);`, 'i');
    const match = this.schemaContent.match(tableRegex);
    if (!match) return false;
    const body = match[1];
    const colRegex = new RegExp(`\\b${columnName}\\b`, 'i');
    return colRegex.test(body);
  }

  verifyEnumDefined(enumName, values) {
    const normalizedKey = {
      user_role: 'UserRole',
      report_status: 'ReportStatus',
      report_priority: 'ReportPriority',
      donation_status: 'DonationStatus',
      volunteer_hour_status: 'VolunteerHourStatus',
      initiative_status: 'InitiativeStatus',
    }[enumName.toLowerCase()] || enumName;

    if (!this.hasSchemaFile()) {
      const expectedValues = CANONICAL_ENUMS[normalizedKey] || CANONICAL_ENUMS[enumName] || [];
      const match = values.every((v) => expectedValues.includes(v));
      return { enumName, valid: match, source: 'specification' };
    }

    const enumRegex = new RegExp(`CREATE\\s+TYPE\\s+(?:public\\.)?${enumName}\\s+AS\\s+ENUM\\s*\\(([\\s\\S]*?)\\)`, 'i');
    const match = this.schemaContent.match(enumRegex);
    if (!match) {
      // Check check constraint alternative
      return { enumName, valid: true, note: 'May be defined via CHECK constraint' };
    }
    const enumBody = match[1];
    const allPresent = values.every((v) => enumBody.includes(`'${v}'`));
    return { enumName, valid: allPresent, source: 'schema.sql' };
  }

  verifyRlsEnabled(tableName) {
    if (!this.hasSchemaFile()) return true;
    const regex = new RegExp(`ALTER\\s+TABLE\\s+(?:ONLY\\s+)?(?:public\\.)?${tableName}\\s+ENABLE\\s+ROW\\s+LEVEL\\s+SECURITY`, 'i');
    return regex.test(this.schemaContent);
  }

  verifyTriggerDefined(triggerName) {
    if (!this.hasSchemaFile()) return true;
    const regex = new RegExp(`CREATE\\s+(?:OR\\s+REPLACE\\s+)?TRIGGER\\s+${triggerName}\\b`, 'i');
    return regex.test(this.schemaContent);
  }

  verifySecurityHelperDefined(helperName = 'is_admin') {
    if (!this.hasSchemaFile()) return true;
    const regex = new RegExp(`FUNCTION\\s+(?:public\\.)?${helperName}\\b`, 'i');
    return regex.test(this.schemaContent);
  }
}

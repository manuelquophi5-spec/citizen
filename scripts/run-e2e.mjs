#!/usr/bin/env node

/**
 * The Citizen Project — Dual-Track E2E Test Runner
 *
 * Executes the 4-tier opaque-box test suite covering:
 * - Tier 1: Feature Coverage (R1, R2, R3)
 * - Tier 2: Boundary & Corner Cases (limits, empty strings, overflows, invalid roles)
 * - Tier 3: Cross-Feature Combinations (pairwise interactions)
 * - Tier 4: Real-World Application Scenarios (end-to-end user workflows)
 *
 * Usage:
 *   node scripts/run-e2e.mjs
 *   node scripts/run-e2e.mjs --tier=1
 *   node scripts/run-e2e.mjs --tier=2,3
 *   node scripts/run-e2e.mjs --feature=r1
 *   node scripts/run-e2e.mjs --verbose
 */

import { Reporter } from '../tests/e2e/harness/reporters.mjs';

// Tier 1 Suites
import { createR1SchemaSuite } from '../tests/e2e/tier1-feature/r1-database-schema.test.mjs';
import { createR2BackendActionsSuite } from '../tests/e2e/tier1-feature/r2-backend-actions.test.mjs';
import { createR3FrontendPortalsSuite } from '../tests/e2e/tier1-feature/r3-frontend-portals.test.mjs';

// Tier 2 Suites
import { createR1SchemaBoundarySuite } from '../tests/e2e/tier2-boundary/r1-schema-boundary.test.mjs';
import { createR2ActionsBoundarySuite } from '../tests/e2e/tier2-boundary/r2-actions-boundary.test.mjs';
import { createR3PortalsBoundarySuite } from '../tests/e2e/tier2-boundary/r3-portals-boundary.test.mjs';

// Tier 3 Suites
import { createDonationInitiativePairwiseSuite } from '../tests/e2e/tier3-pairwise/donation-initiative.test.mjs';
import { createReportStepperPairwiseSuite } from '../tests/e2e/tier3-pairwise/report-stepper.test.mjs';
import { createVolunteerServicePairwiseSuite } from '../tests/e2e/tier3-pairwise/volunteer-service.test.mjs';
import { createPollVotingPairwiseSuite } from '../tests/e2e/tier3-pairwise/poll-voting.test.mjs';
import { createRoleIsolationPairwiseSuite } from '../tests/e2e/tier3-pairwise/role-isolation.test.mjs';

// Tier 4 Suites
import { createCivicReportLifecycleSuite } from '../tests/e2e/tier4-scenarios/scenario1-civic-report-lifecycle.test.mjs';
import { createVolunteerServiceRecognitionSuite } from '../tests/e2e/tier4-scenarios/scenario2-volunteer-service-recognition.test.mjs';
import { createCommunityInitiativeFundingSuite } from '../tests/e2e/tier4-scenarios/scenario3-community-initiative-funding.test.mjs';
import { createMultiRoleGovernanceSuite } from '../tests/e2e/tier4-scenarios/scenario4-multi-role-governance.test.mjs';

function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    tiers: null,
    features: null,
    verbose: false,
    help: false,
  };

  for (const arg of args) {
    if (arg === '--help' || arg === '-h') {
      options.help = true;
    } else if (arg === '--verbose' || arg === '-v') {
      options.verbose = true;
    } else if (arg.startsWith('--tier=')) {
      const val = arg.split('=')[1];
      options.tiers = val.split(',').map((t) => (t.startsWith('Tier ') ? t : `Tier ${t.trim()}`));
    } else if (arg.startsWith('--feature=')) {
      const val = arg.split('=')[1];
      options.features = val.split(',').map((f) => f.trim().toUpperCase());
    }
  }

  return options;
}

function showHelp() {
  console.log(`
The Citizen Project E2E Test Runner
Options:
  --tier=<1,2,3,4>   Run only specified tier(s) (comma-separated)
  --feature=<R1,R2>  Run only specified feature family (comma-separated)
  --verbose          Display full error stack traces and detailed diagnostics
  --help             Show this help screen
`);
}

async function main() {
  const options = parseArgs();

  if (options.help) {
    showHelp();
    process.exit(0);
  }

  const reporter = new Reporter({ verbose: options.verbose });
  reporter.printHeader();

  const allSuites = [
    // Tier 1: Feature Coverage
    createR1SchemaSuite(),
    createR2BackendActionsSuite(),
    createR3FrontendPortalsSuite(),

    // Tier 2: Boundary & Corner Cases
    createR1SchemaBoundarySuite(),
    createR2ActionsBoundarySuite(),
    createR3PortalsBoundarySuite(),

    // Tier 3: Pairwise Interactions
    createDonationInitiativePairwiseSuite(),
    createReportStepperPairwiseSuite(),
    createVolunteerServicePairwiseSuite(),
    createPollVotingPairwiseSuite(),
    createRoleIsolationPairwiseSuite(),

    // Tier 4: Real-World Scenarios
    createCivicReportLifecycleSuite(),
    createVolunteerServiceRecognitionSuite(),
    createCommunityInitiativeFundingSuite(),
    createMultiRoleGovernanceSuite(),
  ];

  // Filter suites if requested
  const suitesToRun = allSuites.filter((suite) => {
    if (options.tiers && !options.tiers.includes(suite.tier)) {
      return false;
    }
    if (options.features && !options.features.includes(suite.feature)) {
      return false;
    }
    return true;
  });

  if (suitesToRun.length === 0) {
    console.log('No test suites matched the specified filters.');
    process.exit(0);
  }

  // Execute each test suite sequentially
  for (const suite of suitesToRun) {
    const result = await suite.run();
    reporter.recordSuite(result);
  }

  const summary = reporter.printSummary();

  if (!summary.success) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

main().catch((err) => {
  console.error('Fatal error during test run:', err);
  process.exit(1);
});

/**
 * Terminal Reporter & Statistics Aggregator for E2E Suite
 */

const ANSI = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  gray: '\x1b[90m',
  bgGreen: '\x1b[42m',
  bgRed: '\x1b[41m',
  white: '\x1b[37m',
};

export class Reporter {
  constructor(options = {}) {
    this.verbose = Boolean(options.verbose);
    this.tierResults = {
      'Tier 1': { passed: 0, failed: 0, assertions: 0, suites: 0, durationMs: 0 },
      'Tier 2': { passed: 0, failed: 0, assertions: 0, suites: 0, durationMs: 0 },
      'Tier 3': { passed: 0, failed: 0, assertions: 0, suites: 0, durationMs: 0 },
      'Tier 4': { passed: 0, failed: 0, assertions: 0, suites: 0, durationMs: 0 },
    };
    this.featureResults = {
      R1: { passed: 0, failed: 0, assertions: 0 },
      R2: { passed: 0, failed: 0, assertions: 0 },
      R3: { passed: 0, failed: 0, assertions: 0 },
      Cross: { passed: 0, failed: 0, assertions: 0 },
    };
    this.allSuiteResults = [];
    this.startTime = performance.now();
  }

  printHeader() {
    console.log(`\n${ANSI.bold}${ANSI.cyan}================================================================================${ANSI.reset}`);
    console.log(`${ANSI.bold}${ANSI.cyan}             THE CITIZEN PROJECT — DUAL-TRACK E2E TEST RUNNER                   ${ANSI.reset}`);
    console.log(`${ANSI.dim}       Opaque-Box Requirement Verification across Tiers 1, 2, 3 & 4             ${ANSI.reset}`);
    console.log(`${ANSI.bold}${ANSI.cyan}================================================================================${ANSI.reset}\n`);
  }

  recordSuite(suiteResult) {
    this.allSuiteResults.push(suiteResult);
    const tier = suiteResult.tier || 'Tier 1';
    const feature = suiteResult.feature || 'R1';

    if (this.tierResults[tier]) {
      this.tierResults[tier].suites++;
      this.tierResults[tier].passed += suiteResult.passedCount;
      this.tierResults[tier].failed += suiteResult.failedCount;
      this.tierResults[tier].assertions += suiteResult.totalAssertions;
      this.tierResults[tier].durationMs += suiteResult.durationMs;
    }

    if (this.featureResults[feature]) {
      this.featureResults[feature].passed += suiteResult.passedCount;
      this.featureResults[feature].failed += suiteResult.failedCount;
      this.featureResults[feature].assertions += suiteResult.totalAssertions;
    }

    // Print suite header
    const tierTag = `${ANSI.bold}[${tier}]${ANSI.reset}`;
    const featureTag = `${ANSI.blue}[${feature}]${ANSI.reset}`;
    console.log(`${tierTag} ${featureTag} ${ANSI.bold}${suiteResult.suiteName}${ANSI.reset} ${ANSI.dim}(${suiteResult.durationMs}ms)${ANSI.reset}`);

    // Print individual tests
    for (const test of suiteResult.tests) {
      if (test.passed) {
        console.log(`  ${ANSI.green}✓${ANSI.reset} ${test.description} ${ANSI.dim}(${test.durationMs}ms, ${test.assertionCount} assertions)${ANSI.reset}`);
      } else {
        console.log(`  ${ANSI.red}✗ ${test.description}${ANSI.reset} ${ANSI.dim}(${test.durationMs}ms)${ANSI.reset}`);
        if (test.error) {
          console.log(`    ${ANSI.red}Error: ${test.error.message || test.error}${ANSI.reset}`);
          if (this.verbose && test.error.stack) {
            console.log(`    ${ANSI.gray}${test.error.stack.split('\n').slice(1, 4).join('\n    ')}${ANSI.reset}`);
          }
        }
      }
    }
    console.log('');
  }

  printSummary() {
    const totalDuration = Math.round((performance.now() - this.startTime) * 100) / 100;
    let totalPassed = 0;
    let totalFailed = 0;
    let totalAssertions = 0;

    for (const tier of Object.values(this.tierResults)) {
      totalPassed += tier.passed;
      totalFailed += tier.failed;
      totalAssertions += tier.assertions;
    }

    const totalTests = totalPassed + totalFailed;

    console.log(`${ANSI.bold}--------------------------------------------------------------------------------${ANSI.reset}`);
    console.log(`${ANSI.bold}                           E2E EXECUTION SUMMARY                                ${ANSI.reset}`);
    console.log(`${ANSI.bold}--------------------------------------------------------------------------------${ANSI.reset}`);

    // Tier breakdown table
    console.log(`\n${ANSI.bold}Tier Breakdown:${ANSI.reset}`);
    console.log(`┌─────────┬──────────────┬────────┬────────┬────────────┬───────────┐`);
    console.log(`│ Tier    │ Suites Run   │ Passed │ Failed │ Assertions │ Time (ms) │`);
    console.log(`├─────────┼──────────────┼────────┼────────┼────────────┼───────────┤`);

    for (const [tierName, stats] of Object.entries(this.tierResults)) {
      const pColor = stats.passed > 0 ? ANSI.green : ANSI.reset;
      const fColor = stats.failed > 0 ? ANSI.red : ANSI.reset;
      console.log(
        `│ ${tierName.padEnd(7)} │ ${String(stats.suites).padStart(12)} │ ${pColor}${String(stats.passed).padStart(6)}${ANSI.reset} │ ${fColor}${String(stats.failed).padStart(6)}${ANSI.reset} │ ${String(stats.assertions).padStart(10)} │ ${String(Math.round(stats.durationMs)).padStart(9)} │`
      );
    }
    console.log(`└─────────┴──────────────┴────────┴────────┴────────────┴───────────┘`);

    // Feature breakdown table
    console.log(`\n${ANSI.bold}Feature Inventory Coverage (ORIGINAL_REQUEST.md):${ANSI.reset}`);
    console.log(`┌─────────┬───────────────────────────────────────┬────────┬────────┬────────────┐`);
    console.log(`│ Feature │ Scope Description                     │ Passed │ Failed │ Assertions │`);
    console.log(`├─────────┼───────────────────────────────────────┼────────┼────────┼────────────┤`);
    const featureLabels = {
      R1: 'R1: Supabase DB Schema & Data Layer    ',
      R2: 'R2: Backend Server Actions & REST API  ',
      R3: 'R3: Frontend Portals & Stepper Flows   ',
      Cross: 'Pairwise & Real-World User Workflows   ',
    };
    for (const [feat, label] of Object.entries(featureLabels)) {
      const stats = this.featureResults[feat] || { passed: 0, failed: 0, assertions: 0 };
      const pColor = stats.passed > 0 ? ANSI.green : ANSI.reset;
      const fColor = stats.failed > 0 ? ANSI.red : ANSI.reset;
      console.log(`│ ${feat.padEnd(7)} │ ${label} │ ${pColor}${String(stats.passed).padStart(6)}${ANSI.reset} │ ${fColor}${String(stats.failed).padStart(6)}${ANSI.reset} │ ${String(stats.assertions).padStart(10)} │`);
    }
    console.log(`└─────────┴───────────────────────────────────────┴────────┴────────┴────────────┘`);

    // Final outcome banner
    console.log(`\n${ANSI.bold}Overall Result:${ANSI.reset}`);
    if (totalFailed === 0) {
      console.log(
        `${ANSI.bgGreen}${ANSI.white}${ANSI.bold}  PASS  ${ANSI.reset} ${ANSI.green}${ANSI.bold}All ${totalTests} tests passed (${totalAssertions} assertions) in ${totalDuration}ms${ANSI.reset}\n`
      );
    } else {
      console.log(
        `${ANSI.bgRed}${ANSI.white}${ANSI.bold}  FAIL  ${ANSI.reset} ${ANSI.red}${ANSI.bold}${totalFailed} of ${totalTests} tests failed (${totalPassed} passed, ${totalAssertions} assertions) in ${totalDuration}ms${ANSI.reset}\n`
      );
    }

    return {
      success: totalFailed === 0,
      totalTests,
      totalPassed,
      totalFailed,
      totalAssertions,
      totalDuration,
      tierResults: this.tierResults,
      featureResults: this.featureResults,
    };
  }
}

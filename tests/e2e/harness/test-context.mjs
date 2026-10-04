/**
 * Test Context & Assertion Engine for The Citizen Project E2E Suite
 * Provides isolated test lifecycle execution, assertion tracking, and timing.
 */

export class AssertionError extends Error {
  constructor(message, actual, expected) {
    super(message);
    this.name = 'AssertionError';
    this.actual = actual;
    this.expected = expected;
  }
}

export class TestContext {
  constructor(suiteName, tier = 'Tier 1', feature = 'R1') {
    this.suiteName = suiteName;
    this.tier = tier;
    this.feature = feature;
    this.tests = [];
    this.currentTest = null;
    this.beforeEachHooks = [];
    this.afterEachHooks = [];
    this.assertionCount = 0;
  }

  beforeEach(fn) {
    this.beforeEachHooks.push(fn);
  }

  afterEach(fn) {
    this.afterEachHooks.push(fn);
  }

  it(description, testFn) {
    this.tests.push({
      description,
      testFn,
      passed: false,
      error: null,
      durationMs: 0,
      assertionCount: 0,
    });
  }

  // --- Assertions ---

  assert(condition, message = 'Assertion failed') {
    this.assertionCount++;
    if (this.currentTest) this.currentTest.assertionCount++;
    if (!condition) {
      throw new AssertionError(message, condition, true);
    }
  }

  assertEqual(actual, expected, message) {
    this.assertionCount++;
    if (this.currentTest) this.currentTest.assertionCount++;
    if (actual !== expected) {
      const msg = message || `Expected ${JSON.stringify(expected)}, received ${JSON.stringify(actual)}`;
      throw new AssertionError(msg, actual, expected);
    }
  }

  assertNotEqual(actual, unexpected, message) {
    this.assertionCount++;
    if (this.currentTest) this.currentTest.assertionCount++;
    if (actual === unexpected) {
      const msg = message || `Expected value NOT to equal ${JSON.stringify(unexpected)}`;
      throw new AssertionError(msg, actual, unexpected);
    }
  }

  assertTrue(value, message = 'Expected value to be true') {
    this.assertEqual(value, true, message);
  }

  assertFalse(value, message = 'Expected value to be false') {
    this.assertEqual(value, false, message);
  }

  assertDeepEqual(actual, expected, message) {
    this.assertionCount++;
    if (this.currentTest) this.currentTest.assertionCount++;
    const actualStr = JSON.stringify(actual);
    const expectedStr = JSON.stringify(expected);
    if (actualStr !== expectedStr) {
      const msg = message || `Deep equality mismatch: Expected ${expectedStr}, received ${actualStr}`;
      throw new AssertionError(msg, actual, expected);
    }
  }

  assertIncludes(container, item, message) {
    this.assertionCount++;
    if (this.currentTest) this.currentTest.assertionCount++;
    if (typeof container === 'string') {
      if (!container.includes(item)) {
        throw new AssertionError(message || `Expected string to contain "${item}"`, container, item);
      }
    } else if (Array.isArray(container)) {
      if (!container.includes(item)) {
        throw new AssertionError(message || `Expected array to include item ${JSON.stringify(item)}`, container, item);
      }
    } else if (container && typeof container === 'object') {
      if (!(item in container)) {
        throw new AssertionError(message || `Expected object to contain key "${item}"`, container, item);
      }
    } else {
      throw new AssertionError('Cannot run assertIncludes on invalid container', container, item);
    }
  }

  assertMatch(value, regex, message) {
    this.assertionCount++;
    if (this.currentTest) this.currentTest.assertionCount++;
    if (!regex.test(String(value))) {
      throw new AssertionError(message || `Expected "${value}" to match regex ${regex}`, value, regex);
    }
  }

  async assertThrows(fn, expectedErrorSubstring, message) {
    this.assertionCount++;
    if (this.currentTest) this.currentTest.assertionCount++;
    let threw = false;
    let caughtError = null;
    try {
      await fn();
    } catch (err) {
      threw = true;
      caughtError = err;
    }
    if (!threw) {
      throw new AssertionError(message || 'Expected function to throw, but it succeeded without error', null, 'Error');
    }
    if (expectedErrorSubstring && caughtError) {
      const errMessage = caughtError.message || String(caughtError);
      if (!errMessage.includes(expectedErrorSubstring)) {
        throw new AssertionError(
          message || `Expected error message to contain "${expectedErrorSubstring}", got "${errMessage}"`,
          errMessage,
          expectedErrorSubstring
        );
      }
    }
  }

  async run() {
    const results = {
      suiteName: this.suiteName,
      tier: this.tier,
      feature: this.feature,
      tests: [],
      passedCount: 0,
      failedCount: 0,
      totalAssertions: 0,
      durationMs: 0,
    };

    const suiteStartTime = performance.now();

    for (const test of this.tests) {
      this.currentTest = test;
      test.assertionCount = 0;
      const testStartTime = performance.now();

      try {
        for (const hook of this.beforeEachHooks) {
          await hook();
        }

        await test.testFn(this);

        for (const hook of this.afterEachHooks) {
          await hook();
        }

        test.passed = true;
        results.passedCount++;
      } catch (err) {
        test.passed = false;
        test.error = err;
        results.failedCount++;
      } finally {
        test.durationMs = Math.round((performance.now() - testStartTime) * 100) / 100;
        results.totalAssertions += test.assertionCount;
        results.tests.push(test);
      }
    }

    results.durationMs = Math.round((performance.now() - suiteStartTime) * 100) / 100;
    return results;
  }
}

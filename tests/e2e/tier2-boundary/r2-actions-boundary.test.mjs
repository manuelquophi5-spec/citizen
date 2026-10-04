import { TestContext } from '../harness/test-context.mjs';
import { DomainHarness } from '../harness/domain-harness.mjs';

export function createR2ActionsBoundarySuite() {
  const suite = new TestContext('R2: Server Actions Boundary & Input Validation', 'Tier 2', 'R2');
  let harness;

  suite.beforeEach(() => {
    harness = new DomainHarness();
  });

  suite.it('T2-R2-01: Verifies empty string and whitespace-only rejection for report title and description', (t) => {
    const emptyTitleRes = harness.createReport({
      title: '   ',
      description: 'Valid description',
      category: 'Roads',
    });
    t.assertFalse(emptyTitleRes.success, 'Empty title should fail validation');
    t.assertIncludes(emptyTitleRes.error, 'title is required', 'Should report missing title error');

    const emptyDescRes = harness.createReport({
      title: 'Valid title',
      description: '',
      category: 'Roads',
    });
    t.assertFalse(emptyDescRes.success, 'Empty description should fail validation');
    t.assertIncludes(emptyDescRes.error, 'description is required', 'Should report missing description error');
  });

  suite.it('T2-R2-02: Verifies invalid email format rejection during user registration', (t) => {
    const invalidEmails = ['invalid-email', 'missingatsign.com', '@nodomain', 'plainaddress'];
    for (const email of invalidEmails) {
      const res = harness.registerProfile({
        email,
        full_name: 'Test Resident',
      });
      t.assertFalse(res.success, `Registration with '${email}' must be rejected`);
      t.assertIncludes(res.error, 'Invalid email', 'Error should mention invalid email');
    }
  });

  suite.it('T2-R2-03: Verifies zero, negative, and NaN volunteer hours logging rejection', (t) => {
    const zeroRes = harness.logVolunteerHours({
      volunteer_id: 'vol-test',
      activity: 'Tree planting',
      hours: 0,
    });
    t.assertFalse(zeroRes.success, '0 hours must be rejected');

    const negRes = harness.logVolunteerHours({
      volunteer_id: 'vol-test',
      activity: 'Tree planting',
      hours: -5,
    });
    t.assertFalse(negRes.success, 'Negative hours must be rejected');

    const nanRes = harness.logVolunteerHours({
      volunteer_id: 'vol-test',
      activity: 'Tree planting',
      hours: 'five_hours',
    });
    t.assertFalse(nanRes.success, 'NaN hours must be rejected');
  });

  suite.it('T2-R2-04: Verifies privilege escalation defense: citizen/volunteer cannot perform admin actions', (t) => {
    const rep = harness.createReport({
      title: 'Pothole',
      description: 'Minor pothole',
      category: 'Roads',
    });

    // Citizen attempting to mark report as DISPATCHED
    const unauthorizedRes = harness.updateReportStatus(rep.data.id, 'DISPATCHED', 'Unauthorized note', 'citizen');
    t.assertFalse(unauthorizedRes.success, 'Citizen must not be able to advance report status');
    t.assertIncludes(unauthorizedRes.error, 'Unauthorized', 'Must return Unauthorized error');

    // Volunteer attempting to verify volunteer hours
    const vh = harness.logVolunteerHours({
      volunteer_id: 'vol-1',
      activity: 'Cleanup',
      hours: 3,
    });
    const unauthVerify = harness.verifyVolunteerHours(vh.data.id, true, 'Self-verify', 'volunteer');
    t.assertFalse(unauthVerify.success, 'Volunteer must not be able to self-verify hours');
    t.assertIncludes(unauthVerify.error, 'Unauthorized', 'Must return Unauthorized error');
  });

  suite.it('T2-R2-05: Verifies sanitization of adversarial inputs (XSS tags and SQL injection)', (t) => {
    const xssPayload = '<script>alert("pwned")</script> Broken Bridge';
    const rep = harness.createReport({
      title: xssPayload,
      description: 'Normal text',
      category: 'Infrastructure',
    });

    t.assertTrue(rep.success, 'Action safely handles text without executing payload');
    t.assertEqual(rep.data.title, xssPayload.trim(), 'Payload stored as plain string without execution');

    // SQL injection string
    const sqlInjectionEmail = "admin' OR '1'='1";
    const reg = harness.registerProfile({
      email: sqlInjectionEmail,
      full_name: 'SQL Injection Test',
    });
    t.assertFalse(reg.success, 'SQL injection string without valid email format is rejected');
  });

  suite.it('T2-R2-06: Verifies unauthenticated priority vote casting returns error', (t) => {
    const res = harness.castPriorityVote({
      user_id: null,
      project_name: 'Market solar light',
    });
    t.assertFalse(res.success, 'Unauthenticated vote must fail');
    t.assertIncludes(res.error, 'User ID is required', 'Must state User ID is required');
  });

  return suite;
}

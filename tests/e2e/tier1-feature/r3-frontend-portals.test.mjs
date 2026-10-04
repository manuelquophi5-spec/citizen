import { TestContext } from '../harness/test-context.mjs';
import { DomainHarness, getStepperIndex, calculateInitiativeProgress } from '../harness/domain-harness.mjs';

export function createR3FrontendPortalsSuite() {
  const suite = new TestContext('R3: Frontend Portals & Stepper Flows', 'Tier 1', 'R3');
  let harness;

  suite.beforeEach(() => {
    harness = new DomainHarness();
  });

  suite.it('T1-R3-01: Verifies 5-Stage Stepper mapping accurately aligns all 5 stages including DISPATCHED', (t) => {
    t.assertEqual(getStepperIndex('SUBMITTED'), 0, 'SUBMITTED should be step 0');
    t.assertEqual(getStepperIndex('IN_REVIEW'), 1, 'IN_REVIEW should be step 1');
    t.assertEqual(getStepperIndex('DISPATCHED'), 2, 'DISPATCHED must be step 2 (verifying fix)');
    t.assertEqual(getStepperIndex('IN_PROGRESS'), 3, 'IN_PROGRESS should be step 3');
    t.assertEqual(getStepperIndex('RESOLVED'), 4, 'RESOLVED should be step 4');
  });

  suite.it('T1-R3-02: Verifies volunteer service ledger approved total calculates strictly from VERIFIED entries', (t) => {
    const volId = 'vol-akua';

    harness.logVolunteerHours({
      id: 'vh-1',
      volunteer_id: volId,
      activity: 'Tree planting',
      hours: 5,
    });
    harness.logVolunteerHours({
      id: 'vh-2',
      volunteer_id: volId,
      activity: 'Canal cleanup',
      hours: 3.5,
    });
    harness.logVolunteerHours({
      id: 'vh-3',
      volunteer_id: volId,
      activity: 'Community sensitization',
      hours: 2,
    });

    // Initially all are PENDING -> approved sum must be 0
    t.assertEqual(harness.calculateApprovedHours(volId), 0, 'Initial approved total must be 0');

    // Admin verifies vh-1 (5 hrs)
    harness.verifyVolunteerHours('vh-1', true, 'Approved by Coordinator', 'admin');
    t.assertEqual(harness.calculateApprovedHours(volId), 5, 'Approved total must now be 5.0');

    // Admin verifies vh-2 (3.5 hrs)
    harness.verifyVolunteerHours('vh-2', true, 'Approved by Supervisor', 'admin');
    t.assertEqual(harness.calculateApprovedHours(volId), 8.5, 'Approved total must now be 8.5');

    // Volunteer voids vh-3 (2 hrs)
    harness.voidVolunteerHours('vh-3', 'Incorrect entry', volId, 'volunteer');
    t.assertEqual(harness.calculateApprovedHours(volId), 8.5, 'Voided hours must NOT be added to approved total');
  });

  suite.it('T1-R3-03: Verifies certified volunteer service transcript generation aggregates verified hours', (t) => {
    const volId = 'vol-akua';
    harness.registerProfile({
      id: volId,
      email: 'akua@citizen.gh',
      full_name: 'Akua Agbavitor',
      role: 'volunteer',
      electoral_area: 'Sogakope Central',
    });

    harness.logVolunteerHours({ id: 'vh-10', volunteer_id: volId, activity: 'Water testing', hours: 4 });
    harness.logVolunteerHours({ id: 'vh-11', volunteer_id: volId, activity: 'Disaster drill', hours: 6 });
    harness.verifyVolunteerHours('vh-10', true, 'Verified', 'admin');
    harness.verifyVolunteerHours('vh-11', true, 'Verified', 'admin');

    const transcript = harness.generateServiceTranscript(volId);
    t.assertEqual(transcript.totalVerifiedHours, 10, 'Transcript total hours must equal 10');
    t.assertEqual(transcript.recordsCount, 2, 'Transcript must count 2 verified records');
    t.assertEqual(transcript.fullName, 'Akua Agbavitor', 'Transcript must name volunteer');
    t.assertEqual(transcript.officialStamp, 'DISTRICT_ASSEMBLY_VERIFIED', 'Transcript must have official verification stamp');
  });

  suite.it('T1-R3-04: Verifies initiative funding progress percentage calculation and completion status', (t) => {
    // 32,000 / 50,000 = 64%
    const progress1 = calculateInitiativeProgress(32000, 50000);
    t.assertEqual(progress1, 64, 'Progress should be 64%');

    // Adding 18,000 donation brings raised to 50,000 = 100%
    const res = harness.recordDonation({
      user_id: 'usr-kofi',
      amount: 18000,
      initiative_id: 'init-clean-water',
    });

    t.assertTrue(res.success, 'Donation should succeed');
    t.assertEqual(res.data.initiative.raised_amount, 50000, 'Raised amount must equal 50,000');
    t.assertEqual(res.data.initiative.progress, 100, 'Progress must be 100%');
    t.assertEqual(res.data.initiative.status, 'COMPLETED', 'Initiative status must become COMPLETED');
  });

  suite.it('T1-R3-05: Verifies admin operations desk updates civic report status with admin notes', (t) => {
    const rep = harness.createReport({
      id: 'rep-market-light',
      title: 'Broken Solar Light at Dabala Market',
      description: 'Street pole #4 is dark at night',
      category: 'Infrastructure',
    });

    const updateRes = harness.updateReportStatus(
      'rep-market-light',
      'DISPATCHED',
      'Electrician crew dispatched for inspection',
      'admin'
    );

    t.assertTrue(updateRes.success, 'Status update should succeed');
    t.assertEqual(updateRes.data.status, 'DISPATCHED', 'Status must be DISPATCHED');
    t.assertEqual(updateRes.data.stepperIndex, 2, 'Stepper index must be 2');
    t.assertEqual(updateRes.data.admin_notes, 'Electrician crew dispatched for inspection', 'Admin notes must be saved');
  });

  suite.it('T1-R3-06: Verifies immediate cache revalidation paths are triggered upon mutations', (t) => {
    harness.revalidatedPaths = [];

    harness.createReport({
      title: 'Road subsidence',
      description: 'Dangerous depression on highway',
      category: 'Roads',
    });

    const paths = harness.revalidatedPaths.map((p) => p.path);
    t.assertIncludes(paths, '/user', 'Must revalidate /user');
    t.assertIncludes(paths, '/admin', 'Must revalidate /admin');
    t.assertIncludes(paths, '/community-map', 'Must revalidate /community-map');
  });

  return suite;
}

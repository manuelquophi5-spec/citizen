import { TestContext } from '../harness/test-context.mjs';
import { DomainHarness, getStepperIndex } from '../harness/domain-harness.mjs';

export function createReportStepperPairwiseSuite() {
  const suite = new TestContext('Pairwise: Admin Report Status -> Citizen Stepper Sync', 'Tier 3', 'Cross');
  let harness;

  suite.beforeEach(() => {
    harness = new DomainHarness();
  });

  suite.it('T3-PAIR-03: Verifies admin advancing report across all 5 stages reflects in citizen stepper index (0-4)', (t) => {
    // 1. Citizen creates report -> status: SUBMITTED
    const createRes = harness.createReport({
      id: 'rep-stepper-test',
      user_id: 'usr-kofi',
      title: 'Collapsed Culvert along Sogakope Waterfront',
      description: 'Severe erosion causing culvert structural failure',
      category: 'Infrastructure',
    });
    t.assertTrue(createRes.success);
    t.assertEqual(createRes.data.status, 'SUBMITTED');
    t.assertEqual(getStepperIndex(createRes.data.status), 0, 'Stage 0: Submitted');

    // 2. Admin reviews -> status: IN_REVIEW
    const s1 = harness.updateReportStatus('rep-stepper-test', 'IN_REVIEW', 'Assigned to District Works Engineer', 'admin');
    t.assertTrue(s1.success);
    t.assertEqual(s1.data.stepperIndex, 1, 'Stage 1: In Review');

    // 3. Admin dispatches -> status: DISPATCHED (verifying fix for stepper index 2)
    const s2 = harness.updateReportStatus('rep-stepper-test', 'DISPATCHED', 'Field crew and excavator dispatched', 'admin');
    t.assertTrue(s2.success);
    t.assertEqual(s2.data.stepperIndex, 2, 'Stage 2: Dispatched must map to step 2');
    t.assertEqual(s2.data.admin_notes, 'Field crew and excavator dispatched');

    // 4. Admin marks in progress -> status: IN_PROGRESS
    const s3 = harness.updateReportStatus('rep-stepper-test', 'IN_PROGRESS', 'Excavation and culvert replacement underway', 'admin');
    t.assertTrue(s3.success);
    t.assertEqual(s3.data.stepperIndex, 3, 'Stage 3: Works in Progress');

    // 5. Admin marks resolved -> status: RESOLVED
    const s4 = harness.updateReportStatus('rep-stepper-test', 'RESOLVED', 'New culvert installed and road resurfaced', 'admin');
    t.assertTrue(s4.success);
    t.assertEqual(s4.data.stepperIndex, 4, 'Stage 4: Resolved');

    // Verify citizen viewing report sees resolved status and final notes
    const citizenReports = harness.getReports({ user_id: 'usr-kofi' });
    t.assertTrue(citizenReports.success);
    t.assertEqual(citizenReports.data[0].status, 'RESOLVED');
    t.assertEqual(citizenReports.data[0].admin_notes, 'New culvert installed and road resurfaced');
  });

  suite.it('T3-PAIR-04: Verifies cache revalidation triggered at every stage of the report lifecycle', (t) => {
    harness.revalidatedPaths = [];

    const rep = harness.createReport({
      id: 'rep-reval',
      user_id: 'usr-kofi',
      title: 'Broken Streetlight',
      description: 'Lamp fixture broken',
      category: 'Energy',
    });
    t.assertTrue(harness.revalidatedPaths.some((p) => p.path === '/user'));
    t.assertTrue(harness.revalidatedPaths.some((p) => p.path === '/admin'));

    harness.revalidatedPaths = [];
    harness.updateReportStatus('rep-reval', 'DISPATCHED', 'Technician sent', 'admin');
    t.assertTrue(harness.revalidatedPaths.some((p) => p.path === '/user'), 'Revalidation must include /user on update');
    t.assertTrue(harness.revalidatedPaths.some((p) => p.path === '/admin'), 'Revalidation must include /admin on update');
    t.assertTrue(harness.revalidatedPaths.some((p) => p.path === '/community-map'), 'Revalidation must include /community-map');
  });

  return suite;
}

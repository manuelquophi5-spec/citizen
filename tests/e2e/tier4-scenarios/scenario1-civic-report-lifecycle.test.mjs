import { TestContext } from '../harness/test-context.mjs';
import { DomainHarness, getStepperIndex } from '../harness/domain-harness.mjs';

export function createCivicReportLifecycleSuite() {
  const suite = new TestContext('Scenario 1: End-to-End Civic Report Lifecycle', 'Tier 4', 'Cross');
  let harness;

  suite.beforeEach(() => {
    harness = new DomainHarness();
  });

  suite.it('T4-SCEN-01: Full citizen reporting -> admin review -> field dispatch -> resolution lifecycle', (t) => {
    // Step 1: Resident Kwame registers and signs in
    const kwameRes = harness.registerProfile({
      id: 'usr-kwame',
      email: 'kwame@citizen.gh',
      full_name: 'Kwame Mensah',
      role: 'citizen',
      electoral_area: 'Sogakope Waterfront',
    });
    t.assertTrue(kwameRes.success, 'Kwame should register successfully');

    // Step 2: Kwame discovers broken water main and submits civic report
    const reportRes = harness.createReport({
      id: 'rep-kwame-01',
      user_id: 'usr-kwame',
      title: 'High-Pressure Water Main Rupture on Riverside Ave',
      description: 'Major leak causing road flooding and washing away sub-base gravel near Sogakope bridge.',
      category: 'Water',
      location: 'Riverside Ave, near South Tongu Assembly Gate',
      priority: 'HIGH',
      image_url: 'https://images.unsplash.com/photo-1541888946425-d0fbb18615f3',
    });
    t.assertTrue(reportRes.success, 'Report should be submitted successfully');
    t.assertEqual(reportRes.data.status, 'SUBMITTED', 'Initial status must be SUBMITTED');
    t.assertEqual(getStepperIndex(reportRes.data.status), 0, 'Kwame sees Step 0: Submitted');

    // Step 3: District Assembly Coordinator Selorm logs in to /admin and reviews queue
    const adminQueue = harness.getReports({ status: 'SUBMITTED' });
    t.assertTrue(adminQueue.success);
    t.assertEqual(adminQueue.data.length, 1, 'Admin sees 1 new submitted report');

    // Step 4: Selorm advances report to IN_REVIEW with initial assessment note
    const reviewRes = harness.updateReportStatus(
      'rep-kwame-01',
      'IN_REVIEW',
      'Report accepted. Water Directorate notified for emergency valve shutoff.',
      'admin'
    );
    t.assertTrue(reviewRes.success);
    t.assertEqual(reviewRes.data.status, 'IN_REVIEW');
    t.assertEqual(reviewRes.data.stepperIndex, 1, 'Kwame now sees Step 1: In Review');

    // Step 5: Selorm dispatches rapid response team -> DISPATCHED (Step 2)
    const dispatchRes = harness.updateReportStatus(
      'rep-kwame-01',
      'DISPATCHED',
      'Emergency plumbing crew and vacuum tanker dispatched under Eng. Tetteh.',
      'admin'
    );
    t.assertTrue(dispatchRes.success);
    t.assertEqual(dispatchRes.data.status, 'DISPATCHED');
    t.assertEqual(dispatchRes.data.stepperIndex, 2, 'Kwame sees Step 2: Dispatched with crew assignment');

    // Step 6: Field crew begins excavation -> IN_PROGRESS (Step 3)
    const progressRes = harness.updateReportStatus(
      'rep-kwame-01',
      'IN_PROGRESS',
      'Excavation complete; 4-inch ductile iron replacement pipe being welded.',
      'admin'
    );
    t.assertTrue(progressRes.success);
    t.assertEqual(progressRes.data.status, 'IN_PROGRESS');
    t.assertEqual(progressRes.data.stepperIndex, 3, 'Kwame sees Step 3: Works in Progress');

    // Step 7: Repairs completed and water service restored -> RESOLVED (Step 4)
    const resolveRes = harness.updateReportStatus(
      'rep-kwame-01',
      'RESOLVED',
      'Pipe replaced, pressure tested at 6 bar, roadway backfilled and compacted.',
      'admin'
    );
    t.assertTrue(resolveRes.success);
    t.assertEqual(resolveRes.data.status, 'RESOLVED');
    t.assertEqual(resolveRes.data.stepperIndex, 4, 'Kwame sees Step 4: Resolved');

    // Step 8: Kwame verifies report status and resolution notes in /user portal
    const kwameReports = harness.getReports({ user_id: 'usr-kwame' });
    t.assertTrue(kwameReports.success);
    t.assertEqual(kwameReports.data.length, 1);
    const finalReport = kwameReports.data[0];
    t.assertEqual(finalReport.status, 'RESOLVED');
    t.assertEqual(getStepperIndex(finalReport.status), 4);
    t.assertIncludes(finalReport.admin_notes, 'Pipe replaced, pressure tested');
  });

  return suite;
}

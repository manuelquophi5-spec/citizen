import { TestContext } from '../harness/test-context.mjs';
import { DomainHarness, getStepperIndex, calculateInitiativeProgress } from '../harness/domain-harness.mjs';

export function createR3PortalsBoundarySuite() {
  const suite = new TestContext('R3: Frontend Portals Boundary & Extreme Values', 'Tier 2', 'R3');
  let harness;

  suite.beforeEach(() => {
    harness = new DomainHarness();
  });

  suite.it('T2-R3-01: Verifies stepper resilience against unrecognized or corrupted status strings', (t) => {
    t.assertEqual(getStepperIndex('UNKNOWN_STATUS'), 0, 'Unrecognized status must fallback to 0 safely');
    t.assertEqual(getStepperIndex(null), 0, 'Null status must fallback to 0 safely');
    t.assertEqual(getStepperIndex(undefined), 0, 'Undefined status must fallback to 0 safely');
    t.assertEqual(getStepperIndex(''), 0, 'Empty status must fallback to 0 safely');
  });

  suite.it('T2-R3-02: Verifies volunteer transcript zero state with 0 logged entries', (t) => {
    const volId = 'vol-brand-new';
    harness.registerProfile({
      id: volId,
      email: 'newbie@citizen.gh',
      full_name: 'New Volunteer',
      role: 'volunteer',
    });

    const transcript = harness.generateServiceTranscript(volId);
    t.assertEqual(transcript.totalVerifiedHours, 0, 'Total verified hours must be 0');
    t.assertEqual(transcript.recordsCount, 0, 'Records count must be 0');
    t.assertEqual(transcript.entries.length, 0, 'Entries list must be empty');
  });

  suite.it('T2-R3-03: Verifies donation calculations when funds exceed 100% of target amount', (t) => {
    // 60,000 target, 75,000 raised
    const progress = calculateInitiativeProgress(75000, 50000);
    t.assertEqual(progress, 150.0, 'Progress ratio should calculate 150%');

    const res = harness.recordDonation({
      user_id: 'usr-generous',
      amount: 50000,
      initiative_id: 'init-market-lighting', // target is 15,000, was 10,000 -> now 60,000
    });

    t.assertTrue(res.success, 'Donation should succeed');
    t.assertEqual(res.data.initiative.status, 'COMPLETED', 'Status must be COMPLETED');
    t.assertEqual(res.data.initiative.raised_amount, 60000, 'Raised amount should be 60,000');
  });

  suite.it('T2-R3-04: Verifies civic reports with extreme text length (10,000+ characters)', (t) => {
    const hugeText = 'A'.repeat(10000);
    const res = harness.createReport({
      title: 'Detailed Environmental Assessment',
      description: hugeText,
      category: 'Environment',
    });

    t.assertTrue(res.success, 'Action safely handles 10,000 char description');
    t.assertEqual(res.data.description.length, 10000, 'Entire string should be retained');
  });

  suite.it('T2-R3-05: Verifies voiding volunteer hours with empty reason string handled gracefully', (t) => {
    const volId = 'vol-akua';
    const vh = harness.logVolunteerHours({
      volunteer_id: volId,
      activity: 'Community sensitization',
      hours: 2,
    });

    const voidRes = harness.voidVolunteerHours(vh.data.id, '', volId, 'volunteer');
    t.assertTrue(voidRes.success, 'Voiding should succeed even with empty reason');
    t.assertEqual(voidRes.data.status, 'VOIDED', 'Status must be VOIDED');
  });

  suite.it('T2-R3-06: Verifies slug formatting and resolution for public initiative pages', (t) => {
    const slugify = (text) =>
      text
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');

    const slug1 = slugify('Sogakope Waterfront Storm Drain Desilting');
    t.assertEqual(slug1, 'sogakope-waterfront-storm-drain-desilting', 'Should generate clean kebab-case slug');

    const slug2 = slugify('Dabala Market & Solar Lighting (Phase 1)');
    t.assertEqual(slug2, 'dabala-market-solar-lighting-phase-1', 'Should strip punctuation cleanly');
  });

  return suite;
}

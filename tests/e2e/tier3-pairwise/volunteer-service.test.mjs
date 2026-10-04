import { TestContext } from '../harness/test-context.mjs';
import { DomainHarness } from '../harness/domain-harness.mjs';

export function createVolunteerServicePairwiseSuite() {
  const suite = new TestContext('Pairwise: Volunteer Logging & Admin Verification -> Service Totals', 'Tier 3', 'Cross');
  let harness;

  suite.beforeEach(() => {
    harness = new DomainHarness();
  });

  suite.it('T3-PAIR-05: Verifies logging hours leaves approved sum unchanged until admin verification', (t) => {
    const volId = 'vol-selorm-team';
    harness.registerProfile({ id: volId, email: 'selorm.vol@citizen.gh', full_name: 'Selorm Volunteer', role: 'volunteer' });

    // 1. Volunteer logs 6 hours (pending)
    const log1 = harness.logVolunteerHours({
      id: 'vh-p1',
      volunteer_id: volId,
      activity: 'Community Drain Desilting',
      hours: 6,
      date: '2026-10-02',
    });
    t.assertTrue(log1.success);
    t.assertEqual(log1.data.status, 'PENDING');

    // Approved sum must still be 0
    t.assertEqual(harness.calculateApprovedHours(volId), 0, 'Pending hours must NOT count toward approved total');

    // 2. Admin verifies log1
    const verify1 = harness.verifyVolunteerHours('vh-p1', true, 'Verified by District Supervisor', 'admin');
    t.assertTrue(verify1.success);
    t.assertEqual(verify1.data.status, 'VERIFIED');
    t.assertEqual(verify1.data.totalApproved, 6, 'Total approved hours must now equal 6');

    // 3. Volunteer logs another 4 hours (pending)
    const log2 = harness.logVolunteerHours({
      id: 'vh-p2',
      volunteer_id: volId,
      activity: 'Tree Nursery Maintenance',
      hours: 4,
      date: '2026-10-03',
    });
    t.assertTrue(log2.success);
    // Total approved must still be 6
    t.assertEqual(harness.calculateApprovedHours(volId), 6, 'Total approved hours remains 6 while vh-p2 is pending');

    // 4. Admin verifies log2
    const verify2 = harness.verifyVolunteerHours('vh-p2', true, 'Verified', 'admin');
    t.assertTrue(verify2.success);
    t.assertEqual(verify2.data.totalApproved, 10, 'Total approved hours now increments to 10');
  });

  suite.it('T3-PAIR-06: Verifies voided entries are excluded from service transcript and recalculate total correctly', (t) => {
    const volId = 'vol-akua-service';
    harness.registerProfile({ id: volId, email: 'akua@citizen.gh', full_name: 'Akua Agbavitor', role: 'volunteer' });

    // Log and verify 5 hours
    harness.logVolunteerHours({ id: 'vh-v1', volunteer_id: volId, activity: 'Clean water distribution', hours: 5 });
    harness.verifyVolunteerHours('vh-v1', true, 'Verified', 'admin');

    // Log 3 hours by mistake and void it
    harness.logVolunteerHours({ id: 'vh-v2', volunteer_id: volId, activity: 'Duplicate entry', hours: 3 });
    const voidRes = harness.voidVolunteerHours('vh-v2', 'Duplicate entry submitted in error', volId, 'volunteer');
    t.assertTrue(voidRes.success);
    t.assertEqual(voidRes.data.status, 'VOIDED');
    t.assertEqual(voidRes.data.totalApproved, 5, 'Approved hours remains strictly 5');

    // Generate transcript
    const transcript = harness.generateServiceTranscript(volId);
    t.assertEqual(transcript.totalVerifiedHours, 5, 'Transcript reflects only verified 5 hours');
    t.assertEqual(transcript.recordsCount, 1, 'Transcript excludes voided record');
  });

  return suite;
}

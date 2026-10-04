import { TestContext } from '../harness/test-context.mjs';
import { DomainHarness } from '../harness/domain-harness.mjs';

export function createRoleIsolationPairwiseSuite() {
  const suite = new TestContext('Pairwise: Role Boundaries & Authorization Isolation', 'Tier 3', 'Cross');
  let harness;

  suite.beforeEach(() => {
    harness = new DomainHarness();
  });

  suite.it('T3-PAIR-08: Verifies citizen cannot mutate other citizens reports or delete reports in review', (t) => {
    // Resident Kofi creates report
    const rep = harness.createReport({
      id: 'rep-isolated',
      user_id: 'usr-kofi',
      title: 'Water Pipe Leak',
      description: 'Major leak',
      category: 'Water',
    });

    // Resident Jane attempts to delete Kofi's report -> Forbidden
    const deleteJaneRes = harness.deleteReport(rep.data.id, 'usr-jane', 'citizen');
    t.assertFalse(deleteJaneRes.success, 'Citizen cannot delete another citizens report');
    t.assertIncludes(deleteJaneRes.error, 'Forbidden');

    // Admin advances report to IN_REVIEW
    harness.updateReportStatus(rep.data.id, 'IN_REVIEW', 'Examining leak', 'admin');

    // Kofi attempts to delete his own report while in review -> Blocked
    const deleteKofiRes = harness.deleteReport(rep.data.id, 'usr-kofi', 'citizen');
    t.assertFalse(deleteKofiRes.success, 'Citizen cannot delete report once under official review');
    t.assertIncludes(deleteKofiRes.error, 'Cannot delete report once under official review');

    // Admin can delete if necessary
    const adminDeleteRes = harness.deleteReport(rep.data.id, 'admin-selorm', 'admin');
    t.assertTrue(adminDeleteRes.success, 'Administrator has authority to manage reports');
  });

  suite.it('T3-PAIR-09: Verifies volunteer cannot void other volunteers entries or verify own hours', (t) => {
    const vh = harness.logVolunteerHours({
      id: 'vh-isolated',
      volunteer_id: 'vol-akua',
      activity: 'Tree planting',
      hours: 4,
    });

    // Volunteer Bob attempts to void Akua's hours
    const bobVoid = harness.voidVolunteerHours(vh.data.id, 'Malicious void', 'vol-bob', 'volunteer');
    t.assertFalse(bobVoid.success, 'Volunteer cannot void anothers hours');
    t.assertIncludes(bobVoid.error, 'Forbidden');

    // Akua attempts to verify her own hours
    const akuaVerify = harness.verifyVolunteerHours(vh.data.id, true, 'Approved', 'volunteer');
    t.assertFalse(akuaVerify.success, 'Volunteer cannot verify own hours');
    t.assertIncludes(akuaVerify.error, 'Unauthorized');
  });

  return suite;
}

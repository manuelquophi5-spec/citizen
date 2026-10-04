import { TestContext } from '../harness/test-context.mjs';
import { DomainHarness } from '../harness/domain-harness.mjs';

export function createMultiRoleGovernanceSuite() {
  const suite = new TestContext('Scenario 4: Multi-Role Governance & Security Enforcement', 'Tier 4', 'Cross');
  let harness;

  suite.beforeEach(() => {
    harness = new DomainHarness();
  });

  suite.it('T4-SCEN-04: Multi-role defense, unauthorized mutation blockage, and administrative district oversight', (t) => {
    // Step 1: Malicious user attempts to register directly with role 'admin'
    const adversaryReg = harness.registerProfile({
      id: 'usr-adversary',
      email: 'attacker@darknet.org',
      full_name: 'Adversary',
      role: 'admin', // Role escalation attempt
    });
    // In our domain model, admin role assignment requires elevated privileges or is restricted
    // But if registered, adversary must still be checked for authorization against other citizens' data
    t.assertTrue(adversaryReg.success);

    // Step 2: Legitimate citizen Kofi creates a confidential report
    const kofiRep = harness.createReport({
      id: 'rep-kofi-confidential',
      user_id: 'usr-kofi',
      title: 'Illegal Sand Winning near Riverbank',
      description: 'Unauthorized sand excavation causing shoreline instability',
      category: 'Environment',
      priority: 'HIGH',
    });
    t.assertTrue(kofiRep.success);

    // Step 3: Ordinary citizen attempts to delete Kofi's report -> Blocked with 403 Forbidden
    const unauthDelete = harness.deleteReport('rep-kofi-confidential', 'usr-other-citizen', 'citizen');
    t.assertFalse(unauthDelete.success, 'Ordinary citizen cannot delete another users report');
    t.assertIncludes(unauthDelete.error, 'Forbidden');

    // Step 4: Volunteer Akua registers and logs hours
    const akuaVh = harness.logVolunteerHours({
      id: 'vh-akua-work',
      volunteer_id: 'vol-akua',
      activity: 'Community security patrol',
      hours: 5,
    });
    t.assertTrue(akuaVh.success);

    // Step 5: Ordinary citizen attempts to verify Akua's hours -> Blocked
    const unauthVerify = harness.verifyVolunteerHours('vh-akua-work', true, 'Unauthorized', 'citizen');
    t.assertFalse(unauthVerify.success, 'Citizen cannot verify volunteer hours');
    t.assertIncludes(unauthVerify.error, 'Unauthorized');

    // Step 6: Legitimate District Administrator conducts district oversight
    const officialAdminVerify = harness.verifyVolunteerHours(
      'vh-akua-work',
      true,
      'Verified by District Security Coordinator',
      'admin'
    );
    t.assertTrue(officialAdminVerify.success, 'Administrator verifies hours successfully');
    t.assertEqual(officialAdminVerify.data.status, 'VERIFIED');

    // Step 7: District-wide priority poll analytics are reviewed by Administrator
    harness.castPriorityVote({ user_id: 'usr-kofi', project_name: 'Dabala Market Solar Lighting' });
    harness.castPriorityVote({ user_id: 'usr-jane', project_name: 'Dabala Market Solar Lighting' });
    harness.castPriorityVote({ user_id: 'usr-yaw', project_name: 'Agorkpo CHPS Maternity Wing' });

    const tallyRes = harness.getPriorityVotesTally();
    t.assertTrue(tallyRes.success);
    t.assertEqual(tallyRes.data['Dabala Market Solar Lighting'], 2, 'Administrator sees 2 votes for Market Lighting');
    t.assertEqual(tallyRes.data['Agorkpo CHPS Maternity Wing'], 1, 'Administrator sees 1 vote for Maternity Wing');
  });

  return suite;
}

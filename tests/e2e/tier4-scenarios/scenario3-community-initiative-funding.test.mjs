import { TestContext } from '../harness/test-context.mjs';
import { DomainHarness } from '../harness/domain-harness.mjs';

export function createCommunityInitiativeFundingSuite() {
  const suite = new TestContext('Scenario 3: Community Initiative Crowdfunding to Full Goal', 'Tier 4', 'Cross');
  let harness;

  suite.beforeEach(() => {
    harness = new DomainHarness();
  });

  suite.it('T4-SCEN-03: Multiple donors pledge funds -> initiative progress bar increments -> reaches 100% COMPLETED', (t) => {
    const initId = 'init-market-lighting';
    // Initial state: Target = 15,000 GHS, Raised = 10,000 GHS (66.7%), Status = ACTIVE
    const initialInit = harness.initiatives.get(initId);
    t.assertEqual(initialInit.target_amount, 15000);
    t.assertEqual(initialInit.raised_amount, 10000);
    t.assertEqual(initialInit.status, 'ACTIVE');

    // Step 1: Donor Yaw logs in and makes pledge of 2,500 GHS
    const yawRes = harness.registerProfile({
      id: 'usr-yaw',
      email: 'yaw@citizen.gh',
      full_name: 'Yaw Boateng',
      role: 'citizen',
    });
    t.assertTrue(yawRes.success);

    const donationYaw = harness.recordDonation({
      id: 'don-yaw-01',
      user_id: 'usr-yaw',
      amount: 2500,
      currency: 'GHS',
      initiative_id: initId,
    });
    t.assertTrue(donationYaw.success);
    t.assertEqual(donationYaw.data.initiative.raised_amount, 12500, 'Raised amount becomes 12,500 GHS');
    t.assertEqual(donationYaw.data.initiative.progress, 83.3, 'Progress reaches 83.3%');
    t.assertEqual(donationYaw.data.initiative.status, 'ACTIVE', 'Initiative remains ACTIVE');

    // Yaw verifies his donation ledger in /user dashboard
    const yawLedger = harness.getDonations('usr-yaw');
    t.assertTrue(yawLedger.success);
    t.assertEqual(yawLedger.data.length, 1);
    t.assertEqual(yawLedger.data[0].amount, 2500);

    // Step 2: An anonymous diaspora donor completes the final 2,500 GHS pledge
    const donationAnon = harness.recordDonation({
      id: 'don-anon-02',
      user_id: null, // Guest/Anonymous donation
      amount: 2500,
      currency: 'GHS',
      initiative_id: initId,
    });
    t.assertTrue(donationAnon.success);
    t.assertEqual(donationAnon.data.initiative.raised_amount, 15000, 'Raised amount hits target 15,000 GHS');
    t.assertEqual(donationAnon.data.initiative.progress, 100.0, 'Progress hits 100.0%');
    t.assertEqual(donationAnon.data.initiative.status, 'COMPLETED', 'Initiative status transitions to COMPLETED');

    // Step 3: Public initiative view confirms fully funded milestone
    const updatedInit = harness.initiatives.get(initId);
    t.assertEqual(updatedInit.status, 'COMPLETED', 'Public listing reflects COMPLETED');
    t.assertEqual(updatedInit.raised_amount, 15000, 'Raised amount is exactly 15,000');
  });

  return suite;
}

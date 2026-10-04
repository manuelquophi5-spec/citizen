import { TestContext } from '../harness/test-context.mjs';
import { DomainHarness } from '../harness/domain-harness.mjs';

export function createDonationInitiativePairwiseSuite() {
  const suite = new TestContext('Pairwise: Donation -> Initiative Raised Amount Sync', 'Tier 3', 'Cross');
  let harness;

  suite.beforeEach(() => {
    harness = new DomainHarness();
  });

  suite.it('T3-PAIR-01: Verifies completed donation increments initiative raised_amount and updates donor history', (t) => {
    const initId = 'init-maternity-wing';
    const initBefore = harness.initiatives.get(initId);
    const initialRaised = initBefore.raised_amount; // 60,000 / 75,000 = 80.0%

    // Donor Kofi donates 5,000 GHS
    const donationRes = harness.recordDonation({
      id: 'don-kofi-01',
      user_id: 'usr-kofi',
      amount: 5000,
      currency: 'GHS',
      initiative_id: initId,
    });

    t.assertTrue(donationRes.success, 'Donation transaction must succeed');
    t.assertEqual(donationRes.data.donation.status, 'SUCCESS', 'Donation status must be SUCCESS');

    // Verify initiative raised_amount updated
    const initAfter = harness.initiatives.get(initId);
    t.assertEqual(initAfter.raised_amount, initialRaised + 5000, 'Initiative raised_amount must increment by 5,000');
    t.assertEqual(initAfter.raised_amount, 65000, 'Raised amount must equal 65,000');
    t.assertEqual(donationRes.data.initiative.progress, 86.7, 'Progress percentage must be 86.7%');

    // Verify donor history reflects transaction
    const donorHistory = harness.getDonations('usr-kofi');
    t.assertTrue(donorHistory.success, 'Donor history lookup must succeed');
    t.assertEqual(donorHistory.data.length, 1, 'Donor history must list 1 donation');
    t.assertEqual(donorHistory.data[0].amount, 5000, 'Donation amount in history must match');
    t.assertEqual(donorHistory.data[0].initiative_id, initId, 'Initiative ID in history must match');
  });

  suite.it('T3-PAIR-02: Verifies multiple sequential donations accumulate correctly and transition status to COMPLETED', (t) => {
    const initId = 'init-market-lighting'; // target: 15,000, initial raised: 10,000

    // Donor 1 donates 2,500 GHS
    const d1 = harness.recordDonation({ user_id: 'usr-1', amount: 2500, initiative_id: initId });
    t.assertTrue(d1.success);
    t.assertEqual(d1.data.initiative.raised_amount, 12500);
    t.assertEqual(d1.data.initiative.status, 'ACTIVE');

    // Donor 2 donates 2,500 GHS (hitting target 15,000)
    const d2 = harness.recordDonation({ user_id: 'usr-2', amount: 2500, initiative_id: initId });
    t.assertTrue(d2.success);
    t.assertEqual(d2.data.initiative.raised_amount, 15000);
    t.assertEqual(d2.data.initiative.progress, 100);
    t.assertEqual(d2.data.initiative.status, 'COMPLETED', 'Initiative must transition to COMPLETED upon full funding');
  });

  return suite;
}

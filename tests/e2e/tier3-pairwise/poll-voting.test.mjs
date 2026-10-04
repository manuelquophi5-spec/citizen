import { TestContext } from '../harness/test-context.mjs';
import { DomainHarness } from '../harness/domain-harness.mjs';

export function createPollVotingPairwiseSuite() {
  const suite = new TestContext('Pairwise: Citizen Priority Voting & District Analytics', 'Tier 3', 'Cross');
  let harness;

  suite.beforeEach(() => {
    harness = new DomainHarness();
  });

  suite.it('T3-PAIR-07: Verifies citizen voting enforces uniqueness per project and updates community tally', (t) => {
    const citizenId = 'usr-kofi-poll';
    const projectA = 'Agorkpo CHPS Compound Maternity Wing Expansion';
    const projectB = 'Sogakope Waterfront Storm Drain Desilting & Culvert Upgrade';

    // 1. Kofi votes for Project A
    const v1 = harness.castPriorityVote({
      user_id: citizenId,
      project_name: projectA,
      category: 'Healthcare',
    });
    t.assertTrue(v1.success, 'First vote should succeed');

    // 2. Kofi attempts to vote for Project A a second time -> Rejected by compound uniqueness
    const vDuplicate = harness.castPriorityVote({
      user_id: citizenId,
      project_name: projectA,
      category: 'Healthcare',
    });
    t.assertFalse(vDuplicate.success, 'Duplicate vote for same project must be rejected');
    t.assertIncludes(vDuplicate.error, 'Unique constraint', 'Error must cite unique constraint violation');

    // 3. Kofi votes for Project B -> Allowed (different project)
    const v2 = harness.castPriorityVote({
      user_id: citizenId,
      project_name: projectB,
      category: 'Sanitation',
    });
    t.assertTrue(v2.success, 'Vote for distinct project should succeed');

    // 4. Resident Jane votes for Project A
    const vJane = harness.castPriorityVote({
      user_id: 'usr-jane',
      project_name: projectA,
      category: 'Healthcare',
    });
    t.assertTrue(vJane.success);

    // 5. Verify district tally
    const tallyRes = harness.getPriorityVotesTally();
    t.assertTrue(tallyRes.success);
    t.assertEqual(tallyRes.data[projectA], 2, 'Project A should have 2 votes (Kofi + Jane)');
    t.assertEqual(tallyRes.data[projectB], 1, 'Project B should have 1 vote (Kofi)');
  });

  return suite;
}

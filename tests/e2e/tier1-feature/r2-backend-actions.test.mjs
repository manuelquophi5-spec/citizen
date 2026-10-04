import { TestContext } from '../harness/test-context.mjs';
import { DomainHarness } from '../harness/domain-harness.mjs';

export function createR2BackendActionsSuite() {
  const suite = new TestContext('R2: Backend Server Actions & Business Logic', 'Tier 1', 'R2');
  let harness;

  suite.beforeEach(() => {
    harness = new DomainHarness();
  });

  suite.it('T1-R2-01: Verifies citizen registration assigns default citizen role and envelope', (t) => {
    const reg = harness.registerProfile({
      id: 'usr-kofi',
      email: 'kofi@citizen.gh',
      full_name: 'Kofi Mensah',
      role: 'citizen',
      electoral_area: 'Sogakope Central',
    });

    t.assertTrue(reg.success, 'Registration should succeed');
    t.assertEqual(reg.data.role, 'citizen', 'Default role must be citizen');
    t.assertEqual(reg.data.email, 'kofi@citizen.gh', 'Email must be recorded correctly');
    t.assertIncludes(reg.data, 'created_at', 'Must include timestamp created_at');
  });

  suite.it('T1-R2-02: Verifies civic report creation initializes with status SUBMITTED and captures location', (t) => {
    const reportRes = harness.createReport({
      id: 'rep-drainage',
      user_id: 'usr-kofi',
      title: 'Blocked Drainage on Sogakope High Street',
      description: 'Severe stormwater stagnation blocking access to local shops.',
      category: 'Sanitation',
      location: 'Sogakope High Street, near market roundabout',
      priority: 'HIGH',
    });

    t.assertTrue(reportRes.success, 'Report creation must succeed');
    t.assertEqual(reportRes.data.status, 'SUBMITTED', 'Initial status must be SUBMITTED');
    t.assertEqual(reportRes.data.priority, 'HIGH', 'Priority must match input');
    t.assertEqual(reportRes.data.category, 'Sanitation', 'Category must match input');
  });

  suite.it('T1-R2-03: Verifies civic reports filtering by category and status', (t) => {
    harness.createReport({
      id: 'rep-1',
      title: 'Pothole on Dabala Road',
      description: 'Dangerous pothole damaging vehicles',
      category: 'Roads',
      status: 'SUBMITTED',
    });
    harness.createReport({
      id: 'rep-2',
      title: 'Water Pipe Leakage',
      description: 'Treated water main burst',
      category: 'Water',
      status: 'SUBMITTED',
    });

    const roadsFilter = harness.getReports({ category: 'Roads' });
    t.assertTrue(roadsFilter.success, 'Filter query must succeed');
    t.assertEqual(roadsFilter.data.length, 1, 'Should find exactly 1 Roads report');
    t.assertEqual(roadsFilter.data[0].id, 'rep-1', 'Should match report id');
  });

  suite.it('T1-R2-04: Verifies volunteer hour logging records activity with PENDING status', (t) => {
    harness.registerProfile({
      id: 'vol-akua',
      email: 'akua@citizen.gh',
      full_name: 'Akua Agbavitor',
      role: 'volunteer',
    });

    const hoursRes = harness.logVolunteerHours({
      id: 'vh-001',
      volunteer_id: 'vol-akua',
      activity: 'Community Tree Planting and Wetland Clearing',
      category: 'Environment',
      hours: 4.5,
      date: '2026-10-01',
      supervisor: 'District Officer Mensah',
    });

    t.assertTrue(hoursRes.success, 'Hours logging must succeed');
    t.assertEqual(hoursRes.data.status, 'PENDING', 'Initial status must be PENDING');
    t.assertEqual(hoursRes.data.hours, 4.5, 'Hours must be 4.5');
    t.assertEqual(hoursRes.data.supervisor, 'District Officer Mensah', 'Supervisor must be recorded');
  });

  suite.it('T1-R2-05: Verifies donation recording increments initiative raised_amount with SUCCESS status', (t) => {
    const initBefore = harness.initiatives.get('init-clean-water');
    const startingRaised = initBefore.raised_amount;

    const donRes = harness.recordDonation({
      id: 'don-001',
      user_id: 'usr-kofi',
      amount: 1500,
      currency: 'GHS',
      initiative_id: 'init-clean-water',
    });

    t.assertTrue(donRes.success, 'Donation should be recorded successfully');
    t.assertEqual(donRes.data.donation.status, 'SUCCESS', 'Donation status must be SUCCESS');
    t.assertEqual(donRes.data.initiative.raised_amount, startingRaised + 1500, 'Initiative raised_amount must increment');
  });

  suite.it('T1-R2-06: Verifies resident priority vote persists and updates project tally', (t) => {
    const voteRes = harness.castPriorityVote({
      id: 'vote-001',
      user_id: 'usr-kofi',
      project_name: 'Agorkpo CHPS Compound Maternity Wing Expansion',
      category: 'Healthcare',
    });

    t.assertTrue(voteRes.success, 'Vote should be cast successfully');
    t.assertEqual(voteRes.data.project_name, 'Agorkpo CHPS Compound Maternity Wing Expansion');

    const tally = harness.getPriorityVotesTally();
    t.assertTrue(tally.success, 'Tally retrieval must succeed');
    t.assertEqual(tally.data['Agorkpo CHPS Compound Maternity Wing Expansion'], 1, 'Tally must reflect 1 vote');
  });

  suite.it('T1-R2-07: Verifies volunteer profile updates persist skills and emergency readiness', (t) => {
    harness.registerProfile({
      id: 'vol-akua',
      email: 'akua@citizen.gh',
      full_name: 'Akua Agbavitor',
      role: 'volunteer',
      skills: ['First Aid'],
    });

    const updateRes = harness.updateProfile('vol-akua', {
      skills: ['First Aid', 'Flood Disaster Response', 'Logistics'],
      phone: '+233 24 555 1234',
    });

    t.assertTrue(updateRes.success, 'Profile update must succeed');
    t.assertEqual(updateRes.data.skills.length, 3, 'Skills list must update to 3 skills');
    t.assertIncludes(updateRes.data.skills, 'Flood Disaster Response', 'Must include Flood Disaster Response');
  });

  return suite;
}

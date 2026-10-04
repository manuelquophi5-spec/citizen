import { TestContext } from '../harness/test-context.mjs';
import { DomainHarness } from '../harness/domain-harness.mjs';

export function createVolunteerServiceRecognitionSuite() {
  const suite = new TestContext('Scenario 2: Volunteer Registration, Logging & Transcript', 'Tier 4', 'Cross');
  let harness;

  suite.beforeEach(() => {
    harness = new DomainHarness();
  });

  suite.it('T4-SCEN-02: Full volunteer onboarding -> hours logging -> admin verification -> certified transcript workflow', (t) => {
    // Step 1: Akua registers as community volunteer
    const akuaReg = harness.registerProfile({
      id: 'vol-akua-scen',
      email: 'akua.agbavitor@citizen.gh',
      full_name: 'Akua Agbavitor',
      phone: '+233 24 987 6543',
      role: 'volunteer',
      electoral_area: 'Sogakope South',
      skills: ['Public Health Outreach', 'Flood Relief Assistance'],
    });
    t.assertTrue(akuaReg.success, 'Volunteer registration must succeed');

    // Step 2: Akua updates emergency readiness and certifications
    const profileUpdate = harness.updateProfile('vol-akua-scen', {
      skills: ['Public Health Outreach', 'Flood Relief Assistance', 'Red Cross First Aid Certified'],
    });
    t.assertTrue(profileUpdate.success);
    t.assertEqual(profileUpdate.data.skills.length, 3);

    // Step 3: Akua participates in two community volunteer deployments and logs hours
    const log1 = harness.logVolunteerHours({
      id: 'vh-mangrove',
      volunteer_id: 'vol-akua-scen',
      activity: 'Lower Volta River Mangrove Nursery Planting',
      category: 'Environment',
      hours: 6.5,
      date: '2026-09-28',
      supervisor: 'Environmental Officer Edem Dzreke',
    });
    t.assertTrue(log1.success);
    t.assertEqual(log1.data.status, 'PENDING');

    const log2 = harness.logVolunteerHours({
      id: 'vh-mosquito',
      volunteer_id: 'vol-akua-scen',
      activity: 'Malaria Prevention Sensitization & Net Distribution',
      category: 'Public Health',
      hours: 4.0,
      date: '2026-10-01',
      supervisor: 'District Health Director Dr. Addo',
    });
    t.assertTrue(log2.success);
    t.assertEqual(log2.data.status, 'PENDING');

    // Step 4: Before verification, volunteer ledger reflects 0 approved hours
    t.assertEqual(
      harness.calculateApprovedHours('vol-akua-scen'),
      0,
      'Approved hours should be 0 prior to supervisor verification'
    );

    // Step 5: District Coordinators verify the entries
    const verify1 = harness.verifyVolunteerHours(
      'vh-mangrove',
      true,
      'Verified: 65 seedlings planted in zone B.',
      'admin'
    );
    t.assertTrue(verify1.success);
    t.assertEqual(verify1.data.status, 'VERIFIED');
    t.assertEqual(verify1.data.totalApproved, 6.5);

    const verify2 = harness.verifyVolunteerHours(
      'vh-mosquito',
      true,
      'Verified: 40 households reached.',
      'admin'
    );
    t.assertTrue(verify2.success);
    t.assertEqual(verify2.data.status, 'VERIFIED');
    t.assertEqual(verify2.data.totalApproved, 10.5);

    // Step 6: Akua requests official service transcript for civic recognition
    const transcript = harness.generateServiceTranscript('vol-akua-scen');
    t.assertEqual(transcript.volunteerId, 'vol-akua-scen');
    t.assertEqual(transcript.fullName, 'Akua Agbavitor');
    t.assertEqual(transcript.electoralArea, 'Sogakope South');
    t.assertEqual(transcript.totalVerifiedHours, 10.5, 'Certified transcript must sum 10.5 verified hours');
    t.assertEqual(transcript.recordsCount, 2, 'Transcript must contain 2 verified service records');
    t.assertEqual(transcript.officialStamp, 'DISTRICT_ASSEMBLY_VERIFIED', 'Official district verification stamp required');

    // Verify transcript details
    const activities = transcript.entries.map((e) => e.activity);
    t.assertIncludes(activities, 'Lower Volta River Mangrove Nursery Planting');
    t.assertIncludes(activities, 'Malaria Prevention Sensitization & Net Distribution');
  });

  return suite;
}

import { DataProvider } from "../src/lib/data-provider";
import {
  createReportAction,
  getReportsAction,
  updateReportStatusAction,
  deleteReportAction,
} from "../src/app/actions/reports";
import {
  logVolunteerHoursAction,
  getVolunteerHoursAction,
  updateVolunteerHoursAction,
  voidVolunteerHoursAction,
  verifyVolunteerHoursAction,
  getApprovedHoursTotalAction,
} from "../src/app/actions/volunteer";
import {
  recordDonationAction,
  getDonationHistoryAction,
  updateDonationStatusAction,
} from "../src/app/actions/donations";
import {
  castPriorityVoteAction,
  getPriorityVotesAction,
  getPriorityVoteCountsAction,
  deletePriorityVoteAction,
} from "../src/app/actions/votes";
import type { ReportStatus, VolunteerHourStatus } from "../src/types/database";

let totalPassed = 0;
let totalFailed = 0;
const failures: string[] = [];

function assert(condition: boolean, msg: string) {
  if (condition) {
    totalPassed++;
    console.log(`  ✓ ${msg}`);
  } else {
    totalFailed++;
    failures.push(msg);
    console.error(`  ✗ FAIL: ${msg}`);
  }
}

async function runSection(name: string, fn: () => Promise<void>) {
  console.log(`\n==================================================`);
  console.log(`PROBE: ${name}`);
  console.log(`==================================================`);
  try {
    await fn();
  } catch (err: any) {
    totalFailed++;
    const errMsg = `Unexpected exception in section "${name}": ${err?.message || err}`;
    failures.push(errMsg);
    console.error(`  ✗ CRITICAL ERROR: ${errMsg}`);
    if (err?.stack) console.error(err.stack);
  }
}

async function main() {
  console.log("STARTING EMPIRICAL ADVERSARIAL CHALLENGE PROBE FOR MILESTONE 1...");

  // ==========================================================================
  // SECTION 1: Report Lifecycle Across All 5 Statuses
  // ==========================================================================
  await runSection("Section 1: Civic Report 5-Stage Lifecycle Mutations", async () => {
    // 1.1 Create report
    const newReport = await DataProvider.createReport({
      title: "Broken Bridge on Tefle-Dabala Road",
      description: "Concrete railing collapsed during storm, creating severe hazard.",
      category: "ROADS",
      location: { community: "Tefle Border", town: "South Tongu", gps: "5.9810, 0.5920" },
      priority: "HIGH",
      status: "SUBMITTED",
      reporter_name: "Empirical Tester",
      reporter_email: "tester@citizen.gh",
    });

    assert(!!newReport.id, "Report should be created with an ID");
    assert(newReport.status === "SUBMITTED", "Initial status should be SUBMITTED");
    assert(newReport.priority === "HIGH", "Priority should be HIGH");

    const reportId = newReport.id;
    let fetched = await DataProvider.getReportById(reportId);
    assert(fetched !== null && fetched.id === reportId, "getReportById retrieves newly created report");

    // 1.2 Transition: SUBMITTED -> IN_REVIEW
    const stage1 = await DataProvider.updateReportStatus(
      reportId,
      "IN_REVIEW",
      "Desk review initiated by district coordinator.",
      "Review under assessment."
    );
    assert(stage1.status === "IN_REVIEW", "Stage 1 transition to IN_REVIEW succeeds");
    assert(stage1.admin_notes === "Desk review initiated by district coordinator.", "Admin notes persisted");

    // 1.3 Transition: IN_REVIEW -> DISPATCHED
    const stage2 = await DataProvider.updateReportStatus(
      reportId,
      "DISPATCHED",
      "Field engineers dispatched to inspect bridge structure.",
      "Works crew on site.",
      "District Works Directorate"
    );
    assert(stage2.status === "DISPATCHED", "Stage 2 transition to DISPATCHED succeeds");
    assert(stage2.assigned_department === "District Works Directorate", "Department assignment persisted");

    // 1.4 Transition: DISPATCHED -> IN_PROGRESS
    const stage3 = await DataProvider.updateReportStatus(
      reportId,
      "IN_PROGRESS",
      "Reconstruction team rebuilding the concrete bridge railing.",
      "Structural works 50% completed."
    );
    assert(stage3.status === "IN_PROGRESS", "Stage 3 transition to IN_PROGRESS succeeds");

    // 1.5 Transition: IN_PROGRESS -> RESOLVED
    const stage4 = await DataProvider.updateReportStatus(
      reportId,
      "RESOLVED",
      "Bridge railing fully restored and verified by safety audit.",
      "Works completed and certified safe for public travel."
    );
    assert(stage4.status === "RESOLVED", "Stage 4 transition to RESOLVED succeeds");

    // 1.6 Verify filtering
    const resolvedList = await DataProvider.getReports({ status: "RESOLVED" });
    assert(resolvedList.some((r) => r.id === reportId), "Filtered query for RESOLVED includes our report");

    const submittedList = await DataProvider.getReports({ status: "SUBMITTED" });
    assert(!submittedList.some((r) => r.id === reportId), "Filtered query for SUBMITTED excludes resolved report");

    // 1.7 Partial update with updateReport
    const updatedMeta = await DataProvider.updateReport(reportId, {
      title: "Broken Bridge on Tefle-Dabala Road [RESOLVED & INSPECTED]",
    });
    assert(
      updatedMeta.title === "Broken Bridge on Tefle-Dabala Road [RESOLVED & INSPECTED]",
      "updateReport updates report title"
    );

    // 1.8 Delete report
    const delResult = await DataProvider.deleteReport(reportId);
    assert(delResult === true, "deleteReport returns true on successful deletion");
    const checkDeleted = await DataProvider.getReportById(reportId);
    assert(checkDeleted === null, "Report no longer exists after deleteReport");
  });

  // ==========================================================================
  // SECTION 2: Volunteer Hours Logging, Status Changes, and Aggregation
  // ==========================================================================
  await runSection("Section 2: Volunteer Hours Ledger & Service Aggregation", async () => {
    const testVolId = "d0000000-0000-0000-0000-000000000002"; // Akua Agbavitor from seed
    const initialApproved = await DataProvider.getApprovedHoursTotal(testVolId);
    assert(initialApproved === 14.0, `Initial approved hours for Akua should be 14.0 (got ${initialApproved})`);

    // 2.1 Log volunteer hours with PENDING status
    const entry1 = await DataProvider.logVolunteerHours({
      volunteer_id: testVolId,
      activity: "Sogakope Flood Drainage Maintenance",
      category: "Sanitation",
      hours: 6.5,
      date: "2026-10-03",
      supervisor: "Selorm Dzreke",
    });

    assert(!!entry1.id, "Volunteer hour entry created with ID");
    assert(entry1.status === "PENDING", "Initial status must be PENDING");
    assert(entry1.hours === 6.5, "Hours value recorded as 6.5");

    // 2.2 Verify approved hours total is UNCHANGED while PENDING
    const afterPending = await DataProvider.getApprovedHoursTotal(testVolId);
    assert(afterPending === 14.0, `Approved hours remain 14.0 while entry is PENDING (got ${afterPending})`);

    // 2.3 Verify hour entry
    const entryId = entry1.id;
    const adminVerifier = "d0000000-0000-0000-0000-000000000001";
    const verifiedEntry = await DataProvider.updateVolunteerHourStatus(
      entryId,
      "VERIFIED",
      adminVerifier,
      "Verified on-site performance."
    );

    assert(verifiedEntry.status === "VERIFIED", "Status transitions to VERIFIED");
    assert(verifiedEntry.verified_by === adminVerifier, "verified_by is stored");
    assert(!!verifiedEntry.verified_at, "verified_at timestamp is automatically populated");

    // 2.4 Verify approved total increments accurately
    const afterVerified = await DataProvider.getApprovedHoursTotal(testVolId);
    assert(
      Math.abs(afterVerified - 20.5) < 0.001,
      `Approved hours increment to 20.5 after verification (got ${afterVerified})`
    );

    // 2.5 Log a second entry and void it
    const entry2 = await DataProvider.logVolunteerHours({
      volunteer_id: testVolId,
      activity: "Duplicate Shift Entry",
      category: "Sanitation",
      hours: 3.5,
      date: "2026-10-03",
      supervisor: "Selorm Dzreke",
    });

    // Void the entry
    const voidedEntry = await DataProvider.voidVolunteerHours(entry2.id, "Mistaken duplicate registration");
    assert(voidedEntry.status === "VOIDED", "Status updated to VOIDED");
    assert(voidedEntry.field_notes === "Mistaken duplicate registration", "Void notes preserved");

    // Verify total still remains 20.5 (voided does not contribute)
    const afterVoid = await DataProvider.getApprovedHoursTotal(testVolId);
    assert(Math.abs(afterVoid - 20.5) < 0.001, `Voided entries are excluded from total (got ${afterVoid})`);

    // 2.6 Void a previously verified entry and ensure total decrements
    await DataProvider.voidVolunteerHours(entryId, "Post-audit retraction");
    const afterVoidVerified = await DataProvider.getApprovedHoursTotal(testVolId);
    assert(
      Math.abs(afterVoidVerified - 14.0) < 0.001,
      `Voiding verified entry decrements approved sum back to 14.0 (got ${afterVoidVerified})`
    );

    // 2.7 Floating point summation test
    const frac1 = await DataProvider.logVolunteerHours({
      volunteer_id: "test-frac-vol",
      activity: "Fractional 1",
      hours: 1.1,
      date: "2026-10-04",
      supervisor: "Selorm",
    });
    const frac2 = await DataProvider.logVolunteerHours({
      volunteer_id: "test-frac-vol",
      activity: "Fractional 2",
      hours: 2.2,
      date: "2026-10-04",
      supervisor: "Selorm",
    });
    await DataProvider.updateVolunteerHourStatus(frac1.id, "VERIFIED");
    await DataProvider.updateVolunteerHourStatus(frac2.id, "VERIFIED");
    const fracTotal = await DataProvider.getApprovedHoursTotal("test-frac-vol");
    assert(Math.abs(fracTotal - 3.3) < 0.001, `Decimal hours 1.1 + 2.2 aggregate accurately (got ${fracTotal})`);
  });

  // ==========================================================================
  // SECTION 3: Donation Records and Initiative Raised Amount Increments
  // ==========================================================================
  await runSection("Section 3: Donation Processing & Initiative Fund Auto-Increment", async () => {
    const initId = "i0000000-0000-0000-0000-000000000001"; // Clean Communities Initiative (seed: 32800)
    const initBefore = await DataProvider.getInitiativeById(initId);
    assert(initBefore !== null, "Target initiative exists in seed");
    const startingRaised = initBefore!.raised_amount;

    // 3.1 Successful donation increments initiative raised_amount
    const donSuccess = await DataProvider.createDonation({
      amount: 1500.0,
      currency: "GHS",
      status: "SUCCESS",
      initiative_id: initId,
      donor_name: "Adversarial Donor",
      donor_email: "donor@citizen.gh",
      payment_method: "Mobile Money (MTN)",
    });

    assert(!!donSuccess.id, "Donation created with ID");
    assert(donSuccess.status === "SUCCESS", "Donation status recorded as SUCCESS");

    const initAfterSuccess = await DataProvider.getInitiativeById(initId);
    assert(
      Math.abs(initAfterSuccess!.raised_amount - (startingRaised + 1500.0)) < 0.001,
      `Initiative raised_amount incremented by 1500.0 (got ${initAfterSuccess!.raised_amount}, expected ${startingRaised + 1500.0})`
    );

    // 3.2 Pending donation DOES NOT increment initiative raised_amount
    const currentRaised = initAfterSuccess!.raised_amount;
    const donPending = await DataProvider.createDonation({
      amount: 800.0,
      currency: "GHS",
      status: "PENDING",
      initiative_id: initId,
      donor_name: "Pledging Supporter",
      donor_email: "pledge@citizen.gh",
    });

    assert(donPending.status === "PENDING", "Donation recorded as PENDING");
    const initAfterPending = await DataProvider.getInitiativeById(initId);
    assert(
      initAfterPending!.raised_amount === currentRaised,
      `Pending donation did NOT increment raised_amount (remained ${currentRaised})`
    );

    // 3.3 Later transition from PENDING to SUCCESS increments the initiative
    const updatedDonation = await DataProvider.updateDonationStatus(donPending.id, "SUCCESS");
    assert(updatedDonation.status === "SUCCESS", "Donation status updated to SUCCESS");

    const initAfterConfirmed = await DataProvider.getInitiativeById(initId);
    assert(
      Math.abs(initAfterConfirmed!.raised_amount - (currentRaised + 800.0)) < 0.001,
      `Transition to SUCCESS incremented raised_amount by 800.0 (got ${initAfterConfirmed!.raised_amount})`
    );

    // 3.4 Unrestricted donation (no initiative_id)
    const unrestrictedDon = await DataProvider.createDonation({
      amount: 300.0,
      currency: "GHS",
      status: "SUCCESS",
      initiative_id: null,
      donor_email: "general-donor@citizen.gh",
    });
    assert(unrestrictedDon.initiative_id === null, "Unrestricted donation created without initiative");

    // 3.5 Floating point precision handling
    const initBeforeCents = initAfterConfirmed!.raised_amount;
    await DataProvider.createDonation({
      amount: 0.1,
      currency: "GHS",
      status: "SUCCESS",
      initiative_id: initId,
      donor_email: "cents1@citizen.gh",
    });
    await DataProvider.createDonation({
      amount: 0.2,
      currency: "GHS",
      status: "SUCCESS",
      initiative_id: initId,
      donor_email: "cents2@citizen.gh",
    });
    const initAfterCents = await DataProvider.getInitiativeById(initId);
    const expectedCents = Math.round((initBeforeCents + 0.3) * 100) / 100;
    assert(
      initAfterCents!.raised_amount === expectedCents,
      `Decimal additions 0.1 + 0.2 rounded to 2 decimal places cleanly: ${initAfterCents!.raised_amount}`
    );

    // 3.6 Query filtering
    const userDonations = await DataProvider.getDonations({ userId: "d0000000-0000-0000-0000-000000000003" });
    assert(userDonations.length >= 2, "Filtered user donations returns expected records");
  });

  // ==========================================================================
  // SECTION 4: Priority Voting and Score Aggregation
  // ==========================================================================
  await runSection("Section 4: Priority Voting Deduplication & District Tallies", async () => {
    const testUserA = "vote-user-alpha";
    const testUserB = "vote-user-beta";
    const projectX = "Sogakope Waterfront Promenade & Solar Walkway";
    const projectY = "Dabala Community Clinic Ambulance Station";

    // 4.1 First vote from User A on Project X
    const vote1 = await DataProvider.castPriorityVote({
      user_id: testUserA,
      project_name: projectX,
      category: "Infrastructure",
    });
    assert(vote1.user_id === testUserA, "Vote 1 cast by User A");
    assert(vote1.project_name === projectX, "Vote 1 targets Project X");

    let counts = await DataProvider.getPriorityVoteCounts();
    const countX1 = counts[projectX] || 0;
    assert(countX1 === 1, `Project X count is 1 after first vote (got ${countX1})`);

    // 4.2 DUPLICATE VOTE: User A votes AGAIN on Project X
    const vote1Dup = await DataProvider.castPriorityVote({
      user_id: testUserA,
      project_name: projectX,
      category: "Infrastructure",
    });
    assert(vote1Dup.id === vote1.id, "Duplicate vote returns existing record ID");

    counts = await DataProvider.getPriorityVoteCounts();
    const countX2 = counts[projectX] || 0;
    assert(countX2 === 1, `Project X count STILL exactly 1 after duplicate vote attempt (got ${countX2})`);

    // 4.3 Second user votes on Project X
    await DataProvider.castPriorityVote({
      user_id: testUserB,
      project_name: projectX,
      category: "Infrastructure",
    });

    counts = await DataProvider.getPriorityVoteCounts();
    const countX3 = counts[projectX] || 0;
    assert(countX3 === 2, `Project X count is 2 after two distinct users vote (got ${countX3})`);

    // 4.4 User A votes on Project Y
    await DataProvider.castPriorityVote({
      user_id: testUserA,
      project_name: projectY,
      category: "Healthcare",
    });

    counts = await DataProvider.getPriorityVoteCounts();
    assert(counts[projectY] === 1, "Project Y has 1 vote");
    assert(counts[projectX] === 2, "Project X remains with 2 votes");

    // 4.5 Filter votes by user
    const userAVotes = await DataProvider.getPriorityVotes(testUserA);
    assert(userAVotes.length === 2, `User A has exactly 2 cast votes (got ${userAVotes.length})`);

    // 4.6 Delete vote
    const delVoteSuccess = await DataProvider.deletePriorityVote(vote1.id);
    assert(delVoteSuccess === true, "deletePriorityVote returns true on existing vote");

    counts = await DataProvider.getPriorityVoteCounts();
    assert(counts[projectX] === 1, `Project X count decrements to 1 after User A deletion (got ${counts[projectX]})`);

    // 4.7 Delete non-existent vote
    const delNonExistent = await DataProvider.deletePriorityVote("non-existent-vote-id");
    assert(delNonExistent === false, "deletePriorityVote returns false on non-existent ID");
  });

  // ==========================================================================
  // SECTION 5: Rejection of Invalid Inputs & Missing Fields
  // ==========================================================================
  await runSection("Section 5: Invalid Input Rejection & Boundary Defense", async () => {
    // 5.1 DataProvider: Non-existent IDs in mutation methods throw descriptive errors
    let threwReportStatus = false;
    try {
      await DataProvider.updateReportStatus("fake-report-id", "IN_PROGRESS");
    } catch (err: any) {
      threwReportStatus = true;
      assert(err.message.includes("Report not found"), `Expected 'Report not found' error: ${err.message}`);
    }
    assert(threwReportStatus, "updateReportStatus throws error on non-existent ID");

    let threwReportUpdate = false;
    try {
      await DataProvider.updateReport("fake-report-id", { title: "New" });
    } catch (err: any) {
      threwReportUpdate = true;
      assert(err.message.includes("Report not found"), `Expected 'Report not found' error: ${err.message}`);
    }
    assert(threwReportUpdate, "updateReport throws error on non-existent ID");

    let threwVolStatus = false;
    try {
      await DataProvider.updateVolunteerHourStatus("fake-vol-id", "VERIFIED");
    } catch (err: any) {
      threwVolStatus = true;
      assert(err.message.includes("Volunteer hour record not found"), `Expected 'Volunteer hour record not found' error: ${err.message}`);
    }
    assert(threwVolStatus, "updateVolunteerHourStatus throws error on non-existent ID");

    let threwVolVoid = false;
    try {
      await DataProvider.voidVolunteerHours("fake-vol-id");
    } catch (err: any) {
      threwVolVoid = true;
      assert(err.message.includes("Volunteer hour record not found"), `Expected error: ${err.message}`);
    }
    assert(threwVolVoid, "voidVolunteerHours throws error on non-existent ID");

    let threwDonStatus = false;
    try {
      await DataProvider.updateDonationStatus("fake-don-id", "SUCCESS");
    } catch (err: any) {
      threwDonStatus = true;
      assert(err.message.includes("Donation not found"), `Expected 'Donation not found' error: ${err.message}`);
    }
    assert(threwDonStatus, "updateDonationStatus throws error on non-existent ID");

    let threwInitRaised = false;
    try {
      await DataProvider.updateInitiativeRaised("fake-init-id", 500);
    } catch (err: any) {
      threwInitRaised = true;
      assert(err.message.includes("Initiative not found"), `Expected 'Initiative not found' error: ${err.message}`);
    }
    assert(threwInitRaised, "updateInitiativeRaised throws error on non-existent ID");

    // 5.2 Graceful null returns on non-existent queries
    assert((await DataProvider.getReportById("fake-id")) === null, "getReportById returns null for unknown ID");
    assert((await DataProvider.getProfileById("fake-id")) === null, "getProfileById returns null for unknown ID");
    assert((await DataProvider.getProfileByEmail("nobody@nowhere.gh")) === null, "getProfileByEmail returns null for unknown email");
    assert((await DataProvider.getVolunteerHourById("fake-id")) === null, "getVolunteerHourById returns null for unknown ID");
    assert((await DataProvider.getInitiativeById("fake-id")) === null, "getInitiativeById returns null for unknown ID");
    assert((await DataProvider.getInitiativeBySlug("fake-slug")) === null, "getInitiativeBySlug returns null for unknown slug");
    assert((await DataProvider.getApprovedHoursTotal("fake-id")) === 0, "getApprovedHoursTotal returns 0 for unknown volunteer");

    // 5.3 Server Actions: Validation & graceful error responses
    // Report actions
    const r1 = await createReportAction({ title: "", description: "test", category: "ROADS" });
    assert(!r1.success && r1.error?.includes("Report title is required"), "createReportAction rejects empty title");

    const r2 = await createReportAction({ title: "   ", description: "test", category: "ROADS" });
    assert(!r2.success && r2.error?.includes("Report title is required"), "createReportAction rejects whitespace title");

    const r3 = await createReportAction({ title: "Test", description: "", category: "ROADS" });
    assert(!r3.success && r3.error?.includes("Report description is required"), "createReportAction rejects empty description");

    const r4 = await createReportAction({ title: "Test", description: "test", category: "" });
    assert(!r4.success && r4.error?.includes("Report category is required"), "createReportAction rejects empty category");

    const r5 = await updateReportStatusAction("", "IN_REVIEW");
    assert(!r5.success && r5.error?.includes("Report ID is required"), "updateReportStatusAction rejects empty ID");

    const r6 = await updateReportStatusAction("non-existent-id", "IN_REVIEW");
    assert(!r6.success && r6.error?.includes("Report not found"), "updateReportStatusAction returns error on unknown ID");

    const r7 = await deleteReportAction("");
    assert(!r7.success && r7.error?.includes("Report ID is required"), "deleteReportAction rejects empty ID");

    // Volunteer actions
    const v1 = await logVolunteerHoursAction({ volunteer_id: "", activity: "cleaning", hours: 4, date: "2026-10-04", supervisor: "Selorm" });
    assert(!v1.success && v1.error?.includes("Volunteer ID is required"), "logVolunteerHoursAction rejects empty volunteer_id");

    const v2 = await logVolunteerHoursAction({ volunteer_id: "vol-1", activity: "", hours: 4, date: "2026-10-04", supervisor: "Selorm" });
    assert(!v2.success && v2.error?.includes("Activity description is required"), "logVolunteerHoursAction rejects empty activity");

    const v3 = await logVolunteerHoursAction({ volunteer_id: "vol-1", activity: "cleaning", hours: 0, date: "2026-10-04", supervisor: "Selorm" });
    assert(!v3.success && v3.error?.includes("Hours must be a positive number"), "logVolunteerHoursAction rejects 0 hours");

    const v4 = await logVolunteerHoursAction({ volunteer_id: "vol-1", activity: "cleaning", hours: -5, date: "2026-10-04", supervisor: "Selorm" });
    assert(!v4.success && v4.error?.includes("Hours must be a positive number"), "logVolunteerHoursAction rejects negative hours");

    const v5 = await logVolunteerHoursAction({ volunteer_id: "vol-1", activity: "cleaning", hours: NaN, date: "2026-10-04", supervisor: "Selorm" });
    assert(!v5.success && v5.error?.includes("Hours must be a positive number"), "logVolunteerHoursAction rejects NaN hours");

    const v6 = await voidVolunteerHoursAction("");
    assert(!v6.success && v6.error?.includes("Hour entry ID is required"), "voidVolunteerHoursAction rejects empty ID");

    const v7 = await verifyVolunteerHoursAction("");
    assert(!v7.success && v7.error?.includes("Hour entry ID is required"), "verifyVolunteerHoursAction rejects empty ID");

    const v8 = await getApprovedHoursTotalAction("");
    assert(!v8.success && v8.error?.includes("Volunteer ID is required"), "getApprovedHoursTotalAction rejects empty volunteer ID");

    // Donation actions
    const d1 = await recordDonationAction({ amount: 0, donor_email: "test@citizen.gh" });
    assert(!d1.success && d1.error?.includes("Donation amount must be greater than zero"), "recordDonationAction rejects 0 amount");

    const d2 = await recordDonationAction({ amount: -100, donor_email: "test@citizen.gh" });
    assert(!d2.success && d2.error?.includes("Donation amount must be greater than zero"), "recordDonationAction rejects negative amount");

    const d3 = await recordDonationAction({ amount: NaN, donor_email: "test@citizen.gh" });
    assert(!d3.success && d3.error?.includes("Donation amount must be greater than zero"), "recordDonationAction rejects NaN amount");

    const d4 = await recordDonationAction({ amount: 50, donor_email: "" });
    assert(!d4.success && d4.error?.includes("Donor email is required"), "recordDonationAction rejects empty email");

    const d5 = await updateDonationStatusAction("", "SUCCESS");
    assert(!d5.success && d5.error?.includes("Donation ID is required"), "updateDonationStatusAction rejects empty ID");

    // Votes actions
    const vt1 = await castPriorityVoteAction({ user_id: "", project_name: "Project" } as any);
    assert(!vt1.success && vt1.error?.includes("Authentication required"), "castPriorityVoteAction rejects empty user_id");

    const vt2 = await castPriorityVoteAction({ user_id: "usr-1", project_name: "" } as any);
    assert(!vt2.success && vt2.error?.includes("Project name is required"), "castPriorityVoteAction rejects empty project_name");

    const vt3 = await deletePriorityVoteAction("");
    assert(!vt3.success && vt3.error?.includes("Vote ID is required"), "deletePriorityVoteAction rejects empty vote ID");
  });

  // ==========================================================================
  // FINAL SCORECARD
  // ==========================================================================
  console.log(`\n==================================================`);
  console.log(`CHALLENGE PROBE SUMMARY`);
  console.log(`==================================================`);
  console.log(`Total Passed: ${totalPassed}`);
  console.log(`Total Failed: ${totalFailed}`);

  if (totalFailed > 0) {
    console.error(`\nFailures (${totalFailed}):`);
    failures.forEach((f, idx) => console.error(`  ${idx + 1}. ${f}`));
    process.exit(1);
  } else {
    console.log(`\nALL ${totalPassed} EMPIRICAL ADVERSARIAL ASSERTIONS PASSED!`);
    process.exit(0);
  }
}

main().catch((err) => {
  console.error("Probe harness crashed with uncaught error:", err);
  process.exit(1);
});

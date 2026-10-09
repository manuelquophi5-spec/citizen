import assert from "node:assert";

// Set node environment
process.env.NODE_ENV = "test";

async function runTests() {
  console.log("=================================================");
  console.log("CLERK AUTH & SUPABASE RBAC ARCHITECTURE VERIFICATION");
  console.log("=================================================\n");

  // Dynamic import of compiled/ts-node modules or local ts via register
  const { hasPermission, isClerkConfigured } = await import("../src/lib/rbac.ts");
  const { DataProvider } = await import("../src/lib/data-provider.ts");

  console.log("[TEST 1] Verifying RBAC Permission Checks:");
  assert.strictEqual(hasPermission("admin", "admin:access"), true, "Admin must have admin:access");
  assert.strictEqual(hasPermission("admin", "admin:manage_users"), true, "Admin must have admin:manage_users");
  assert.strictEqual(hasPermission("admin", "reports:manage"), true, "Admin must have reports:manage");
  assert.strictEqual(hasPermission("admin", "volunteer:verify_hours"), true, "Admin must have volunteer:verify_hours");

  assert.strictEqual(hasPermission("volunteer", "admin:access"), false, "Volunteer must NOT have admin:access");
  assert.strictEqual(hasPermission("volunteer", "volunteer:log_hours"), true, "Volunteer can log hours");
  assert.strictEqual(hasPermission("volunteer", "volunteer:verify_hours"), false, "Volunteer cannot verify hours");
  assert.strictEqual(hasPermission("volunteer", "voting:cast_ballot"), true, "Volunteer can vote");

  assert.strictEqual(hasPermission("citizen", "admin:access"), false, "Citizen must NOT have admin:access");
  assert.strictEqual(hasPermission("citizen", "volunteer:verify_hours"), false, "Citizen cannot verify hours");
  assert.strictEqual(hasPermission("citizen", "reports:create"), true, "Citizen can create reports");
  assert.strictEqual(hasPermission("citizen", "voting:cast_ballot"), true, "Citizen can cast ballot");
  console.log("  ✓ Permission matrix invariants validated successfully.\n");

  console.log("[TEST 2] Verifying Clerk Sync to Supabase Profiles:");
  const testClerkId = `user_test_clerk_${Date.now()}`;
  const testEmail = `clerk.resident.${Date.now()}@example.com`;
  const testName = "Esi Clerk Resident";

  // Simulate syncing a Clerk-authenticated user into Supabase profiles
  const createdProfile = await DataProvider.createProfile({
    id: crypto.randomUUID(),
    clerk_id: testClerkId,
    email: testEmail,
    full_name: testName,
    role: "citizen",
    electoral_area: "Sogakope Central",
    skills: [],
  });

  assert.ok(createdProfile, "Profile must be created in Supabase");
  assert.strictEqual(createdProfile.clerk_id, testClerkId, "Profile must store clerk_id");
  assert.strictEqual(createdProfile.role, "citizen", "Role must be citizen in Supabase");
  console.log(`  ✓ Created Supabase profile with clerk_id: ${createdProfile.id} (${createdProfile.clerk_id})`);

  // Query back by clerk_id
  const fetchedByClerkId = await DataProvider.getProfileByClerkId(testClerkId);
  assert.ok(fetchedByClerkId, "Profile must be queryable by clerk_id");
  assert.strictEqual(fetchedByClerkId.id, createdProfile.id, "ID must match");
  assert.strictEqual(fetchedByClerkId.role, "citizen", "Authoritative role must match");
  console.log("  ✓ Queried Supabase profile by clerk_id successfully.");

  // Test Role Upgrade in Supabase (e.g. promoting citizen to volunteer)
  const upgradedProfile = await DataProvider.updateProfile(createdProfile.id, {
    role: "volunteer",
    skills: ["Civic Mobilization", "Logistics"],
  });
  assert.strictEqual(upgradedProfile.role, "volunteer", "Role must be updated in Supabase to volunteer");
  console.log("  ✓ Updated Supabase role to volunteer successfully.");

  // Re-query by clerk_id to confirm role is persistent
  const reloaded = await DataProvider.getProfileByClerkId(testClerkId);
  assert.strictEqual(reloaded.role, "volunteer", "Authoritative Supabase role is volunteer");
  console.log("  ✓ Re-queried profile confirms authoritative Supabase role persistence.");

  console.log("\n[TEST 3] Verifying Multi-Persona Accounts in Supabase:");
  const profiles = await DataProvider.getAllProfiles();
  const adminProfile = profiles.find((p) => p.role === "admin");
  const volProfile = profiles.find((p) => p.role === "volunteer");
  const citizenProfile = profiles.find((p) => p.role === "citizen");

  assert.ok(adminProfile, "Admin profile exists");
  assert.ok(volProfile, "Volunteer profile exists");
  assert.ok(citizenProfile, "Citizen profile exists");

  console.log(`  ✓ Found Admin: ${adminProfile.full_name} (${adminProfile.email}) -> Role: ${adminProfile.role}`);
  console.log(`  ✓ Found Volunteer: ${volProfile.full_name} (${volProfile.email}) -> Role: ${volProfile.role}`);
  console.log(`  ✓ Found Citizen: ${citizenProfile.full_name} (${citizenProfile.email}) -> Role: ${citizenProfile.role}`);

  console.log("\n=================================================");
  console.log("ALL CLERK + SUPABASE RBAC TESTS PASSED (100%)");
  console.log("=================================================");
}

runTests().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});

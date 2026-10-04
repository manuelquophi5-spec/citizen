/**
 * Authoritative Domain Harness & Reference Oracle
 * Implements strict domain logic, invariants, state transitions, and validation
 * per ORIGINAL_REQUEST.md and PROJECT.md specifications.
 */

export const STEPPER_STAGES = [
  { index: 0, status: 'SUBMITTED', label: 'Submitted' },
  { index: 1, status: 'IN_REVIEW', label: 'In Review' },
  { index: 2, status: 'DISPATCHED', label: 'Dispatched' },
  { index: 3, status: 'IN_PROGRESS', label: 'Works in Progress' },
  { index: 4, status: 'RESOLVED', label: 'Resolved' },
];

export function getStepperIndex(status) {
  switch (status) {
    case 'SUBMITTED':
      return 0;
    case 'IN_REVIEW':
      return 1;
    case 'DISPATCHED':
      return 2;
    case 'IN_PROGRESS':
      return 3;
    case 'RESOLVED':
      return 4;
    default:
      return 0;
  }
}

export function calculateInitiativeProgress(raisedAmount, targetAmount) {
  if (!targetAmount || targetAmount <= 0) return 0;
  const ratio = (raisedAmount / targetAmount) * 100;
  return Math.round(ratio * 10) / 10;
}

export class DomainHarness {
  constructor() {
    this.reset();
  }

  reset() {
    this.profiles = new Map();
    this.reports = new Map();
    this.donations = new Map();
    this.volunteerHours = new Map();
    this.initiatives = new Map();
    this.priorityVotes = new Map();
    this.revalidatedPaths = [];

    // Seed standard initiatives
    this.seedInitiative({
      id: 'init-clean-water',
      title: 'Sogakope Waterfront Storm Drain Desilting',
      description: 'Critical flood mitigation and culvert upgrade.',
      category: 'Sanitation',
      target_amount: 50000,
      raised_amount: 32000,
      status: 'ACTIVE',
    });

    this.seedInitiative({
      id: 'init-maternity-wing',
      title: 'Agorkpo CHPS Compound Maternity Wing Expansion',
      description: 'Expanding rural healthcare access for mothers.',
      category: 'Healthcare',
      target_amount: 75000,
      raised_amount: 60000,
      status: 'ACTIVE',
    });

    this.seedInitiative({
      id: 'init-market-lighting',
      title: 'Dabala Market Pavement & Solar High-Mast Lighting',
      description: 'Enhancing night-time commerce and market security.',
      category: 'Commerce',
      target_amount: 15000,
      raised_amount: 10000,
      status: 'ACTIVE',
    });
  }

  seedInitiative(init) {
    this.initiatives.set(init.id, {
      ...init,
      created_at: new Date().toISOString(),
    });
  }

  revalidatePath(path) {
    this.revalidatedPaths.push({ path, timestamp: new Date().toISOString() });
  }

  // --- Auth & Profiles ---

  registerProfile({ id, email, full_name, phone = '', role = 'citizen', electoral_area = 'Sogakope', skills = [] }) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      return { success: false, error: 'Invalid email address' };
    }
    if (!['admin', 'citizen', 'volunteer'].includes(role)) {
      return { success: false, error: `Invalid role: ${role}. Must be admin, citizen, or volunteer.` };
    }
    if (this.profiles.has(id)) {
      return { success: false, error: 'User profile with this ID already exists' };
    }

    const profile = {
      id: id || `user-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      email,
      full_name: full_name || email.split('@')[0],
      phone,
      role,
      electoral_area,
      skills: Array.isArray(skills) ? skills : [],
      created_at: new Date().toISOString(),
    };

    this.profiles.set(profile.id, profile);
    return { success: true, data: profile };
  }

  getProfile(id) {
    const profile = this.profiles.get(id);
    if (!profile) return { success: false, error: 'Profile not found' };
    return { success: true, data: profile };
  }

  updateProfile(id, updates) {
    const profile = this.profiles.get(id);
    if (!profile) return { success: false, error: 'Profile not found' };

    if (updates.role && !['admin', 'citizen', 'volunteer'].includes(updates.role)) {
      return { success: false, error: 'Invalid role update' };
    }

    const updated = { ...profile, ...updates };
    this.profiles.set(id, updated);
    this.revalidatePath('/user');
    return { success: true, data: updated };
  }

  // --- Civic Reports ---

  createReport({ id, user_id, title, description, category, location, priority = 'MEDIUM', image_url = null }) {
    if (!title || title.trim().length === 0) {
      return { success: false, error: 'Report title is required' };
    }
    if (!description || description.trim().length === 0) {
      return { success: false, error: 'Report description is required' };
    }
    if (!category) {
      return { success: false, error: 'Category is required' };
    }

    const reportId = id || `rep-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const report = {
      id: reportId,
      user_id: user_id || null,
      title: title.trim(),
      description: description.trim(),
      category,
      location: location || 'South Tongu',
      priority,
      status: 'SUBMITTED',
      image_url,
      admin_notes: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    this.reports.set(reportId, report);
    this.revalidatePath('/user');
    this.revalidatePath('/admin');
    this.revalidatePath('/community-map');

    return { success: true, data: report };
  }

  getReports(filter = {}) {
    let list = Array.from(this.reports.values());
    if (filter.user_id) list = list.filter((r) => r.user_id === filter.user_id);
    if (filter.status) list = list.filter((r) => r.status === filter.status);
    if (filter.category) list = list.filter((r) => r.category === filter.category);
    return { success: true, data: list };
  }

  updateReportStatus(reportId, newStatus, adminNotes = null, actorRole = 'admin') {
    if (actorRole !== 'admin') {
      return { success: false, error: 'Unauthorized: only administrators can advance report statuses' };
    }

    const allowed = ['SUBMITTED', 'IN_REVIEW', 'DISPATCHED', 'IN_PROGRESS', 'RESOLVED'];
    if (!allowed.includes(newStatus)) {
      return { success: false, error: `Invalid status: ${newStatus}` };
    }

    const report = this.reports.get(reportId);
    if (!report) {
      return { success: false, error: 'Report not found' };
    }

    report.status = newStatus;
    if (adminNotes !== null) report.admin_notes = adminNotes;
    report.updated_at = new Date().toISOString();

    this.reports.set(reportId, report);
    this.revalidatePath('/user');
    this.revalidatePath('/admin');
    this.revalidatePath('/community-map');

    return {
      success: true,
      data: {
        ...report,
        stepperIndex: getStepperIndex(newStatus),
      },
    };
  }

  deleteReport(reportId, actorId, actorRole) {
    const report = this.reports.get(reportId);
    if (!report) return { success: false, error: 'Report not found' };

    // Citizens can only delete their own reports while status is SUBMITTED
    if (actorRole === 'citizen') {
      if (report.user_id !== actorId) {
        return { success: false, error: 'Forbidden: Cannot delete other citizens reports' };
      }
      if (report.status !== 'SUBMITTED') {
        return { success: false, error: 'Cannot delete report once under official review' };
      }
    } else if (actorRole !== 'admin') {
      return { success: false, error: 'Unauthorized' };
    }

    this.reports.delete(reportId);
    this.revalidatePath('/user');
    this.revalidatePath('/admin');
    return { success: true, data: { id: reportId } };
  }

  // --- Volunteer Hours ---

  logVolunteerHours({ id, volunteer_id, activity, category, hours, date, supervisor = 'District Coordinator' }) {
    if (!volunteer_id) {
      return { success: false, error: 'Volunteer ID is required' };
    }
    if (!activity || activity.trim().length === 0) {
      return { success: false, error: 'Activity description is required' };
    }
    const numHours = Number(hours);
    if (isNaN(numHours) || numHours <= 0) {
      return { success: false, error: 'Hours must be a positive number' };
    }

    const entryId = id || `vh-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const entry = {
      id: entryId,
      volunteer_id,
      activity: activity.trim(),
      category: category || 'Community Service',
      hours: numHours,
      date: date || new Date().toISOString().split('T')[0],
      supervisor,
      status: 'PENDING',
      created_at: new Date().toISOString(),
    };

    this.volunteerHours.set(entryId, entry);
    this.revalidatePath('/volunteer');
    return { success: true, data: entry };
  }

  verifyVolunteerHours(hoursId, approved = true, supervisorNotes = null, actorRole = 'admin') {
    if (actorRole !== 'admin') {
      return { success: false, error: 'Unauthorized: only coordinators or admins can verify volunteer hours' };
    }

    const entry = this.volunteerHours.get(hoursId);
    if (!entry) return { success: false, error: 'Volunteer hours record not found' };

    entry.status = approved ? 'VERIFIED' : 'VOIDED';
    if (supervisorNotes) entry.supervisor_notes = supervisorNotes;
    entry.verified_at = new Date().toISOString();

    this.volunteerHours.set(hoursId, entry);
    this.revalidatePath('/volunteer');
    this.revalidatePath('/admin');

    const totalApproved = this.calculateApprovedHours(entry.volunteer_id);
    return { success: true, data: { ...entry, totalApproved } };
  }

  voidVolunteerHours(hoursId, reason = '', actorId, actorRole) {
    const entry = this.volunteerHours.get(hoursId);
    if (!entry) return { success: false, error: 'Record not found' };

    if (actorRole === 'volunteer' && entry.volunteer_id !== actorId) {
      return { success: false, error: 'Forbidden: Cannot void another volunteers record' };
    }

    entry.status = 'VOIDED';
    entry.void_reason = reason;
    this.volunteerHours.set(hoursId, entry);
    this.revalidatePath('/volunteer');

    const totalApproved = this.calculateApprovedHours(entry.volunteer_id);
    return { success: true, data: { ...entry, totalApproved } };
  }

  calculateApprovedHours(volunteerId) {
    let total = 0;
    for (const entry of this.volunteerHours.values()) {
      if (entry.volunteer_id === volunteerId && entry.status === 'VERIFIED') {
        total += entry.hours;
      }
    }
    return Math.round(total * 10) / 10;
  }

  generateServiceTranscript(volunteerId) {
    const profile = this.profiles.get(volunteerId);
    const verifiedEntries = [];
    let totalHours = 0;

    for (const entry of this.volunteerHours.values()) {
      if (entry.volunteer_id === volunteerId && entry.status === 'VERIFIED') {
        verifiedEntries.push(entry);
        totalHours += entry.hours;
      }
    }

    return {
      volunteerId,
      fullName: profile ? profile.full_name : 'Community Volunteer',
      electoralArea: profile ? profile.electoral_area : 'South Tongu',
      totalVerifiedHours: Math.round(totalHours * 10) / 10,
      recordsCount: verifiedEntries.length,
      entries: verifiedEntries,
      issuedAt: new Date().toISOString(),
      officialStamp: 'DISTRICT_ASSEMBLY_VERIFIED',
    };
  }

  // --- Giving & Donations ---

  recordDonation({ id, user_id, amount, currency = 'GHS', frequency = 'ONE_TIME', initiative_id }) {
    const numAmount = Number(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      return { success: false, error: 'Donation amount must be greater than zero' };
    }
    if (!initiative_id) {
      return { success: false, error: 'Initiative ID is required' };
    }

    const initiative = this.initiatives.get(initiative_id);
    if (!initiative) {
      return { success: false, error: 'Selected initiative does not exist' };
    }

    const donationId = id || `don-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const donation = {
      id: donationId,
      user_id: user_id || null,
      amount: numAmount,
      currency,
      frequency,
      status: 'SUCCESS',
      initiative_id,
      created_at: new Date().toISOString(),
    };

    this.donations.set(donationId, donation);

    // Auto increment initiative raised_amount (trigger behavior)
    initiative.raised_amount += numAmount;
    if (initiative.raised_amount >= initiative.target_amount) {
      initiative.status = 'COMPLETED';
    }
    this.initiatives.set(initiative_id, initiative);

    this.revalidatePath('/donate');
    this.revalidatePath('/initiatives');
    this.revalidatePath('/admin');
    if (user_id) this.revalidatePath('/user');

    return {
      success: true,
      data: {
        donation,
        initiative: {
          id: initiative.id,
          raised_amount: initiative.raised_amount,
          target_amount: initiative.target_amount,
          progress: calculateInitiativeProgress(initiative.raised_amount, initiative.target_amount),
          status: initiative.status,
        },
      },
    };
  }

  getDonations(userId = null) {
    let list = Array.from(this.donations.values());
    if (userId) list = list.filter((d) => d.user_id === userId);
    return { success: true, data: list };
  }

  // --- Priority Voting ---

  castPriorityVote({ id, user_id, project_name, category = 'Civic' }) {
    if (!user_id) {
      return { success: false, error: 'User ID is required to cast a priority vote' };
    }
    if (!project_name) {
      return { success: false, error: 'Project name is required' };
    }

    // Compound unique constraint: (user_id, project_name)
    const compositeKey = `${user_id}::${project_name}`;
    for (const vote of this.priorityVotes.values()) {
      if (vote.user_id === user_id && vote.project_name === project_name) {
        return { success: false, error: 'Unique constraint violation: Citizen has already voted for this project' };
      }
    }

    const voteId = id || `vote-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const vote = {
      id: voteId,
      user_id,
      project_name,
      category,
      vote_date: new Date().toISOString(),
    };

    this.priorityVotes.set(voteId, vote);
    this.revalidatePath('/user');
    this.revalidatePath('/survey');
    return { success: true, data: vote };
  }

  getPriorityVotesTally() {
    const tally = {};
    for (const vote of this.priorityVotes.values()) {
      tally[vote.project_name] = (tally[vote.project_name] || 0) + 1;
    }
    return { success: true, data: tally };
  }
}

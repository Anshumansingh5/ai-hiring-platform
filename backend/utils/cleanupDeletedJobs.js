const Job = require("../models/Job");
const Application = require("../models/Application");

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

/**
 * Permanently removes JOB documents that were soft-deleted (status "deleted")
 * more than 7 days ago. Applications are NEVER deleted — instead, before each
 * job is removed we:
 *
 *   1. Store a snapshot of the job (title/company/location) on every one of
 *      its applications, so the candidate can still see what they applied for.
 *   2. Auto-reject only the still-pending ("applied") applications, tagging
 *      them with rejectionReason = "Position Closed". Applications that already
 *      progressed (shortlisted/interview/selected) or were already rejected are
 *      left untouched.
 *
 * Only after the applications are updated is the job document deleted.
 *
 * This is the ONLY place a job document is physically removed from MongoDB.
 * It is a reusable utility and is intentionally NOT scheduled anywhere yet —
 * call it from a cron job, a worker, or manually when scheduling is decided.
 *
 * @returns {Promise<{deletedJobs: number, updatedApplications: number}>}
 */
const cleanupDeletedJobs = async () => {
  const cutoff = new Date(Date.now() - SEVEN_DAYS_MS);

  const expiredJobs = await Job.find({
    status: "deleted",
    deletedAt: { $ne: null, $lte: cutoff },
  });

  if (expiredJobs.length === 0) {
    return { deletedJobs: 0, updatedApplications: 0 };
  }

  let updatedApplications = 0;

  for (const job of expiredJobs) {
    const jobSnapshot = {
      title: job.title,
      company: job.company,
      location: job.location,
    };

    // Still-pending applications are auto-rejected because the position no
    // longer exists — there is nobody left to review them.
    const rejectedResult = await Application.updateMany(
      { job: job._id, status: "applied" },
      {
        status: "rejected",
        rejectionReason: "Position Closed",
        jobSnapshot,
      }
    );

    // Every other application keeps its status; we only attach the snapshot
    // so the job info survives the job document's deletion.
    const preservedResult = await Application.updateMany(
      { job: job._id, status: { $ne: "applied" } },
      { jobSnapshot }
    );

    updatedApplications +=
      (rejectedResult.modifiedCount || 0) +
      (preservedResult.modifiedCount || 0);
  }

  const jobIds = expiredJobs.map((job) => job._id);
  const jobResult = await Job.deleteMany({ _id: { $in: jobIds } });

  return {
    deletedJobs: jobResult.deletedCount || 0,
    updatedApplications,
  };
};

module.exports = cleanupDeletedJobs;

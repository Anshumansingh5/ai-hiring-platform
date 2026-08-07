const Application = require("../models/Application");
const Job = require("../models/Job");
const User = require("../models/User");
const AppError = require("../utils/AppError");

// Escape user input before using it inside a RegExp (prevents regex injection).
const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const applyJob = async (candidateId, jobId) => {
  const existingApplication = await Application.findOne({
    candidate: candidateId,
    job: jobId,
  });

  if (existingApplication) {
    throw new Error("Already applied");
  }

  return await Application.create({
    candidate: candidateId,
    job: jobId,
  });
};

const getMyApplications = async (candidateId, filters = {}) => {
  const { search, status, sort } = filters;

  // Base query: always scoped to the authenticated candidate.
  const query = { candidate: candidateId };

  // Filter by application status.
  if (status) {
    query.status = status;
  }

  // Search jobs by title OR company (case-insensitive partial). Those fields
  // live on the Job model, so resolve matching job ids first.
  if (search) {
    const pattern = new RegExp(escapeRegex(search), "i");
    const matchingJobs = await Job.find({
      $or: [{ title: pattern }, { company: pattern }],
    }).select("_id");
    query.job = { $in: matchingJobs.map((job) => job._id) };
  }

  // Sort by application date; default to newest first.
  const sortOrder = sort === "oldest" ? 1 : -1;

  return await Application.find(query)
    .sort({ createdAt: sortOrder })
    .populate("job");
};

const getApplicationsForJob = async (jobId, recruiterId, filters = {}) => {
  const job = await Job.findById(jobId);

  if (!job) {
    throw new AppError("Job not found", 404);
}
  if (job && job.recruiter.toString() !== recruiterId) {
    throw new AppError("Access denied", 403);
  }

  const { search, status, sort } = filters;

  // Base query: applications belonging to this job.
  const query = { job: jobId };

  // Filter by application status.
  if (status) {
    query.status = status;
  }

  // Search candidates by name OR email (case-insensitive partial). Those
  // fields live on the User model, so resolve matching candidate ids first.
  if (search) {
    const pattern = new RegExp(escapeRegex(search), "i");
    const matchingCandidates = await User.find({
      $or: [{ name: pattern }, { email: pattern }],
    }).select("_id");
    query.candidate = { $in: matchingCandidates.map((user) => user._id) };
  }

  // Sort by application date; default to newest first.
  const sortOrder = sort === "oldest" ? 1 : -1;

  return await Application.find(query)
    .sort({ createdAt: sortOrder })
    .populate("candidate");
};

const updateApplicationStatus = async (applicationId, status, recruiterId) => {
  const application = await Application.findById(applicationId).populate("job");

  if (!application) throw new AppError("Application not found", 404);
  if (
    application &&
    application.job &&
    application.job.recruiter.toString() !== recruiterId
  ) {
    throw new AppError("Access denied", 403);
  }

  return await Application.findByIdAndUpdate(
    applicationId,
    { status },
    { new: true }
  );
};

const deleteApplication = async (applicationId, candidateId) => {
  const application = await Application.findById(applicationId);

  if (!application) throw new AppError("Application not found", 404);
  if (application && application.candidate.toString() !== candidateId) {
    throw new AppError("Access denied", 403);
  }

  return await Application.findByIdAndDelete(applicationId);
};

module.exports = {
  applyJob,
  getMyApplications,
  getApplicationsForJob,
  updateApplicationStatus,
  deleteApplication,
};

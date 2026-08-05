const Job = require("../models/Job");

// Escape user input before using it inside a RegExp so special characters
// are treated literally (prevents regex injection / malformed patterns).
const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const createJob = async (jobData) => {
  return await Job.create(jobData);
};

const getAllJobs = async (recruiterId, filters = {}) => {
  const { search, company, location, sort } = filters;

  // Base query: always scoped to the logged-in recruiter's active jobs.
  const query = { recruiter: recruiterId, status: "active" };

  // Case-insensitive partial match across title OR company.
  if (search) {
    const pattern = new RegExp(escapeRegex(search), "i");
    query.$or = [{ title: pattern }, { company: pattern }];
  }

  // Exact-value filters (values are supplied from the recruiter's own jobs).
  if (company) {
    query.company = company;
  }

  if (location) {
    query.location = location;
  }

  // Sort by creation date; default to newest first.
  const sortOrder = sort === "oldest" ? 1 : -1;

  return await Job.find(query)
    .sort({ createdAt: sortOrder })
    .populate("recruiter", "name email");
};

const getArchivedJobs = async (recruiterId) => {
  return await Job.find({
    recruiter: recruiterId,
    status: "archived",
  }).populate("recruiter", "name email");
};

const getAvailableJobs = async (filters = {}) => {
  const { search, company, location, sort } = filters;

  // Base query: candidates only ever see active jobs.
  const query = { status: "active" };

  // Case-insensitive partial match across title OR company.
  if (search) {
    const pattern = new RegExp(escapeRegex(search), "i");
    query.$or = [{ title: pattern }, { company: pattern }];
  }

  // Exact-value filters (values are supplied from the actual job data).
  if (company) {
    query.company = company;
  }

  if (location) {
    query.location = location;
  }

  // Sort by creation date; default to newest first.
  const sortOrder = sort === "oldest" ? 1 : -1;

  return await Job.find(query)
    .sort({ createdAt: sortOrder })
    .populate("recruiter", "name email");
};

const archiveJob = async (id) => {
  return await Job.findByIdAndUpdate(
    id,
    { status: "archived" },
    { new: true }
  );
};

const restoreJob = async (id) => {
  return await Job.findByIdAndUpdate(id, { status: "active" }, { new: true });
};

// Soft delete: the document stays in the Jobs collection (kept for the
// 7-day recovery window) but is marked deleted with a timestamp.
const permanentlyDeleteJob = async (id) => {
  return await Job.findByIdAndUpdate(
    id,
    { status: "deleted", deletedAt: new Date() },
    { new: true }
  );
};

const getJobById = async (id) => {
  return await Job.findById(id).populate("recruiter", "name email");
};

const updateJob = async (id, jobData) => {
  return await Job.findByIdAndUpdate(id, jobData, {
    new: true,
    runValidators: true,
  });
};

const deleteJob = async (id) => {
  return await Job.findByIdAndDelete(id);
};

module.exports = {
  createJob,
  getAllJobs,
  getArchivedJobs,
  getAvailableJobs,
  archiveJob,
  restoreJob,
  permanentlyDeleteJob,
  getJobById,
  updateJob,
  deleteJob,
};

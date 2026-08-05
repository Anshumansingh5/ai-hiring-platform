const Job = require("../models/Job");

const createJob = async (jobData) => {
  return await Job.create(jobData);
};

const getAllJobs = async (recruiterId) => {
  return await Job.find({ recruiter: recruiterId, status: "active" }).populate(
    "recruiter",
    "name email"
  );
};

const getArchivedJobs = async (recruiterId) => {
  return await Job.find({
    recruiter: recruiterId,
    status: "archived",
  }).populate("recruiter", "name email");
};

const getAvailableJobs = async () => {
  return await Job.find({ status: "active" }).populate(
    "recruiter",
    "name email"
  );
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

const Application = require("../models/Application");
const Job = require("../models/Job");
const AppError = require("../utils/AppError");

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

const getMyApplications = async (candidateId) => {
  return await Application.find({ candidate: candidateId }).populate("job");
};

const getApplicationsForJob = async (jobId, recruiterId) => {
  const job = await Job.findById(jobId);

  if (!job) {
    throw new AppError("Job not found", 404);
}
  if (job && job.recruiter.toString() !== recruiterId) {
    throw new AppError("Access denied", 403);
  }

  return await Application.find({ job: jobId }).populate("candidate");
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

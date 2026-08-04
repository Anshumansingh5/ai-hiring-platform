const Job = require("../models/Job");

const createJob = async (jobData) => {
  return await Job.create(jobData);
};

const getAllJobs = async (recruiterId) => {
  return await Job.find({ recruiter: recruiterId }).populate(
    "recruiter",
    "name email"
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
  getJobById,
  updateJob,
  deleteJob,
};

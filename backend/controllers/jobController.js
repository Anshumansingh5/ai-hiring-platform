const jobService = require("../services/jobService");
const Job = require("../models/Job");
const AppError = require("../utils/AppError");

const createJob = async (req, res, next) => {
  try {
    const job = await jobService.createJob({
      ...req.body,
      recruiter: req.user.id,
    });

    return res.status(201).json({
      success: true,
      message: "Job created successfully",
      data: job,
    });
  } catch (error) {
    next(error);
  }
};

const getAllJobs = async (req, res, next) => {
  try {
    const jobs = await jobService.getAllJobs(req.user.id);

    return res.json({
      success: true,
      data: jobs,
    });
  } catch (error) {
    next(error);
  }
};

const getJobById = async (req, res, next) => {
  try {
    const job = await jobService.getJobById(req.params.id);

    if (!job) {
      return next(new AppError("Job not found", 404));
    }

    return res.json({
      success: true,
      data: job,
    });
  } catch (error) {
    next(error);
  }
};

const updateJob = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return next(new AppError("Job not found", 404));
    }

    if (
      job.recruiter.toString() !== req.user.id &&
      req.user.role !== "admin"
    ) {
      return next(new AppError("Access denied", 403));
    }

    const updatedJob = await jobService.updateJob(req.params.id, req.body);

    return res.json({
      success: true,
      message: "Job updated successfully",
      data: updatedJob,
    });
  } catch (error) {
    next(error);
  }
};

const deleteJob = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return next(new AppError("Job not found", 404));
    }

    if (
      job.recruiter.toString() !== req.user.id &&
      req.user.role !== "admin"
    ) {
      return next(new AppError("Access denied", 403));
    }

    await jobService.deleteJob(req.params.id);

    return res.json({
      success: true,
      message: "Job deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createJob,
  getAllJobs,
  getJobById,
  updateJob,
  deleteJob,
};

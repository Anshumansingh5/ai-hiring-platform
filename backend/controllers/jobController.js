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

const getAvailableJobs = async (req, res, next) => {
  try {
    const jobs = await jobService.getAvailableJobs();

    return res.json({
      success: true,
      data: jobs,
    });
  } catch (error) {
    next(error);
  }
};

const getArchivedJobs = async (req, res, next) => {
  try {
    const jobs = await jobService.getArchivedJobs(req.user.id);

    return res.json({
      success: true,
      data: jobs,
    });
  } catch (error) {
    next(error);
  }
};

const archiveJob = async (req, res, next) => {
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

    const updatedJob = await jobService.archiveJob(req.params.id);

    return res.json({
      success: true,
      message: "Job archived successfully",
      data: updatedJob,
    });
  } catch (error) {
    next(error);
  }
};

const restoreJob = async (req, res, next) => {
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

    const updatedJob = await jobService.restoreJob(req.params.id);

    return res.json({
      success: true,
      message: "Job restored successfully",
      data: updatedJob,
    });
  } catch (error) {
    next(error);
  }
};

const permanentlyDeleteJob = async (req, res, next) => {
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

    if (job.status !== "archived") {
      return next(
        new AppError("Only archived jobs can be permanently deleted", 400)
      );
    }

    const updatedJob = await jobService.permanentlyDeleteJob(req.params.id);

    return res.json({
      success: true,
      message: "Job permanently deleted",
      data: updatedJob,
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
  getArchivedJobs,
  getAvailableJobs,
  archiveJob,
  restoreJob,
  permanentlyDeleteJob,
  getJobById,
  updateJob,
  deleteJob,
};

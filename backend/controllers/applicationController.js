const applicationService = require("../services/applicationService");

const applyJob = async (req, res, next) => {
  try {
    const application = await applicationService.applyJob(
      req.user.id,
      req.body.jobId
    );

    return res.status(201).json({
      success: true,
      data: application,
    });
  } catch (error) {
    next(error);
  }
};

const getMyApplications = async (req, res, next) => {
  try {
    const applications = await applicationService.getMyApplications(req.user.id);

    return res.json({
      success: true,
      data: applications,
    });
  } catch (error) {
    next(error);
  }
};

const getApplicationsForJob = async (req, res, next) => {
  try {
    const applications =
      await applicationService.getApplicationsForJob(
        req.params.jobId,
        req.user.id
      );

    return res.json({
      success: true,
      data: applications,
    });
  } catch (error) {
    next(error);
  }
};

const updateApplicationStatus = async (req, res, next) => {
  try {
    const application =
      await applicationService.updateApplicationStatus(
        req.params.id,
        req.body.status,
        req.user.id
      );

    return res.json({
      success: true,
      data: application,
    });
  } catch (error) {
    next(error);
  }
};

const deleteApplication = async (req, res, next) => {
  try {
    await applicationService.deleteApplication(req.params.id, req.user.id);

    return res.json({
      success: true,
      message: "Application deleted",
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  applyJob,
  getMyApplications,
  getApplicationsForJob,
  updateApplicationStatus,
  deleteApplication,
};

const express = require("express");

const router = express.Router();

const applicationController = require("../controllers/applicationController");
const authMiddleware = require("../middleware/authMiddleware");
const authorize = require("../middleware/authorize");
const validateRequest = require("../middleware/validateRequest");
const {
  updateApplicationStatusValidator,
} = require("../validators/applicationValidator");

router.post(
  "/",
  authMiddleware,
  authorize("candidate"),
  applicationController.applyJob
);

router.get(
  "/my",
  authMiddleware,
  authorize("candidate"),
  applicationController.getMyApplications
);

router.get(
  "/job/:jobId",
  authMiddleware,
  authorize("recruiter"),
  applicationController.getApplicationsForJob
);

router.put(
  "/:id/status",
  authMiddleware,
  authorize("recruiter"),
  updateApplicationStatusValidator,
  validateRequest,
  applicationController.updateApplicationStatus
);

router.delete(
  "/:id",
  authMiddleware,
  authorize("candidate"),
  applicationController.deleteApplication
);

module.exports = router;

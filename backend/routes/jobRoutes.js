const express = require("express");

const router = express.Router();

const jobController = require("../controllers/jobController");

const authenticate = require("../middleware/authMiddleware");
const authorize = require("../middleware/authorize");
const validateRequest = require("../middleware/validateRequest");
const { createJobValidator } = require("../validators/jobValidator");

router.post(
  "/",
  authenticate,
  authorize("recruiter", "admin"),
  createJobValidator,
  validateRequest,
  jobController.createJob
);

router.get(
  "/",
  authenticate,
  authorize("recruiter", "admin"),
  jobController.getAllJobs
);

router.get(
  "/all",
  authenticate,
  authorize("candidate"),
  jobController.getAvailableJobs
);

router.get(
  "/archived",
  authenticate,
  authorize("recruiter", "admin"),
  jobController.getArchivedJobs
);

router.get("/:id", jobController.getJobById);

router.patch(
  "/:id/archive",
  authenticate,
  authorize("recruiter", "admin"),
  jobController.archiveJob
);

router.patch(
  "/:id/restore",
  authenticate,
  authorize("recruiter", "admin"),
  jobController.restoreJob
);

router.delete(
  "/:id/permanent",
  authenticate,
  authorize("recruiter", "admin"),
  jobController.permanentlyDeleteJob
);

router.put(
  "/:id",
  authenticate,
  authorize("recruiter", "admin"),
  jobController.updateJob
);

router.delete(
  "/:id",
  authenticate,
  authorize("recruiter", "admin"),
  jobController.deleteJob
);

module.exports = router;

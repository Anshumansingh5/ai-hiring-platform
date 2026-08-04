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

router.get("/:id", jobController.getJobById);

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

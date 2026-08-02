const { body } = require("express-validator");

const updateApplicationStatusValidator = [
  body("status")
    .isIn(["applied",
  "shortlisted",
  "interview",
  "selected",
  "rejected",])
    .withMessage(
      "Status must be one of: applied, shortlisted, Interview, selected, rejected"
    ),
];

module.exports = { updateApplicationStatusValidator };

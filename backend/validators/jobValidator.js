const { body } = require("express-validator");

const createJobValidator = [
  body("title").trim().notEmpty().withMessage("Title is required"),
  body("company").trim().notEmpty().withMessage("Company is required"),
  body("location").trim().notEmpty().withMessage("Location is required"),
];

module.exports = { createJobValidator };

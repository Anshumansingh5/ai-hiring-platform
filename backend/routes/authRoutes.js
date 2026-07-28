const express = require("express");
const { login } = require("../controllers/authController");

const router = express.Router();

// POST /login — delegates to authController.login
router.post("/login", login);

module.exports = router;

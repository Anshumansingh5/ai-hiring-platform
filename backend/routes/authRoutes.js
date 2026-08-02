const express = require("express");
const authController = require("../controllers/authController");
const authenticate = require("../middleware/authMiddleware");
const router = express.Router();
const authorize = require("../middleware/authorize");

// POST /login — delegates to authController.login
router.post("/login", authController.login);
router.post("/register", authController.register);

router.get("/profile", authenticate, (req, res) => {
    return res.json({
      success: true,
      user: req.user,
    });
});

router.get("/admin", authenticate, authorize("admin"), (req, res) => {
      res.json({
        success: true,
        message: "Welcome Admin",
      });
    }
);

module.exports = router;

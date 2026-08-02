const express = require("express");
const authController = require("../controllers/authController");
const authenticate = require("../middleware/authMiddleware");
const router = express.Router();
const authorize = require("../middleware/authorize");
const validateRequest = require("../middleware/validateRequest");
const {
  registerValidator,
  loginValidator,
} = require("../validators/authValidator");

// POST /login — delegates to authController.login
router.post("/login", loginValidator, validateRequest, authController.login);
router.post(
  "/register",
  registerValidator,
  validateRequest,
  authController.register
);

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

const authService = require("../services/authService");

// Login handler — connects the HTTP request and response to the auth service.
const login = (req, res) => {
  // Extract email and password sent by the client in the request body
  const { email, password } = req.body;

  if (authService.login(email, password)) {
    // Credentials match — return success response
    return res.status(200).json({
      success: true,
      message: "Login successful",
    });
  }

  // Credentials do not match — return failure response (same message for both wrong email and wrong password)
  return res.status(401).json({
    success: false,
    message: "Invalid email or password",
  });
};

module.exports = { login };

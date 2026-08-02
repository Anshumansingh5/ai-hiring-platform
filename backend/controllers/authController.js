const authService = require("../services/authService");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const AppError = require("../utils/AppError");

// Login handler
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await authService.login(email);

    if (!user) {
      return next(new AppError("Invalid email or password", 401));
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return next(new AppError("Invalid email or password", 401));
    }

    const token = jwt.sign(
      {
        id: user._id,
        role: user.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );

    return res.status(200).json({
      success: true,
      message: "Login successful",
      token,
    });
  } catch (error) {
    next(error);
  }
};

// Register handler
const register = async (req, res, next) => {
  try {
    const user = await authService.registerUser(req.body);

    const userResponse = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    };

    return res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: userResponse,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  login,
  register,
};
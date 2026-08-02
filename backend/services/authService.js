
const User = require("../models/User");
const bcrypt = require("bcrypt");
// Temporary credentials. This can later be replaced by a database lookup.
// const HARDCODED_USER = {
//   email: "admin@test.com",
//   password: "123456",
// };
// Contains the authentication decision without HTTP-specific code.
const login = async (email) => {
  const user = await User.findOne({ email });
  return user;
  // if (!user) {
  //   return false;
  // }

  // return user.password === password;
};

const registerUser = async (userData) => {
  const hashedPassword = await bcrypt.hash(userData.password, 10);
  userData.password = hashedPassword;
  const user = await User.create(userData);
  // return {id: user._id,
  //   name: user.name,
  //   email: user.email,
  //   role: user.role};

const userObject = user.toObject();

delete userObject.password;

return userObject;

};

module.exports = {
  login,
  registerUser
};
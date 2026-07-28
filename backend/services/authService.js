// Temporary credentials. This can later be replaced by a database lookup.
const HARDCODED_USER = {
  email: "admin@test.com",
  password: "123456",
};

// Contains the authentication decision without HTTP-specific code.
const login = (email, password) => {
  return (
    email === HARDCODED_USER.email && password === HARDCODED_USER.password
  );
};

module.exports = { login };

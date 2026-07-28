// Import Express — the web framework used to create the HTTP server and define routes
const express = require("express");
// Import CORS — allows the frontend (running on a different port) to call this API
const cors = require("cors");
const authRoutes = require("./routes/authRoutes");

// Create the Express application instance
const app = express();
// Port the server listens on; 5000 keeps it separate from the Next.js frontend on 3000
const PORT = 5000;

// Enable CORS for all routes so browser requests from the React app are not blocked
app.use(cors());
// Parse incoming JSON request bodies (e.g. { "email": "...", "password": "..." })
app.use(express.json());

// Health check — confirms the backend is up and responding
app.get("/health", (req, res) => {
  res.json({ status: "Backend Running" });
});

// Mount authentication routes (POST /login, etc.)
app.use(authRoutes);

// Start the server and listen for incoming HTTP requests
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

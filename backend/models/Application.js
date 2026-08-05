const mongoose = require("mongoose");

// Lightweight copy of the job's display fields, stored on the application
// so the candidate can still see what they applied for after the original
// Job document has been permanently removed.
const jobSnapshotSchema = new mongoose.Schema(
  {
    title: { type: String },
    company: { type: String },
    location: { type: String },
  },
  { _id: false }
);

const applicationSchema = new mongoose.Schema(
  {
    candidate: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Job",
      required: true,
    },

    status: {
      type: String,
      enum: [
        "applied",
        "shortlisted",
        "interview",
        "selected",
        "rejected",
      ],
      default: "applied",
    },

    rejectionReason: {
      type: String,
      default: null,
    },

    jobSnapshot: {
      type: jobSnapshotSchema,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Application", applicationSchema);
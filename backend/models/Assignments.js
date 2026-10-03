import mongoose from "mongoose";

const collegeAssignmentSchema = new mongoose.Schema({
  studentEmail: {
    type: String,
    required: true,
    trim: true,
  },

  topic: {
    type: String,
    required: true,
    trim: true,
  },

  description: {
    type: String,
    default: "", // optional
    trim: true,
  },

  lastDate: {
    type: Date,
    required: true,
  },

  status: {
    type: String,
    enum: ["pending", "completed"],
    default: "pending",
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Model
const CollegeAssignment = mongoose.model(
  "CollegeAssignment",
  collegeAssignmentSchema
);

export default CollegeAssignment;
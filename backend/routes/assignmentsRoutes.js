import express from "express";
import {
  createAssignment,
  getAssignments,
  deleteAssignment,
  updateAssignment,
  getAssignmentStats,
} from "../controllers/assignControllers.js";

const assignmentRouter = express.Router();

assignmentRouter.post("/create", createAssignment);
assignmentRouter.get("/:email", getAssignments);
assignmentRouter.delete("/:id", deleteAssignment);
assignmentRouter.put("/:id", updateAssignment);
assignmentRouter.get("/stats/:studentEmail", getAssignmentStats)

export default assignmentRouter;
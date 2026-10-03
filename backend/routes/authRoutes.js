import express from "express";
import { deleteUser, getMe, loginUser, registerUser, updateUser } from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";


const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/me", protect, getMe);
router.patch("/update/:id", updateUser);
router.delete("/:id", deleteUser);

export default router;
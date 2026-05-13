import express from "express";
import {
  createComplaint,
  getMyComplaints,
  getComplaintById,
  getMyPendingComplaints,
  updateComplaint,
  deleteComplaint,
  getDepartments,
} from "../controllers/complaint.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { uploadSingle } from "../middleware/upload.middleware.js";

const router = express.Router();

// Public route - no auth required
router.get("/departments", getDepartments);

router.post("/", authMiddleware, uploadSingle, createComplaint);
router.get("/me/pending", authMiddleware, getMyPendingComplaints);
router.get("/me", authMiddleware, getMyComplaints);
router.get("/:id", authMiddleware, getComplaintById);
router.put("/:id", authMiddleware, uploadSingle, updateComplaint);
router.delete("/:id", authMiddleware, deleteComplaint);

export default router;

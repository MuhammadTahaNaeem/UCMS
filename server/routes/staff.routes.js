import express from "express";
import {
  getAssignedComplaints,
  getAssignedComplaintDetail,
  startWork,
  completeComplaint,
  uploadProof,
  getDashboard,
} from "../controllers/staff.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { requireRole } from "../middleware/role.middleware.js";
import { uploadSingle } from "../middleware/upload.middleware.js";

const router = express.Router();

router.use(authMiddleware, requireRole("Staff"));

router.get("/dashboard", getDashboard);
router.get("/assigned", getAssignedComplaints);
router.get("/assigned/:id", getAssignedComplaintDetail);
router.post("/assigned/:id/start", startWork);
router.post("/assigned/:id/complete", completeComplaint);
router.post("/assigned/:id/proof", uploadSingle, uploadProof);

export default router;

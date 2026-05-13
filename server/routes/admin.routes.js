import express from "express";
import {
  getAllComplaints,
  getPendingQueue,
  getComplaintDetail,
  approveComplaint,
  rejectComplaint,
  assignComplaint,
  getStaff,
  createStaff,
  updateStaff,
  deleteStaff,
  toggleStaffStatus,
  getDepartments,
  createDepartment,
  getAnalytics,
  getDashboard,
} from "../controllers/admin.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { requireRole } from "../middleware/role.middleware.js";

const router = express.Router();

router.use(authMiddleware, requireRole("Admin"));

router.get("/dashboard", getDashboard);
router.get("/complaints", getAllComplaints);
router.get("/complaints/pending", getPendingQueue);
router.get("/complaints/:id", getComplaintDetail);
router.post("/complaints/:id/approve", approveComplaint);
router.post("/complaints/:id/reject", rejectComplaint);
router.post("/complaints/:id/assign", assignComplaint);

router.get("/staff", getStaff);
router.post("/staff", createStaff);
router.put("/staff/:id", updateStaff);
router.delete("/staff/:id", deleteStaff);
router.post("/staff/:id/toggle", toggleStaffStatus);

router.get("/departments", getDepartments);
router.post("/departments", createDepartment);

router.get("/analytics", getAnalytics);

export default router;

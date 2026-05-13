import express from "express";
import {
  getUserProfile,
  updateUserProfile,
  getUserDashboard,
  getUserNotifications,
  markNotificationRead,
} from "../controllers/user.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";

const router = express.Router();

router.use(authMiddleware);

router.get("/profile", getUserProfile);
router.put("/profile", updateUserProfile);
router.get("/dashboard", getUserDashboard);
router.get("/notifications", getUserNotifications);
router.patch("/notifications/:id/read", markNotificationRead);

export default router;

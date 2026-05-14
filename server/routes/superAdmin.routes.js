import express from "express";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { requireRole } from "../middleware/role.middleware.js";
import { uploadSingle } from "../middleware/upload.middleware.js";
import superAdminController from "../controllers/superAdmin.controller.js";

const router = express.Router();

router.use(authMiddleware, requireRole("SuperAdmin"));

router.get("/admins", superAdminController.getAllAdmins);
router.get("/activity", superAdminController.getGlobalActivity);
router.post("/promote", superAdminController.promoteToAdmin);
router.post("/departments", superAdminController.createDepartment);
router.post("/department-admins", superAdminController.createDepartmentAdmin);
router.get("/settings", superAdminController.getSettings);
router.post("/settings/logo", uploadSingle, superAdminController.uploadLogo);
router.put("/settings", superAdminController.updateSystemSettings);

export default router;

import express from "express";
import asyncHandler from "../utils/asyncHandler.js";
import Settings from "../models/Settings.model.js";
import { successResponse } from "../utils/apiResponse.js";

const router = express.Router();

// Public route - no auth required
router.get("/settings", asyncHandler(async (req, res) => {
  let settings = await Settings.findOne();
  if (!settings) {
    settings = await Settings.create({ systemName: "University Complaint Management System" });
  }
  return successResponse(res, 200, "System settings", settings);
}));

export default router;

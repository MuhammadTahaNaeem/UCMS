import asyncHandler from "../utils/asyncHandler.js";
import User from "../models/User.model.js";
import Complaint from "../models/Complaint.model.js";
import Notification from "../models/Notification.model.js";
import { successResponse, errorResponse } from "../utils/apiResponse.js";

export const getUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select("-password");
  if (!user) return errorResponse(res, 404, "User not found");
  return successResponse(res, 200, "User profile fetched", user);
});

export const updateUserProfile = asyncHandler(async (req, res) => {
  const { fullName, phone } = req.body;
  const user = await User.findById(req.user._id);
  if (!user) return errorResponse(res, 404, "User not found");

  if (fullName) user.fullName = fullName;
  if (phone) user.phone = phone;

  await user.save();
  const updated = await User.findById(req.user._id).select("-password");
  return successResponse(res, 200, "Profile updated", updated);
});

export const getUserDashboard = asyncHandler(async (req, res) => {
  const complaints = await Complaint.find({ submittedBy: req.user._id });

  const stats = {
    total: complaints.length,
    pending: complaints.filter(c => c.status === "pending").length,
    inProgress: complaints.filter(c => c.status === "in_progress").length,
    resolved: complaints.filter(c => c.status === "resolved").length,
  };

  return successResponse(res, 200, "Dashboard stats", stats);
});

export const getUserNotifications = asyncHandler(async (req, res) => {
  const notifications = await Notification.find({ recipient: req.user._id })
    .sort({ createdAt: -1 })
    .limit(100)
    .populate("sender", "fullName email")
    .populate("complaintId", "complaintId title status");

  return successResponse(res, 200, "Notifications fetched", notifications);
});

export const markNotificationRead = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const notification = await Notification.findOne({ _id: id, recipient: req.user._id });
  if (!notification) return errorResponse(res, 404, "Notification not found");

  notification.isRead = true;
  await notification.save();

  return successResponse(res, 200, "Notification marked as read", notification);
});

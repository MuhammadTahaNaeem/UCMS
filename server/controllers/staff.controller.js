import asyncHandler from "../utils/asyncHandler.js";
import Complaint from "../models/Complaint.model.js";
import Notification from "../models/Notification.model.js";
import { uploadBufferToCloudinary } from "../middleware/upload.middleware.js";
import { successResponse, errorResponse } from "../utils/apiResponse.js";
import { getIO } from "../socket/socket.js";

export const getAssignedComplaints = asyncHandler(async (req, res) => {
  const complaints = await Complaint.find({ assignedTo: req.user._id }).populate("department submittedBy assignedBy").sort({ createdAt: -1 });
  return successResponse(res, 200, "Assigned complaints", complaints);
});

export const getAssignedComplaintDetail = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const complaint = await Complaint.findById(id).populate("department submittedBy assignedBy assignedTo proof");
  if (!complaint) return errorResponse(res, 404, "Complaint not found");
  const assignedToId = complaint.assignedTo?._id?.toString?.() || complaint.assignedTo?.toString?.();
  if (!assignedToId || assignedToId !== req.user._id.toString()) return errorResponse(res, 403, "Forbidden");
  return successResponse(res, 200, "Complaint detail", complaint);
});

export const startWork = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const complaint = await Complaint.findById(id);
  if (!complaint) return errorResponse(res, 404, "Complaint not found");
  const assignedToId = complaint.assignedTo?.toString?.();
  if (!assignedToId || assignedToId !== req.user._id.toString()) return errorResponse(res, 403, "Forbidden");
  complaint.status = "in_progress";
  complaint.inProgressAt = Date.now();
  complaint.timeline.push({ action: "in_progress", performedBy: req.user._id, note: "Work started" });
  await complaint.save();

  await Notification.create({ recipient: complaint.submittedBy, sender: req.user._id, type: "complaint_in_progress", title: "Work started", message: `Work started on ${complaint.complaintId}` , complaintId: complaint._id });
  const io = getIO();
  if (io) io.to(complaint.submittedBy.toString()).emit("complaint:updated", { complaintId: complaint._id, status: "in_progress" });

  return successResponse(res, 200, "Work started", complaint);
});

export const completeComplaint = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const complaint = await Complaint.findById(id);
  if (!complaint) return errorResponse(res, 404, "Complaint not found");
  const assignedToId = complaint.assignedTo?.toString?.();
  if (!assignedToId || assignedToId !== req.user._id.toString()) return errorResponse(res, 403, "Forbidden");
  if (complaint.status !== "in_progress") return errorResponse(res, 400, "Complaint must be in progress before it can be resolved");
  complaint.status = "resolved";
  complaint.resolvedAt = Date.now();
  complaint.timeline.push({ action: "resolved", performedBy: req.user._id, note: "Work resolved" });
  await complaint.save();

  await Notification.create({ recipient: complaint.submittedBy, sender: req.user._id, type: "complaint_resolved", title: "Complaint resolved", message: `Your complaint ${complaint.complaintId} has been resolved.`, complaintId: complaint._id });
  const io = getIO();
  if (io) io.to(complaint.submittedBy.toString()).emit("complaint:resolved", { complaintId: complaint._id });

  return successResponse(res, 200, "Complaint marked resolved", complaint);
});

export const uploadProof = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const complaint = await Complaint.findById(id);
  if (!complaint) return errorResponse(res, 404, "Complaint not found");
  const assignedToId = complaint.assignedTo?.toString?.();
  if (!assignedToId || assignedToId !== req.user._id.toString()) return errorResponse(res, 403, "Forbidden");

  if (!req.file || !req.file.buffer) return errorResponse(res, 400, "File required");
  const result = await uploadBufferToCloudinary(req.file.buffer, `ucms/complaints/proof`, req.file.originalname, req.file.mimetype);
  complaint.proof.push({ public_id: result.public_id, url: result.secure_url, originalName: req.file.originalname, description: req.body.description || "" });
  complaint.timeline.push({ action: "proof_submitted", performedBy: req.user._id, note: req.body.description || "Proof submitted" });
  await complaint.save();

  await Notification.create({ recipient: complaint.submittedBy, sender: req.user._id, type: "proof_submitted", title: "Proof submitted", message: `Proof submitted for ${complaint.complaintId}`, complaintId: complaint._id });
  const io = getIO();
  if (io) io.to(complaint.submittedBy.toString()).emit("complaint:updated", { complaintId: complaint._id });

  return successResponse(res, 200, "Proof uploaded", complaint);
});

export const getDashboard = asyncHandler(async (req, res) => {
  const total = await Complaint.countDocuments({ assignedTo: req.user._id });
  const pending = await Complaint.countDocuments({ assignedTo: req.user._id, status: "approved" });
  const inProgress = await Complaint.countDocuments({ assignedTo: req.user._id, status: "in_progress" });
  const resolved = await Complaint.countDocuments({ assignedTo: req.user._id, status: "resolved" });

  return successResponse(res, 200, "Staff dashboard stats", {
    total,
    pending,
    inProgress,
    resolved,
  });
});

import asyncHandler from "../utils/asyncHandler.js";
import Complaint from "../models/Complaint.model.js";
import Department from "../models/Department.model.js";
import Notification from "../models/Notification.model.js";
import { uploadBufferToCloudinary } from "../middleware/upload.middleware.js";
import { successResponse, errorResponse } from "../utils/apiResponse.js";
import User from "../models/User.model.js";
import { getIO } from "../socket/socket.js";

const resolveDepartmentInput = async (departmentInput) => {
  if (!departmentInput) return null;

  if (departmentInput.match?.(/^[0-9a-fA-F]{24}$/)) {
    return Department.findById(departmentInput);
  }

  return Department.findOne({ name: departmentInput });
};

export const createComplaint = asyncHandler(async (req, res) => {
  // Only users can create complaints
  if (req.user.role !== "User") return errorResponse(res, 403, "Only users can create complaints");
  
  const { title, description, department } = req.body;
  if (!title || !description || !department) return errorResponse(res, 400, "Missing required fields");

  const dept = await resolveDepartmentInput(department);
  if (!dept) return errorResponse(res, 400, "Invalid department selected");

  const complaint = new Complaint({ title, description, department: dept._id, submittedBy: req.user._id });

  // Handle file upload
  if (req.file && req.file.buffer) {
    const result = await uploadBufferToCloudinary(req.file.buffer, `ucms/complaints`, req.file.originalname, req.file.mimetype);
    complaint.attachments.push({ public_id: result.public_id, url: result.secure_url, originalName: req.file.originalname, fileType: req.file.mimetype });
  }

  complaint.timeline.push({ action: "submitted", performedBy: req.user._id, note: "Complaint submitted" });
  await complaint.save();

  // Create notifications for department admins only
  const adminUsers = await User.find({ role: "Admin", isActive: true, department: dept._id }).select("_id");
  let createdNotifs = [];
  if (adminUsers.length > 0) {
    const docs = adminUsers.map((adminUser) => ({
      recipient: adminUser._id,
      sender: req.user._id,
      type: "complaint_submitted",
      title: "New complaint submitted",
      message: `${req.user.fullName} submitted a complaint: ${complaint.title}`,
      complaintId: complaint._id,
    }));
    createdNotifs = await Notification.insertMany(docs);
  }

  const io = getIO();
  if (io) {
    // Emit to department room so only relevant admins get the realtime alert
    io.to(`department_${dept._id.toString()}`).emit("complaint:new", { complaintId: complaint._id, title: complaint.title });

    // Emit per-notification to recipients
    if (createdNotifs.length > 0) {
      createdNotifs.forEach((n) => {
        io.to(n.recipient.toString()).emit("notification:new", { title: n.title, message: n.message });
      });
    }

    // Also notify SuperAdmins via super-room
    io.to("super-room").emit("complaint:new", { complaintId: complaint._id, title: complaint.title });
  }

  return successResponse(res, 201, "Complaint created", complaint);
});

export const getMyComplaints = asyncHandler(async (req, res) => {
  const complaints = await Complaint.find({ submittedBy: req.user._id }).populate("department assignedTo assignedBy").sort({ createdAt: -1 });
  return successResponse(res, 200, "User complaints fetched", complaints);
});

export const getComplaintById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const complaint = await Complaint.findById(id).populate("department assignedTo assignedBy submittedBy");
  if (!complaint) return errorResponse(res, 404, "Complaint not found");
  
  // Authorization checks based on role
  if (req.user.role === "User") {
    // Users can only view their own complaints
    if (complaint.submittedBy._id.toString() !== req.user._id.toString()) {
      return errorResponse(res, 403, "Forbidden");
    }
  } else if (req.user.role === "Staff") {
    // Staff can only view complaints assigned to them
    if (!complaint.assignedTo || complaint.assignedTo._id.toString() !== req.user._id.toString()) {
      return errorResponse(res, 403, "Forbidden");
    }
  }
  // Admins are restricted to their department unless SuperAdmin
  if (req.user.role === "Admin") {
    if (!req.user.department) return errorResponse(res, 403, "Admin user has no department assigned");
    if (complaint.department._id.toString() !== req.user.department.toString()) return errorResponse(res, 403, "Forbidden");
  }
  
  return successResponse(res, 200, "Complaint fetched", complaint);
});

export const updateComplaint = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const complaint = await Complaint.findById(id);
  if (!complaint) return errorResponse(res, 404, "Complaint not found");
  if (complaint.status !== "pending") return errorResponse(res, 400, "Only pending complaints can be updated");
  if (complaint.submittedBy.toString() !== req.user._id.toString()) return errorResponse(res, 403, "Forbidden");

  const { title, description, department } = req.body;
  if (title) complaint.title = title;
  if (description) complaint.description = description;
  if (department) {
    const dept = await resolveDepartmentInput(department);
    if (!dept) return errorResponse(res, 400, "Invalid department selected");
    complaint.department = dept._id;
  }

  if (req.file && req.file.buffer) {
    const result = await uploadBufferToCloudinary(req.file.buffer, `ucms/complaints`, req.file.originalname, req.file.mimetype);
    complaint.attachments.push({ public_id: result.public_id, url: result.secure_url, originalName: req.file.originalname, fileType: req.file.mimetype });
  }

  complaint.timeline.push({ action: "updated", performedBy: req.user._id, note: "Complaint updated by owner" });
  await complaint.save();

  return successResponse(res, 200, "Complaint updated", complaint);
});

export const deleteComplaint = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const complaint = await Complaint.findById(id);
  if (!complaint) return errorResponse(res, 404, "Complaint not found");
  if (complaint.status !== "pending") return errorResponse(res, 400, "Only pending complaints can be deleted");
  if (complaint.submittedBy.toString() !== req.user._id.toString()) return errorResponse(res, 403, "Forbidden");

  await complaint.remove();
  return successResponse(res, 200, "Complaint deleted");
});

export const getDepartments = asyncHandler(async (req, res) => {
  const departments = await Department.find().select("_id name code");
  return successResponse(res, 200, "Departments", departments);
});

export const getMyPendingComplaints = asyncHandler(async (req, res) => {
  const complaints = await Complaint.find({ submittedBy: req.user._id, status: "pending" })
    .populate("department assignedTo assignedBy")
    .sort({ createdAt: -1 });
  return successResponse(res, 200, "Pending complaints fetched", complaints);
});

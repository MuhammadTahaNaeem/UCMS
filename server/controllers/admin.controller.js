import asyncHandler from "../utils/asyncHandler.js";
import Complaint from "../models/Complaint.model.js";
import User from "../models/User.model.js";
import Department from "../models/Department.model.js";
import Notification from "../models/Notification.model.js";
import { successResponse, errorResponse } from "../utils/apiResponse.js";
import { getIO } from "../socket/socket.js";

const staffEmailPattern = /^[^\s@]+@ntu\.edu\.pk$/i;
const strongPasswordPattern = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/;

const isStaffEmail = (email) => staffEmailPattern.test(String(email || "").trim());
const isStrongPassword = (password) => strongPasswordPattern.test(String(password || ""));

export const getAllComplaints = asyncHandler(async (req, res) => {
  let query = {};
  // If the user is an Admin (not SuperAdmin), restrict to their department
  if (req.user.role === "Admin") {
    if (!req.user.department) return errorResponse(res, 403, "Admin user has no department assigned");
    query.department = req.user.department;
  }
  const complaints = await Complaint.find(query).populate("department submittedBy assignedTo assignedBy").sort({ createdAt: -1 });
  return successResponse(res, 200, "All complaints", complaints);
});

export const getPendingQueue = asyncHandler(async (req, res) => {
  let query = { status: "pending" };
  if (req.user.role === "Admin") {
    if (!req.user.department) return errorResponse(res, 403, "Admin user has no department assigned");
    query.department = req.user.department;
  }
  const complaints = await Complaint.find(query).populate("department submittedBy").sort({ createdAt: -1 });
  return successResponse(res, 200, "Pending complaints", complaints);
});

export const getComplaintDetail = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const complaint = await Complaint.findById(id).populate("department submittedBy assignedTo assignedBy timeline.performedBy");
  if (!complaint) return errorResponse(res, 404, "Complaint not found");
  // Departmental admin restriction
  if (req.user.role === "Admin") {
    if (!req.user.department) return errorResponse(res, 403, "Admin user has no department assigned");
    if (complaint.department._id.toString() !== req.user.department.toString()) return errorResponse(res, 403, "Forbidden");
  }
  return successResponse(res, 200, "Complaint detail", complaint);
});

export const approveComplaint = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const complaint = await Complaint.findById(id);
  if (!complaint) return errorResponse(res, 404, "Complaint not found");
  if (complaint.status !== "pending") {
    return errorResponse(res, 400, "Only pending complaints can be approved");
  }
  // Departmental scoping: Admins can only approve complaints in their department
  if (req.user.role === "Admin") {
    if (!req.user.department) return errorResponse(res, 403, "Admin user has no department assigned");
    if (complaint.department.toString() !== req.user.department.toString()) return errorResponse(res, 403, "Forbidden");
  }
  complaint.status = "approved";
  complaint.timeline.push({ action: "approved", performedBy: req.user._id, note: "Approved by admin" });

  await complaint.save();

  await Notification.create({ recipient: complaint.submittedBy, sender: req.user._id, type: "complaint_approved", title: "Complaint approved", message: `Your complaint ${complaint.complaintId} has been approved.`, complaintId: complaint._id });

  const io = getIO();
  if (io) {
    io.to(complaint.submittedBy.toString()).emit("complaint:approved", { complaintId: complaint._id });
  }

  return successResponse(res, 200, "Complaint approved", complaint);
});

export const rejectComplaint = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { rejectionReason } = req.body;
  if (!rejectionReason) return errorResponse(res, 400, "Rejection reason required");
  const complaint = await Complaint.findById(id);
  if (!complaint) return errorResponse(res, 404, "Complaint not found");
  if (complaint.status !== "pending") {
    return errorResponse(res, 400, "Only pending complaints can be rejected");
  }
  if (req.user.role === "Admin") {
    if (!req.user.department) return errorResponse(res, 403, "Admin user has no department assigned");
    if (complaint.department.toString() !== req.user.department.toString()) return errorResponse(res, 403, "Forbidden");
  }
  complaint.status = "rejected";
  complaint.rejectionReason = rejectionReason;
  complaint.timeline.push({ action: "rejected", performedBy: req.user._id, note: rejectionReason });
  await complaint.save();

  await Notification.create({ recipient: complaint.submittedBy, sender: req.user._id, type: "complaint_rejected", title: "Complaint rejected", message: `Your complaint ${complaint.complaintId} was rejected. Reason: ${rejectionReason}`, complaintId: complaint._id });

  const io = getIO();
  if (io) io.to(complaint.submittedBy.toString()).emit("complaint:rejected", { complaintId: complaint._id, reason: rejectionReason });

  return successResponse(res, 200, "Complaint rejected", complaint);
});

export const assignComplaint = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { staffId } = req.body;
  if (!staffId) return errorResponse(res, 400, "Staff id required");
  const complaint = await Complaint.findById(id);
  if (!complaint) return errorResponse(res, 404, "Complaint not found");
  if (!["approved", "in_progress"].includes(complaint.status)) {
    return errorResponse(res, 400, "Complaint must be approved before assignment");
  }

  // Departmental scoping: Admins can only assign complaints within their department
  if (req.user.role === "Admin") {
    if (!req.user.department) return errorResponse(res, 403, "Admin user has no department assigned");
    if (complaint.department.toString() !== req.user.department.toString()) return errorResponse(res, 403, "Forbidden");
  }

  const staff = await User.findById(staffId);
  if (!staff || staff.role !== "Staff") return errorResponse(res, 400, "Invalid staff user");
  if (!staff.department || staff.department.toString() !== complaint.department.toString()) return errorResponse(res, 400, "Staff does not belong to complaint's department");

  complaint.assignedTo = staff._id;
  complaint.assignedBy = req.user._id;
  complaint.assignedAt = Date.now();
  complaint.timeline.push({ action: "assigned", performedBy: req.user._id, note: `Assigned to ${staff.fullName}` });
  await complaint.save();

  await Notification.create({ recipient: staff._id, sender: req.user._id, type: "complaint_assigned", title: "New assignment", message: `You have been assigned ${complaint.complaintId}`, complaintId: complaint._id });
  await Notification.create({ recipient: complaint.submittedBy, sender: req.user._id, type: "complaint_assigned", title: "Staff assigned", message: `${staff.fullName} assigned to your complaint ${complaint.complaintId}`, complaintId: complaint._id });

  const io = getIO();
  if (io) {
    io.to(staff._id.toString()).emit("complaint:assigned", { complaintId: complaint._id });
    io.to(complaint.submittedBy.toString()).emit("complaint:assigned", { complaintId: complaint._id });
  }

  return successResponse(res, 200, "Complaint assigned", complaint);
});

export const getStaff = asyncHandler(async (req, res) => {
  const query = { role: "Staff" };
  if (req.user.role === "Admin") {
    if (!req.user.department) return errorResponse(res, 403, "Admin user has no department assigned");
    query.department = req.user.department;
  }

  const staff = await User.find(query).select("-password").populate("department");
  return successResponse(res, 200, "Staff list", staff);
});

export const createStaff = asyncHandler(async (req, res) => {
  const { fullName, email, password, department } = req.body;
  if (!fullName || !email || !password) return errorResponse(res, 400, "Missing fields");
  if (!isStaffEmail(email)) return errorResponse(res, 400, "Staff/Admin email must end with @ntu.edu.pk");
  if (!isStrongPassword(password)) return errorResponse(res, 400, "Password must be at least 8 characters and include letters, numbers, and symbols");

  let targetDepartment = department;
  if (req.user.role === "Admin") {
    if (!req.user.department) return errorResponse(res, 403, "Admin user has no department assigned");
    targetDepartment = req.user.department;
  }

  if (!targetDepartment) return errorResponse(res, 400, "Department is required");

  const normalizedEmail = email.trim().toLowerCase();
  const exists = await User.findOne({ email: normalizedEmail });
  if (exists) return errorResponse(res, 409, "Email already exists");

  const staff = await User.create({
    fullName,
    email: normalizedEmail,
    password,
    role: "Staff",
    department: targetDepartment,
    isEmailVerified: true,
  });
  const createdStaff = await User.findById(staff._id).select("-password").populate("department");
  return successResponse(res, 201, "Staff created", createdStaff);
});

export const updateStaff = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const staff = await User.findById(id);
  if (!staff) return errorResponse(res, 404, "Staff not found");
  if (staff.role !== "Staff") return errorResponse(res, 400, "Target user is not staff");

  if (req.user.role === "Admin") {
    if (!req.user.department) return errorResponse(res, 403, "Admin user has no department assigned");
    if (!staff.department || staff.department.toString() !== req.user.department.toString()) {
      return errorResponse(res, 403, "Forbidden");
    }
  }

  const { fullName, email, password, department, isActive } = req.body;
  if (fullName !== undefined) staff.fullName = fullName;
  if (email !== undefined) {
    const normalizedEmail = email.trim().toLowerCase();
    if (!isStaffEmail(normalizedEmail)) return errorResponse(res, 400, "Staff/Admin email must end with @ntu.edu.pk");
    const duplicate = await User.findOne({ email: normalizedEmail, _id: { $ne: staff._id } });
    if (duplicate) return errorResponse(res, 409, "Email already exists");
    staff.email = normalizedEmail;
  }
  if (password) {
    if (!isStrongPassword(password)) return errorResponse(res, 400, "Password must be at least 8 characters and include letters, numbers, and symbols");
    staff.password = password;
  }
  if (department !== undefined && req.user.role !== "Admin") staff.department = department || undefined;
  if (isActive !== undefined) staff.isActive = isActive;

  await staff.save();
  const updated = await User.findById(staff._id).select("-password").populate("department");
  return successResponse(res, 200, "Staff updated", updated);
});

export const deleteStaff = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const staff = await User.findById(id);
  if (!staff) return errorResponse(res, 404, "Staff not found");
  if (staff.role !== "Staff") return errorResponse(res, 400, "Target user is not staff");
  if (req.user.role === "Admin") {
    if (!req.user.department) return errorResponse(res, 403, "Admin user has no department assigned");
    if (!staff.department || staff.department.toString() !== req.user.department.toString()) {
      return errorResponse(res, 403, "Forbidden");
    }
  }
  await staff.deleteOne();
  return successResponse(res, 200, "Staff deleted");
});

export const toggleStaffStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const staff = await User.findById(id);
  if (!staff) return errorResponse(res, 404, "Staff not found");
  if (staff.role !== "Staff") return errorResponse(res, 400, "Target user is not staff");
  if (req.user.role === "Admin") {
    if (!req.user.department) return errorResponse(res, 403, "Admin user has no department assigned");
    if (!staff.department || staff.department.toString() !== req.user.department.toString()) {
      return errorResponse(res, 403, "Forbidden");
    }
  }
  staff.isActive = !staff.isActive;
  await staff.save();
  return successResponse(res, 200, "Staff status toggled", { id: staff._id, isActive: staff.isActive });
});

export const getDepartments = asyncHandler(async (req, res) => {
  const departments = await Department.find();
  return successResponse(res, 200, "Departments", departments);
});

export const createDepartment = asyncHandler(async (req, res) => {
  const { name, description, code } = req.body;
  if (!name || !code) return errorResponse(res, 400, "Missing fields");
  if (req.user.role !== "SuperAdmin") return errorResponse(res, 403, "Only Super Admin can create departments");
  const dept = await Department.create({ name, description, code });
  return successResponse(res, 201, "Department created", dept);
});

export const getAnalytics = asyncHandler(async (req, res) => {
  const total = await Complaint.countDocuments();
  const perStatus = await Complaint.aggregate([
    { $group: { _id: "$status", count: { $sum: 1 } } },
  ]);

  const resolved = perStatus.find((p) => p._id === "resolved")?.count || 0;
  const completionPct = total > 0 ? (resolved / total) * 100 : 0;

  const perDept = await Complaint.aggregate([
    { $group: { _id: "$department", count: { $sum: 1 } } },
    { $lookup: { from: "departments", localField: "_id", foreignField: "_id", as: "dept" } },
    { $unwind: { path: "$dept", preserveNullAndEmptyArrays: true } },
    { $project: { _id: 0, department: "$dept.name", count: 1 } },
  ]);

  const topStaff = await Complaint.aggregate([
    { $match: { status: "resolved", assignedTo: { $exists: true } } },
    { $group: { _id: "$assignedTo", resolved: { $sum: 1 } } },
    { $sort: { resolved: -1 } },
    { $limit: 5 },
    { $lookup: { from: "users", localField: "_id", foreignField: "_id", as: "user" } },
    { $unwind: "$user" },
    { $project: { _id: 0, user: { _id: "$user._id", fullName: "$user.fullName", email: "$user.email" }, resolved: 1 } },
  ]);

  // Monthly trend for last 6 months
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
  sixMonthsAgo.setDate(1);

  const monthly = await Complaint.aggregate([
    { $match: { createdAt: { $gte: sixMonthsAgo } } },
    { $group: { _id: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } }, count: { $sum: 1 } } },
    { $sort: { "_id.year": 1, "_id.month": 1 } },
  ]);

  return successResponse(res, 200, "Analytics", { total, perStatus, completionPct, perDept, topStaff, monthly });
});

export const getDashboard = asyncHandler(async (req, res) => {
  const complaintFilter = req.user.role === "Admin"
    ? (() => {
        if (!req.user.department) return null;
        return { department: req.user.department };
      })()
    : {};

  if (complaintFilter === null) {
    return errorResponse(res, 403, "Admin user has no department assigned");
  }

  const total = await Complaint.countDocuments(complaintFilter);
  const pending = await Complaint.countDocuments({ ...complaintFilter, status: "pending" });
  const approved = await Complaint.countDocuments({ ...complaintFilter, status: "approved" });
  const inProgress = await Complaint.countDocuments({ ...complaintFilter, status: "in_progress" });
  const rejected = await Complaint.countDocuments({ ...complaintFilter, status: "rejected" });
  const resolved = await Complaint.countDocuments({ ...complaintFilter, status: "resolved" });

  return successResponse(res, 200, "Admin dashboard stats", {
    total,
    pending,
    approved,
    inProgress,
    rejected,
    resolved,
  });
});

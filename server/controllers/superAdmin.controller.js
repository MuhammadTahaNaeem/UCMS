import asyncHandler from "../utils/asyncHandler.js";
import User from "../models/User.model.js";
import Complaint from "../models/Complaint.model.js";
import Department from "../models/Department.model.js";
import Settings from "../models/Settings.model.js";
import { successResponse, errorResponse } from "../utils/apiResponse.js";
import { uploadBufferToCloudinary } from "../middleware/upload.middleware.js";

const staffEmailPattern = /^[^\s@]+@ntu\.edu\.pk$/i;
const strongPasswordPattern = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/;

const isStaffEmail = (email) => staffEmailPattern.test(String(email || "").trim());
const isStrongPassword = (password) => strongPasswordPattern.test(String(password || ""));

const buildDepartmentCode = (name) => {
  const base = name
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => word[0])
    .join("")
    .toUpperCase()
    .slice(0, 6);

  return `${base || "DEP"}-${Date.now().toString().slice(-4)}`;
};

const resolveDepartment = async (departmentInput) => {
  if (!departmentInput) return null;
  if (departmentInput.match?.(/^[0-9a-fA-F]{24}$/)) {
    return Department.findById(departmentInput);
  }
  return Department.findOne({ name: departmentInput });
};

export const getAllAdmins = asyncHandler(async (req, res) => {
  const admins = await User.find({ role: "Admin" }).select("-password").populate("department");
  return successResponse(res, 200, "All admins", admins);
});

export const getGlobalActivity = asyncHandler(async (req, res) => {
  // Return recent complaints and their timelines for global oversight
  const { limit = 100 } = req.query;
  const complaints = await Complaint.find().sort({ updatedAt: -1 }).limit(parseInt(limit, 10)).populate("department submittedBy assignedTo timeline.performedBy");
  return successResponse(res, 200, "Global activity", complaints);
});

export const promoteToAdmin = asyncHandler(async (req, res) => {
  const { userId, fullName, email, password, department } = req.body;
  // If userId provided, promote existing user
  if (userId) {
    const user = await User.findById(userId);
    if (!user) return errorResponse(res, 404, "User not found");
    user.role = "Admin";
    if (department !== undefined) user.department = department || undefined;
    await user.save();
    return successResponse(res, 200, "User promoted to Admin", user);
  }

  // Otherwise create a new Admin user
  if (!fullName || !email || !password) return errorResponse(res, 400, "Missing fields");
  const normalizedEmail = email.trim().toLowerCase();
  if (!isStaffEmail(normalizedEmail)) return errorResponse(res, 400, "Staff/Admin email must end with @ntu.edu.pk");
  if (!isStrongPassword(password)) return errorResponse(res, 400, "Password must be at least 8 characters and include letters, numbers, and symbols");
  const exists = await User.findOne({ email: normalizedEmail });
  if (exists) return errorResponse(res, 409, "Email already exists");
  const admin = await User.create({ fullName, email: normalizedEmail, password, role: "Admin", department, isEmailVerified: true });
  return successResponse(res, 201, "Admin created", admin);
});

export const createDepartment = asyncHandler(async (req, res) => {
  const { name, description, code } = req.body;
  if (!name) return errorResponse(res, 400, "Department name is required");

  const trimmedName = name.trim();
  const normalizedCode = (code || buildDepartmentCode(trimmedName)).trim().toUpperCase();

  const existingDepartment = await Department.findOne({
    $or: [{ name: trimmedName }, { code: normalizedCode }],
  });
  if (existingDepartment) return errorResponse(res, 409, "Department already exists");

  const department = await Department.create({
    name: trimmedName,
    description,
    code: normalizedCode,
  });

  return successResponse(res, 201, "Department created", department);
});

export const createDepartmentAdmin = asyncHandler(async (req, res) => {
  const { fullName, email, password, department } = req.body;
  if (!fullName || !email || !password || !department) {
    return errorResponse(res, 400, "fullName, email, password and department are required");
  }

  const resolvedDepartment = await resolveDepartment(department);
  if (!resolvedDepartment) return errorResponse(res, 404, "Department not found");

  const normalizedEmail = email.trim().toLowerCase();
  if (!isStaffEmail(normalizedEmail)) return errorResponse(res, 400, "Staff/Admin email must end with @ntu.edu.pk");
  if (!isStrongPassword(password)) return errorResponse(res, 400, "Password must be at least 8 characters and include letters, numbers, and symbols");
  const existingUser = await User.findOne({ email: normalizedEmail });
  if (existingUser) return errorResponse(res, 409, "Email already exists");

  const admin = await User.create({
    fullName: fullName.trim(),
    email: normalizedEmail,
    password,
    role: "Admin",
    department: resolvedDepartment._id,
    isEmailVerified: true,
  });

  if (!resolvedDepartment.headOfDepartment) {
    resolvedDepartment.headOfDepartment = admin._id;
    await resolvedDepartment.save();
  }

  const createdAdmin = await User.findById(admin._id).select("-password").populate("department");
  return successResponse(res, 201, "Department admin created", createdAdmin);
});

export const getSettings = asyncHandler(async (req, res) => {
  let settings = await Settings.findOne();
  if (!settings) {
    settings = await Settings.create({ systemName: "University Complaint Management System" });
  }
  return successResponse(res, 200, "System settings", settings);
});

export const uploadLogo = asyncHandler(async (req, res) => {
  if (!req.file || !req.file.buffer) return errorResponse(res, 400, "Logo file is required");
  
  let settings = await Settings.findOne();
  if (!settings) {
    settings = new Settings({ systemName: "University Complaint Management System" });
  }

  const result = await uploadBufferToCloudinary(req.file.buffer, "ucms/branding", req.file.originalname, req.file.mimetype);
  settings.logo = { public_id: result.public_id, url: result.secure_url, originalName: req.file.originalname };
  await settings.save();

  return successResponse(res, 200, "Logo uploaded successfully", settings);
});

export const updateSystemSettings = asyncHandler(async (req, res) => {
  const { systemName, description, supportEmail } = req.body;
  
  let settings = await Settings.findOne();
  if (!settings) {
    settings = new Settings({ systemName: "University Complaint Management System" });
  }

  if (systemName) settings.systemName = systemName;
  if (description !== undefined) settings.description = description;
  if (supportEmail !== undefined) settings.supportEmail = supportEmail;
  
  await settings.save();
  return successResponse(res, 200, "Settings updated", settings);
});

export default {
  getAllAdmins,
  getGlobalActivity,
  promoteToAdmin,
  createDepartment,
  createDepartmentAdmin,
  getSettings,
  uploadLogo,
  updateSystemSettings,
};

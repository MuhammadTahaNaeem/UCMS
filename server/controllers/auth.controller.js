import crypto from "crypto";
import asyncHandler from "../utils/asyncHandler.js";
import User from "../models/User.model.js";
import { generateToken } from "../utils/generateToken.js";
import { sendEmail } from "../utils/sendEmail.js";
import { successResponse, errorResponse } from "../utils/apiResponse.js";

const studentEmailPattern = /^[^\s@]+@student\.ntu\.edu\.pk$/i;
const strongPasswordPattern = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/;

const isStudentEmail = (email) => studentEmailPattern.test(String(email || "").trim());
const isStrongPassword = (password) => strongPasswordPattern.test(String(password || ""));

export const registerUser = asyncHandler(async (req, res) => {
  const { fullName, email, password } = req.body;
  if (!fullName || !email || !password) return errorResponse(res, 400, "Missing fields");
  const normalizedEmail = email.trim().toLowerCase();
  if (!isStudentEmail(normalizedEmail)) return errorResponse(res, 400, "Student email must end with @student.ntu.edu.pk");
  if (!isStrongPassword(password)) return errorResponse(res, 400, "Password must be at least 8 characters and include letters, numbers, and symbols");
  const exists = await User.findOne({ email: normalizedEmail });
  if (exists) return errorResponse(res, 409, "Email already registered");

  const user = await User.create({ fullName, email: normalizedEmail, password, role: "User" });
  const token = user.createEmailVerificationToken();
  await user.save({ validateBeforeSave: false });

  const verificationUrl = `${process.env.CLIENT_URL}/email-verification/${token}`;
  const sendResult = await sendEmail(user.email, "verifyEmail", [verificationUrl, user.fullName]);

  const responseData = { id: user._id, email: user.email };
  if (sendResult?.previewUrl) responseData.emailPreview = sendResult.previewUrl;
  // In development return the verification URL so devs can verify without SMTP
  if (process.env.NODE_ENV !== "production") responseData.verificationUrl = verificationUrl;

  return successResponse(res, 201, "User registered. Please verify your email.", responseData);
});

export const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return errorResponse(res, 400, "Missing credentials");

  const user = await User.findOne({ email: email.trim().toLowerCase() }).select("+password");
  if (!user) return errorResponse(res, 401, "Invalid credentials");
  if (!user.isEmailVerified) return errorResponse(res, 403, "Email not verified");
  if (!user.isActive) return errorResponse(res, 403, "Account disabled");

  const matched = await user.comparePassword(password);
  if (!matched) return errorResponse(res, 401, "Invalid credentials");

  const token = generateToken(user._id.toString(), user.role, res);
  user.lastLogin = Date.now();
  await user.save({ validateBeforeSave: false });

  const userObj = user.toObject();
  delete userObj.password;

  return successResponse(res, 200, "Logged in", { user: userObj, token });
});

export const logoutUser = asyncHandler(async (req, res) => {
  res.clearCookie("token");
  return successResponse(res, 200, "Logged out");
});

export const verifyEmail = asyncHandler(async (req, res) => {
  const token = req.params.token;
  if (!token) return errorResponse(res, 400, "Token missing");

  const hashed = crypto.createHash("sha256").update(token).digest("hex");
  const user = await User.findOne({ emailVerificationToken: hashed, emailVerificationExpires: { $gt: Date.now() } });
  if (!user) return errorResponse(res, 400, "Invalid or expired token");

  user.isEmailVerified = true;
  user.emailVerificationToken = undefined;
  user.emailVerificationExpires = undefined;
  await user.save({ validateBeforeSave: false });

  // Emit socket event if needed in controllers layer (socket integration will handle mapping)
  return successResponse(res, 200, "Email verified");
});

export const resendVerification = asyncHandler(async (req, res) => {
  const { email } = req.body;
  if (!email) return errorResponse(res, 400, "Email required");
  const user = await User.findOne({ email: email.trim().toLowerCase() });
  if (!user) return errorResponse(res, 404, "User not found");
  if (user.isEmailVerified) return errorResponse(res, 400, "Already verified");

  const token = user.createEmailVerificationToken();
  await user.save({ validateBeforeSave: false });
  const verificationUrl = `${process.env.CLIENT_URL}/email-verification/${token}`;
  await sendEmail(user.email, "verifyEmail", [verificationUrl, user.fullName]);
  return successResponse(res, 200, "Verification email sent");
});

export const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  if (!email) return errorResponse(res, 400, "Email required");
  const user = await User.findOne({ email: email.trim().toLowerCase() });
  if (!user) return errorResponse(res, 404, "User not found");

  const token = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });
  const resetUrl = `${process.env.CLIENT_URL}/reset-password/${token}`;
  await sendEmail(user.email, "resetPassword", [resetUrl, user.fullName]);
  return successResponse(res, 200, "Password reset email sent");
});

export const resetPassword = asyncHandler(async (req, res) => {
  const token = req.params.token;
  const { password } = req.body;
  if (!token) return errorResponse(res, 400, "Token missing");
  if (!password) return errorResponse(res, 400, "Password required");
  if (!isStrongPassword(password)) return errorResponse(res, 400, "Password must be at least 8 characters and include letters, numbers, and symbols");

  const hashed = crypto.createHash("sha256").update(token).digest("hex");
  const user = await User.findOne({ passwordResetToken: hashed, passwordResetExpires: { $gt: Date.now() } }).select(
    "+password"
  );
  if (!user) return errorResponse(res, 400, "Invalid or expired token");

  user.password = password;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  return successResponse(res, 200, "Password reset successful");
});

export const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select("-password");
  return successResponse(res, 200, "Profile fetched", user);
});

import mongoose from "mongoose";

export const errorHandler = (err, req, res, next) => {
  console.error(err);
  if (res.headersSent) return next(err);

  // Mongoose validation error
  if (err instanceof mongoose.Error.ValidationError) {
    const errors = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({ success: false, message: "Validation failed", errors });
  }

  // Duplicate key
  if (err.code && err.code === 11000) {
    const fields = Object.keys(err.keyValue || {});
    return res.status(409).json({ success: false, message: `Duplicate value for fields: ${fields.join(", ")}` });
  }

  // CastError
  if (err instanceof mongoose.Error.CastError) {
    return res.status(400).json({ success: false, message: "Invalid ID format" });
  }

  // Multer / upload errors
  if (err.code === "LIMIT_FILE_SIZE") {
    return res.status(400).json({ success: false, message: "File too large" });
  }

  // JWT errors
  if (err.name === "JsonWebTokenError" || err.name === "TokenExpiredError") {
    return res.status(401).json({ success: false, message: "Invalid or expired token" });
  }

  // Generic fallback
  return res.status(err.status || 500).json({ success: false, message: err.message || "Server Error" });
};

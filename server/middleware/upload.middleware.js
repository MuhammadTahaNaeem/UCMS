import multer from "multer";
import streamifier from "streamifier";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import crypto from "crypto";
import cloudinary, { isCloudinaryConfigured } from "../config/cloudinary.js";

const memoryStorage = multer.memoryStorage();
const imageOnlyFilter = (req, file, cb) => {
  const allowed = ["image/jpeg", "image/png", "image/jpg", "image/webp"];
  if (allowed.includes(file.mimetype)) cb(null, true);
  else cb(new Error("Unsupported file type"), false);
};
const upload = multer({
  storage: memoryStorage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const allowed = ["image/jpeg", "image/png", "image/jpg", "application/pdf"];
    if (allowed.includes(file.mimetype)) cb(null, true);
    else cb(new Error("Unsupported file type"), false);
  },
});

const avatarUpload = multer({
  storage: memoryStorage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: imageOnlyFilter,
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsRoot = path.resolve(__dirname, "../uploads");
const serverBaseUrl = process.env.SERVER_URL || "http://localhost:5000";

const sanitizeSegment = (value) => String(value || "uploads").replace(/[^a-zA-Z0-9/_-]+/g, "-").replace(/\/+/g, "/");

const storeLocally = async (buffer, folder, originalName = "file", mimetype = "application/octet-stream") => {
  const safeFolder = sanitizeSegment(folder);
  const relativeFolder = safeFolder.split("/").filter(Boolean);
  const targetDir = path.join(uploadsRoot, ...relativeFolder);
  await fs.mkdir(targetDir, { recursive: true });

  const extension = path.extname(originalName) || (mimetype === "application/pdf" ? ".pdf" : ".jpg");
  const fileName = `${Date.now()}-${crypto.randomUUID()}${extension}`;
  const filePath = path.join(targetDir, fileName);
  await fs.writeFile(filePath, buffer);

  const relativePath = [...relativeFolder, fileName].join("/");
  return {
    public_id: `local/${relativePath}`,
    secure_url: `${serverBaseUrl}/uploads/${relativePath}`,
  };
};

export const uploadSingle = upload.single("attachment");
export const uploadMultiple = upload.array("attachments", 5);
export const uploadAvatar = avatarUpload.single("avatar");

export const uploadBufferToCloudinary = async (buffer, folder = "ucms", originalName, mimetype) => {
  if (!isCloudinaryConfigured) {
    return storeLocally(buffer, folder, originalName, mimetype);
  }

  try {
    return await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream({ folder }, (error, result) => {
        if (error) return reject(error);
        resolve(result);
      });
      streamifier.createReadStream(buffer).pipe(uploadStream);
    });
  } catch (error) {
    return storeLocally(buffer, folder, originalName, mimetype);
  }
};

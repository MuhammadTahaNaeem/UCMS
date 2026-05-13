import dotenv from "dotenv";
import { v2 as cloudinary } from "cloudinary";

dotenv.config();

const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } = process.env;

const isPlaceholder = (value) => !value || /^your_cloudinary_/i.test(String(value));
export const isCloudinaryConfigured =
  !isPlaceholder(CLOUDINARY_CLOUD_NAME) && !isPlaceholder(CLOUDINARY_API_KEY) && !isPlaceholder(CLOUDINARY_API_SECRET);

if (isCloudinaryConfigured) {
  cloudinary.config({
    cloud_name: CLOUDINARY_CLOUD_NAME,
    api_key: CLOUDINARY_API_KEY,
    api_secret: CLOUDINARY_API_SECRET,
    secure: true,
  });
}

export default cloudinary;

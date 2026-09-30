import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";

dotenv.config();

// Configured lazily-safe: if the CLOUDINARY_* env vars are missing, config()
// just no-ops (cloudinary keeps its defaults) and any actual upload attempt
// fails with a clear error from the Cloudinary SDK itself, rather than
// crashing server boot.
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

// Uploads a buffer (from multer's memoryStorage) to Cloudinary without
// touching disk. Used by controllers/vehicle.controller.js to store
// customer-uploaded vehicle photos.
const uploadBufferToCloudinary = (buffer, options = {}) => {
  return new Promise((resolve, reject) => {
    if (!process.env.CLOUDINARY_CLOUD_NAME) {
      return reject(
        new Error(
          "Image upload is not configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET in .env",
        ),
      );
    }

    const stream = cloudinary.uploader.upload_stream(
      { folder: "car-detailing/vehicles", resource_type: "image", ...options },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      },
    );

    stream.end(buffer);
  });
};

const deleteFromCloudinary = async (publicId) => {
  if (!publicId) return;
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch {
    // Non-fatal — an orphaned Cloudinary asset isn't worth failing the
    // request over (e.g. replacing an image that was already removed).
  }
};

export { cloudinary, uploadBufferToCloudinary, deleteFromCloudinary };
export default cloudinary;

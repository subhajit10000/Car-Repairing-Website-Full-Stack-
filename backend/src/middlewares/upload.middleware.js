import multer from "multer";
import ApiError from "../utils/ApiError.js";

// Memory storage: files land in req.file.buffer, which we stream straight
// to Cloudinary (see config/cloudinary.js) instead of writing to disk.
const storage = multer.memoryStorage();

const imageFileFilter = (req, file, cb) => {
  if (!file.mimetype?.startsWith("image/")) {
    return cb(new ApiError(400, "Only image files are allowed."));
  }
  cb(null, true);
};

const uploadImage = multer({
  storage,
  fileFilter: imageFileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

export default uploadImage;

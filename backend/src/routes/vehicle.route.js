import express from "express";
import {
  addVehicle,
  getMyVehicles,
  getVehicleById,
  updateVehicle,
  deleteVehicle,
  uploadVehicleImage,
} from "../controllers/vehicle.controller.js";
import authMiddleware from "../middlewares/auth.middleware.js";
import { apiLimiter } from "../middlewares/rateLimiter.js";
import validate from "../middlewares/validation.middleware.js";
import uploadImage from "../middlewares/upload.middleware.js";
import {
  createVehicleValidator,
  updateVehicleValidator,
} from "../validators/vehicle.validator.js";

const router = express.Router();
router.use(authMiddleware);

router.post("/", apiLimiter, createVehicleValidator, validate, addVehicle);

// NOTE: "/my" must be registered before "/:id" or Express will treat
// "my" as an :id value.
router.get("/my", getMyVehicles);

router.get("/:id", getVehicleById);

router.patch("/:id", updateVehicleValidator, validate, updateVehicle);

// Feature 3: multipart image upload, stored on Cloudinary.
router.post("/:id/image", uploadImage.single("image"), uploadVehicleImage);

router.delete("/:id", deleteVehicle);

export default router;

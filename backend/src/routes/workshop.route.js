import express from "express";
import {
  getAllWorkshops,
  getWorkshopById,
  createWorkshop,
  updateWorkshop,
  assignManager,
  addEmployee,
  removeEmployee,
  getWorkshopEmployees,
} from "../controllers/workshop.controller.js";
import authMiddleware from "../middlewares/auth.middleware.js";
import authorize from "../middlewares/role.middleware.js";
import {
  apiLimiter,
} from "../middlewares/rateLimiter.js";
import validate from "../middlewares/validation.middleware.js";
import { requireOwnWorkshopParam } from "../middlewares/workshopOwnership.middleware.js";
import { createWorkshopValidator, updateWorkshopValidator } from "../validators/workshop.validator.js";
import uploadImage from "../middlewares/upload.middleware.js";

const router = express.Router();

// Public — anyone can browse workshops.
router.get("/", getAllWorkshops);
router.get("/:id", getWorkshopById);

router.use(authMiddleware);

// ADMIN only.
router.post("/", authorize("ADMIN"), createWorkshopValidator, validate, createWorkshop);
router.patch("/:id/manager", authorize("ADMIN"), uploadImage.single("profilePhoto"), assignManager);

// ADMIN or the workshop's own WORKSHOP_MANAGER (feature 6: a manager can
// only modify their own workshop).
router.patch(
  "/:id",
  authorize("ADMIN", "WORKSHOP_MANAGER"),
  requireOwnWorkshopParam("id"),
  updateWorkshopValidator,
  validate,
  updateWorkshop,
);

// Feature 2: employee management, scoped to the manager's own workshop.
router.get(
  "/:id/employees",
  authorize("ADMIN", "WORKSHOP_MANAGER"),
  requireOwnWorkshopParam("id"),
  getWorkshopEmployees,
);
router.post(
  "/:id/employees",
  authorize("ADMIN", "WORKSHOP_MANAGER"),
  requireOwnWorkshopParam("id"),
  uploadImage.single("profilePhoto"),
  addEmployee,
);
router.delete(
  "/:id/employees/:employeeId",
  authorize("ADMIN", "WORKSHOP_MANAGER"),
  requireOwnWorkshopParam("id"),
  removeEmployee,
);

export default router;

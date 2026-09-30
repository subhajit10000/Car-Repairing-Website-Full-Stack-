import express from "express";
import { getAllServices, createService, updateService, deleteService } from "../controllers/service.controller.js";
import authMiddleware from "../middlewares/auth.middleware.js";
import authorize from "../middlewares/role.middleware.js";
import {
  apiLimiter,
} from "../middlewares/rateLimiter.js";
import logger from "../utils/logger.js";

import validate from "../middlewares/validation.middleware.js";
import { createServiceValidator, updateServiceValidator } from "../validators/service.validator.js";

const router = express.Router();

router.get("/", getAllServices);

// Feature 2: service management, restricted to a workshop manager (own
// workshop, enforced inside the controller) or an admin.
router.post(
  "/",
  authMiddleware,
  authorize("ADMIN", "WORKSHOP_MANAGER"),
  createServiceValidator,
  validate,
  createService,
);

router.patch(
  "/:id",
  authMiddleware,
  authorize("ADMIN", "WORKSHOP_MANAGER"),
  updateServiceValidator,
  validate,
  updateService,
);

router.delete(
  "/:id",
  authMiddleware,
  authorize("ADMIN", "WORKSHOP_MANAGER"),
  deleteService,
);

export default router;

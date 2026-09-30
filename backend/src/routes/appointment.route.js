import express from "express";
import {
  bookAppointment,
  getAllAppointments,
  getMyAppointments,
  getAppointmentById,
  cancelAppointment,
  updateAppointmentStatus,
  getAppointmentInvoice,
} from "../controllers/appointment.controller.js";
import authMiddleware from "../middlewares/auth.middleware.js";
import authorize from "../middlewares/role.middleware.js";
import { apiLimiter } from "../middlewares/rateLimiter.js";
import validate from "../middlewares/validation.middleware.js";
import { createAppointmentValidator, updateStatusValidator } from "../validators/appointment.validator.js";

const router = express.Router();
router.use(authMiddleware);

router.post(
  "/",
  apiLimiter,
  createAppointmentValidator,
  validate,
  bookAppointment,
);


router.get("/", authorize("ADMIN", "WORKSHOP_MANAGER"), getAllAppointments);

router.get("/my", getMyAppointments);

router.patch("/:id/cancel", cancelAppointment);

// Feature 5/6: only a workshop manager (own workshop) or admin can change a
// repair's status. Ownership itself is enforced inside the controller
// because it depends on which workshop the appointment belongs to.
router.patch(
  "/:id/status",
  authorize("ADMIN", "WORKSHOP_MANAGER"),
  updateStatusValidator,
  validate,
  updateAppointmentStatus,
);

// Feature 4: download the invoice PDF once the repair is COMPLETED.
router.get("/:id/invoice", getAppointmentInvoice);

router.get("/:id", getAppointmentById);

export default router;

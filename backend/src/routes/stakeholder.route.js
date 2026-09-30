import express from "express";
import authMiddleware from "../middlewares/auth.middleware.js";
import authorize from "../middlewares/role.middleware.js";
import uploadImage from "../middlewares/upload.middleware.js";
import {
  getWorkshopAppointments,
  assignMechanic,
  uploadRepairPhoto,
  sendAdvisorMessage,
  sendCustomerMessage,
  getConversation,
  getMyConversations,
  createPaymentOrder,
  verifyPayment,
  submitFeedback,
} from "../controllers/stakeholder.controller.js";

const router = express.Router();
router.use(authMiddleware);
router.get("/appointments", authorize("WORKSHOP_MANAGER", "SERVICE_ADVISOR", "MECHANIC"), getWorkshopAppointments);
router.patch("/appointments/:id/mechanic", authorize("ADMIN", "WORKSHOP_MANAGER"), assignMechanic);
router.post("/appointments/:id/repair-photo", authorize("MECHANIC"), uploadImage.single("image"), uploadRepairPhoto);
router.post("/appointments/:id/advisor-email", authorize("SERVICE_ADVISOR"), sendAdvisorMessage);

// Feature 1: persisted advisor <-> customer conversation (with optional
// images), visible to the customer from their "Community" page.
router.post("/appointments/:id/messages", authorize("SERVICE_ADVISOR"), uploadImage.single("image"), sendCustomerMessage);
router.get("/appointments/:id/messages", authorize("SERVICE_ADVISOR", "WORKSHOP_MANAGER", "ADMIN", "CUSTOMER"), getConversation);
router.get("/messages/my", authorize("CUSTOMER"), getMyConversations);

router.post("/appointments/:id/payment/order", authorize("CUSTOMER"), createPaymentOrder);
router.post("/appointments/:id/payment/verify", authorize("CUSTOMER"), verifyPayment);
router.post("/appointments/:id/feedback", authorize("CUSTOMER"), submitFeedback);
export default router;

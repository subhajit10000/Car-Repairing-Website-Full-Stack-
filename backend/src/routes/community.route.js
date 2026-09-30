import express from "express";
import authMiddleware from "../middlewares/auth.middleware.js";
import authorize from "../middlewares/role.middleware.js";
import uploadImage from "../middlewares/upload.middleware.js";
import { getMyConversations, getConversation, sendMessage } from "../controllers/community.controller.js";

const router = express.Router();
router.use(authMiddleware);

router.get("/", authorize("CUSTOMER", "SERVICE_ADVISOR", "WORKSHOP_MANAGER", "ADMIN"), getMyConversations);
router.get(
  "/appointments/:appointmentId",
  authorize("CUSTOMER", "SERVICE_ADVISOR", "WORKSHOP_MANAGER", "ADMIN"),
  getConversation,
);
router.post(
  "/appointments/:appointmentId/messages",
  authorize("CUSTOMER", "SERVICE_ADVISOR", "WORKSHOP_MANAGER", "ADMIN"),
  uploadImage.single("image"),
  sendMessage,
);

export default router;

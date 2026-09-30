import express from "express";
import authMiddleware from "../middlewares/auth.middleware.js";
import authorize from "../middlewares/role.middleware.js";
import { getMyNotifications, markNotificationRead, markAllNotificationsRead } from "../controllers/notification.controller.js";

const router = express.Router();
router.use(authMiddleware);
router.use(authorize("WORKSHOP_MANAGER"));

router.get("/", getMyNotifications);
router.patch("/read-all", markAllNotificationsRead);
router.patch("/:id/read", markNotificationRead);

export default router;

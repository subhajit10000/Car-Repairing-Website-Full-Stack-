import express from "express";
import authMiddleware from "../middlewares/auth.middleware.js";
import uploadImage from "../middlewares/upload.middleware.js";
import { getConversation, sendMessage, getMyConversations } from "../controllers/message.controller.js";

const router = express.Router();
router.use(authMiddleware);

// CUSTOMER only — every appointment of theirs that has a conversation,
// newest activity first. Powers the "Community" sidebar page.
router.get("/my", getMyConversations);

router.get("/appointment/:id", getConversation);
router.post("/appointment/:id", uploadImage.single("image"), sendMessage);

export default router;

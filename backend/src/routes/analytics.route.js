import express from "express";
import authMiddleware from "../middlewares/auth.middleware.js";
import authorize from "../middlewares/role.middleware.js";
import { getSalesAnalytics } from "../controllers/analytics.controller.js";

const router = express.Router();
router.use(authMiddleware, authorize("ADMIN", "WORKSHOP_MANAGER"));

// Feature 4: both ADMIN and WORKSHOP_MANAGER can see sales analytics.
// ADMIN sees every workshop by default, or one via ?workshop=<id>.
// WORKSHOP_MANAGER always sees only their own workshop.
router.get("/sales", getSalesAnalytics);

export default router;

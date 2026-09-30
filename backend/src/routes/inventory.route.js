import express from "express";
import {
  getWorkshopInventory,
  addInventoryItem,
  updateInventoryItem,
  deleteInventoryItem,
} from "../controllers/inventory.controller.js";
import authMiddleware from "../middlewares/auth.middleware.js";
import authorize from "../middlewares/role.middleware.js";
import validate from "../middlewares/validation.middleware.js";
import InventoryItem from "../models/inventory.model.js";
import {
  requireOwnWorkshopParam,
  requireOwnWorkshopOfDoc,
} from "../middlewares/workshopOwnership.middleware.js";
import {
  createInventoryItemValidator,
  updateInventoryItemValidator,
} from "../validators/inventory.validator.js";

// Mounted directly at /api/v1 in app.js so the full paths below are:
//   /api/v1/workshops/:workshopId/inventory
//   /api/v1/inventory/:id
const router = express.Router();
router.use(authMiddleware, authorize("ADMIN", "WORKSHOP_MANAGER"));

router.get(
  "/workshops/:workshopId/inventory",
  requireOwnWorkshopParam("workshopId"),
  getWorkshopInventory,
);

router.post(
  "/workshops/:workshopId/inventory",
  requireOwnWorkshopParam("workshopId"),
  createInventoryItemValidator,
  validate,
  addInventoryItem,
);

router.patch(
  "/inventory/:id",
  requireOwnWorkshopOfDoc(InventoryItem, "id"),
  updateInventoryItemValidator,
  validate,
  updateInventoryItem,
);

router.delete(
  "/inventory/:id",
  requireOwnWorkshopOfDoc(InventoryItem, "id"),
  deleteInventoryItem,
);

export default router;

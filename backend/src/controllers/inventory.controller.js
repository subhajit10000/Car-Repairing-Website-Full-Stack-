import { asyncHandler } from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import logger from "../utils/logger.js";
import sendResponse from "../helpers/response.js";
import InventoryItem from "../models/inventory.model.js";

// Feature 2: inventory CRUD, scoped to a single workshop. Ownership (a
// manager may only touch their own workshop's inventory) is enforced by
// requireOwnWorkshopParam / requireOwnWorkshopOfDoc on the routes.

const getWorkshopInventory = asyncHandler(async (req, res) => {
  const items = await InventoryItem.find({
    workshop: req.params.workshopId,
    isActive: true,
  }).sort({ name: 1 });

  return sendResponse(res, 200, "Inventory fetched successfully", items);
});

const addInventoryItem = asyncHandler(async (req, res) => {
  const { name, sku, category, quantity, unit, reorderLevel, unitCost } = req.body;

  let item;
  try {
    item = await InventoryItem.create({
      workshop: req.params.workshopId,
      name,
      sku,
      category,
      quantity,
      unit,
      reorderLevel,
      unitCost,
    });
  } catch (error) {
    if (error.code === 11000) {
      throw new ApiError(409, "An inventory item with this name already exists for this workshop.");
    }
    throw error;
  }

  logger.info(`Inventory item ${item._id} added to workshop ${req.params.workshopId} by user ${req.user._id}`);

  return sendResponse(res, 201, "Inventory item added successfully", item);
});

const updateInventoryItem = asyncHandler(async (req, res) => {
  // req.loadedDoc was set by requireOwnWorkshopOfDoc so we don't have to
  // fetch the item twice.
  const item = req.loadedDoc;

  const editableFields = ["name", "sku", "category", "quantity", "unit", "reorderLevel", "unitCost", "isActive"];
  editableFields.forEach((field) => {
    if (req.body[field] !== undefined) {
      item[field] = req.body[field];
    }
  });

  await item.save();

  logger.info(`Inventory item ${item._id} updated by user ${req.user._id}`);

  return sendResponse(res, 200, "Inventory item updated successfully", item);
});

const deleteInventoryItem = asyncHandler(async (req, res) => {
  const item = req.loadedDoc;

  item.isActive = false;
  await item.save();

  logger.info(`Inventory item ${item._id} removed by user ${req.user._id}`);

  return sendResponse(res, 200, "Inventory item removed successfully", item);
});

export { getWorkshopInventory, addInventoryItem, updateInventoryItem, deleteInventoryItem };

import mongoose from "mongoose";

// Parts/supplies inventory for a single workshop. Managed exclusively by
// that workshop's WORKSHOP_MANAGER (or an ADMIN) — see
// middlewares/workshopOwnership.middleware.js and
// controllers/inventory.controller.js.
const inventoryItemSchema = new mongoose.Schema(
  {
    workshop: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Workshop",
      required: true,
      index: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    sku: {
      type: String,
      trim: true,
      default: "",
    },

    category: {
      type: String,
      trim: true,
      default: "General",
    },

    quantity: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },

    unit: {
      type: String,
      trim: true,
      default: "pcs",
    },

    // Quantity at/below which this item is considered low stock. Purely
    // informational for the manager's dashboard.
    reorderLevel: {
      type: Number,
      min: 0,
      default: 5,
    },

    unitCost: {
      type: Number,
      min: 0,
      default: 0,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

inventoryItemSchema.index({ workshop: 1, name: 1 }, { unique: true });

const InventoryItem = mongoose.model("InventoryItem", inventoryItemSchema);

export default InventoryItem;

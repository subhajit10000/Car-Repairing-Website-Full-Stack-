import ApiError from "../utils/ApiError.js";
import Workshop from "../models/workshop.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// Requires authMiddleware + authorize("ADMIN", "WORKSHOP_MANAGER") to have
// already run. ADMIN can manage any workshop. A WORKSHOP_MANAGER can only
// manage the single workshop they're assigned to (req.user.workshop) — this
// is what satisfies "a workshop manager can only modify their own workshop".
//
// getWorkshopId(req) tells this middleware which workshop the request is
// about (it can come from req.params.workshopId, req.params.id, or a
// document already loaded earlier in the chain).
const requireOwnWorkshop = (getWorkshopId) =>
  asyncHandler(async (req, res, next) => {
    if (req.user.role === "ADMIN") {
      return next();
    }

    if (req.user.role !== "WORKSHOP_MANAGER") {
      throw new ApiError(403, "Only a workshop manager or admin can do this.");
    }

    if (!req.user.workshop) {
      throw new ApiError(
        403,
        "Your account isn't assigned to a workshop yet. Contact an admin.",
      );
    }

    const workshopId = await getWorkshopId(req);

    if (!workshopId) {
      throw new ApiError(404, "Workshop not found.");
    }

    if (workshopId.toString() !== req.user.workshop.toString()) {
      throw new ApiError(
        403,
        "You can only manage your own workshop.",
      );
    }

    next();
  });

// Convenience variant for routes where the workshop id is directly in the
// URL, e.g. /workshops/:id/employees or /workshops/:workshopId/inventory.
const requireOwnWorkshopParam = (paramName = "id") =>
  requireOwnWorkshop((req) => req.params[paramName]);

// Convenience variant for routes that load a Workshop-owned document by its
// own id first (e.g. an inventory item, whose `workshop` field says which
// workshop it belongs to).
const requireOwnWorkshopOfDoc = (Model, paramName = "id") =>
  requireOwnWorkshop(async (req) => {
    const doc = await Model.findById(req.params[paramName]);
    if (!doc) {
      throw new ApiError(404, "Resource not found.");
    }
    req.loadedDoc = doc;
    return doc.workshop;
  });

export { requireOwnWorkshop, requireOwnWorkshopParam, requireOwnWorkshopOfDoc };

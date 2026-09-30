
import { asyncHandler } from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import logger from "../utils/logger.js";
import sendResponse from "../helpers/response.js";
import Service from "../models/service.model.js";
import Workshop from "../models/workshop.model.js";

const getAllServices = asyncHandler(async (req, res) => {
  const services = await Service.find({ isActive: true });

  return sendResponse(
    res,
    200,
    "Services fetched successfully",
    services
  );
});

// A WORKSHOP_MANAGER may only touch services offered at their own workshop.
// ADMIN can touch any service.
const assertCanManageService = (req, service) => {
  if (req.user.role === "ADMIN") return;

  if (!req.user.workshop) {
    throw new ApiError(403, "Your account isn't assigned to a workshop yet.");
  }

  const offersHere = (service.availableAt || []).some(
    (workshopId) => workshopId.toString() === req.user.workshop.toString(),
  );

  if (!offersHere) {
    throw new ApiError(403, "You can only manage services offered at your own workshop.");
  }
};

// Feature 2: workshop manager creates a new service for their own workshop.
// ADMIN may create a service for any workshop(s) by passing availableAt.
const createService = asyncHandler(async (req, res) => {
  const { name, category, description, icon, startingPrice, estimatedTime, includes, availableAt } = req.body;

  let workshopIds = availableAt;

  if (req.user.role === "WORKSHOP_MANAGER") {
    if (!req.user.workshop) {
      throw new ApiError(403, "Your account isn't assigned to a workshop yet.");
    }
    workshopIds = [req.user.workshop];
  }

  const service = await Service.create({
    name,
    category,
    description,
    icon,
    startingPrice,
    estimatedTime,
    includes,
    availableAt: workshopIds || [],
  });

  if (workshopIds?.length) {
    await Workshop.updateMany(
      { _id: { $in: workshopIds } },
      { $addToSet: { services: service._id } },
    );
  }

  logger.info(`Service ${service._id} created by user ${req.user._id}`);

  return sendResponse(res, 201, "Service created successfully", service);
});

// Feature 2: update a service offered at the manager's own workshop.
const updateService = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const service = await Service.findById(id);
  if (!service) {
    throw new ApiError(404, "Service not found.");
  }

  assertCanManageService(req, service);

  const editableFields = [
    "name",
    "category",
    "description",
    "icon",
    "startingPrice",
    "estimatedTime",
    "includes",
    "isActive",
  ];
  editableFields.forEach((field) => {
    if (req.body[field] !== undefined) {
      service[field] = req.body[field];
    }
  });

  await service.save();

  logger.info(`Service ${service._id} updated by user ${req.user._id}`);

  return sendResponse(res, 200, "Service updated successfully", service);
});

// Feature 2: a manager "removes" a service from their own workshop by
// unlinking it (availableAt) rather than deleting a possibly shared
// document outright. If it was the last workshop offering it, it's
// deactivated. ADMIN may hard-delete.
const deleteService = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const service = await Service.findById(id);
  if (!service) {
    throw new ApiError(404, "Service not found.");
  }

  if (req.user.role === "ADMIN") {
    await Workshop.updateMany({ services: service._id }, { $pull: { services: service._id } });
    await service.deleteOne();
    logger.info(`Service ${id} deleted by admin ${req.user._id}`);
    return sendResponse(res, 200, "Service deleted successfully");
  }

  assertCanManageService(req, service);

  service.availableAt = (service.availableAt || []).filter(
    (workshopId) => workshopId.toString() !== req.user.workshop.toString(),
  );
  if (service.availableAt.length === 0) {
    service.isActive = false;
  }
  await service.save();

  await Workshop.findByIdAndUpdate(req.user.workshop, {
    $pull: { services: service._id },
  });

  logger.info(`Service ${id} removed from workshop ${req.user.workshop} by user ${req.user._id}`);

  return sendResponse(res, 200, "Service removed from your workshop successfully", service);
});

export { getAllServices, createService, updateService, deleteService };

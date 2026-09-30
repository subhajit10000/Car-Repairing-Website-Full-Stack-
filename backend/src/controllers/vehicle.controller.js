import { asyncHandler } from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import logger from "../utils/logger.js";
import sendResponse from "../helpers/response.js";
import Vehicle from "../models/vehicle.model.js";
import { uploadBufferToCloudinary, deleteFromCloudinary } from "../config/cloudinary.js";

// Used by the frontend's MyVehicles.jsx "Add Vehicle" form.
const addVehicle = asyncHandler(async (req, res) => {
  const { make, model, year, regNumber, color, notes } = req.body;

  let vehicle;
  try {
    vehicle = await Vehicle.create({
      owner: req.user._id,
      make,
      model,
      ...(year && { year }),
      regNumber,
      ...(color && { color }),
      ...(notes && { notes }),
    });
  } catch (error) {
    if (error.code === 11000) {
      throw new ApiError(
        409,
        "You already have a vehicle saved with this registration number.",
      );
    }
    throw error;
  }

  logger.info(`Vehicle ${vehicle._id} added by user ${req.user._id}`);

  return sendResponse(res, 201, "Vehicle added successfully", vehicle);
});

// Used by the frontend's MyVehicles.jsx page and the vehicle picker in
// BookService.jsx.
const getMyVehicles = asyncHandler(async (req, res) => {
  const vehicles = await Vehicle.find({
    owner: req.user._id,
    isActive: true,
  }).sort({ createdAt: -1 });

  return sendResponse(res, 200, "Vehicles fetched successfully", vehicles);
});

const getVehicleById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const vehicle = await Vehicle.findById(id);

  if (!vehicle || !vehicle.isActive) {
    throw new ApiError(404, "Vehicle not found.");
  }

  const isOwner = vehicle.owner.toString() === req.user._id.toString();
  const isPrivileged = ["ADMIN", "WORKSHOP_MANAGER"].includes(req.user.role);

  if (!isOwner && !isPrivileged) {
    throw new ApiError(403, "You are not allowed to view this vehicle.");
  }

  return sendResponse(res, 200, "Vehicle fetched successfully", vehicle);
});

// Used by the frontend's MyVehicles.jsx "Edit" action.
const updateVehicle = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { make, model, year, regNumber, color, notes } = req.body;

  const vehicle = await Vehicle.findById(id);

  if (!vehicle || !vehicle.isActive) {
    throw new ApiError(404, "Vehicle not found.");
  }

  if (vehicle.owner.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "You are not allowed to update this vehicle.");
  }

  if (make !== undefined) vehicle.make = make;
  if (model !== undefined) vehicle.model = model;
  if (year !== undefined) vehicle.year = year;
  if (regNumber !== undefined) vehicle.regNumber = regNumber;
  if (color !== undefined) vehicle.color = color;
  if (notes !== undefined) vehicle.notes = notes;

  try {
    await vehicle.save();
  } catch (error) {
    if (error.code === 11000) {
      throw new ApiError(
        409,
        "You already have a vehicle saved with this registration number.",
      );
    }
    throw error;
  }

  logger.info(`Vehicle ${vehicle._id} updated by user ${req.user._id}`);

  return sendResponse(res, 200, "Vehicle updated successfully", vehicle);
});

// Used by the frontend's MyVehicles.jsx "Remove" action. Soft-deletes so
// past appointments that reference this vehicle's snapshot data stay intact.
const deleteVehicle = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const vehicle = await Vehicle.findById(id);

  if (!vehicle || !vehicle.isActive) {
    throw new ApiError(404, "Vehicle not found.");
  }

  if (vehicle.owner.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "You are not allowed to remove this vehicle.");
  }

  vehicle.isActive = false;
  await vehicle.save();

  logger.info(`Vehicle ${vehicle._id} removed by user ${req.user._id}`);

  return sendResponse(res, 200, "Vehicle removed successfully", vehicle);
});

// Feature 3: customer uploads a photo of their vehicle, stored via
// Cloudinary and referenced on the Vehicle document. Used by the
// frontend's MyVehicles.jsx "Upload Photo" action.
const uploadVehicleImage = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!req.file) {
    throw new ApiError(400, "No image file was provided.");
  }

  const vehicle = await Vehicle.findById(id);

  if (!vehicle || !vehicle.isActive) {
    throw new ApiError(404, "Vehicle not found.");
  }

  if (vehicle.owner.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "You are not allowed to update this vehicle.");
  }

  const result = await uploadBufferToCloudinary(req.file.buffer, {
    public_id: `vehicle_${vehicle._id}`,
    overwrite: true,
  });

  // Clean up the old asset if it had a different public id (e.g. re-upload
  // with overwrite disabled in some future Cloudinary config change).
  if (vehicle.image?.publicId && vehicle.image.publicId !== result.public_id) {
    await deleteFromCloudinary(vehicle.image.publicId);
  }

  vehicle.image = { url: result.secure_url, publicId: result.public_id };
  await vehicle.save();

  logger.info(`Vehicle ${vehicle._id} image updated by user ${req.user._id}`);

  return sendResponse(res, 200, "Vehicle image uploaded successfully", vehicle);
});

export {
  addVehicle,
  getMyVehicles,
  getVehicleById,
  updateVehicle,
  deleteVehicle,
  uploadVehicleImage,
};

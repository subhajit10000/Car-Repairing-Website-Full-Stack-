
import { asyncHandler } from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import logger from "../utils/logger.js";
import sendResponse from "../helpers/response.js";
import Workshop from "../models/workshop.model.js";
import User from "../models/user.model.js";

const getAllWorkshops = asyncHandler(async (req, res) => {
  const workshop = await Workshop.find({ isActive: true });

  return sendResponse(
    res,
    200,
    "Workshops data fetched successfully",
    workshop
  );
});

const getWorkshopById = asyncHandler(async (req, res) => {
  const workshop = await Workshop.findById(req.params.id).populate(
    "services",
    "name category startingPrice estimatedTime icon",
  );

  if (!workshop) {
    throw new ApiError(404, "Workshop not found.");
  }

  return sendResponse(res, 200, "Workshop fetched successfully", workshop);
});

// ADMIN only — creates a new workshop record.
const createWorkshop = asyncHandler(async (req, res) => {
  const workshop = await Workshop.create(req.body);

  logger.info(`Workshop ${workshop._id} created by admin ${req.user._id}`);

  return sendResponse(res, 201, "Workshop created successfully", workshop);
});

// ADMIN, or the WORKSHOP_MANAGER of this workshop (ownership enforced by
// requireOwnWorkshopParam on the route). Managers may only edit operational
// fields, not reassign themselves or another manager.
const updateWorkshop = asyncHandler(async (req, res) => {
  const workshop = await Workshop.findById(req.params.id);
  if (!workshop) {
    throw new ApiError(404, "Workshop not found.");
  }

  const managerEditableFields = [
    "status",
    "openingTime",
    "closingTime",
    "nextAvailable",
    "image",
  ];
  const adminOnlyFields = [
    "name",
    "location",
    "distance",
    "startingPrice",
    "isActive",
  ];

  const allowedFields =
    req.user.role === "ADMIN"
      ? [...managerEditableFields, ...adminOnlyFields]
      : managerEditableFields;

  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) {
      workshop[field] = req.body[field];
    }
  });

  await workshop.save();

  logger.info(`Workshop ${workshop._id} updated by user ${req.user._id}`);

  return sendResponse(res, 200, "Workshop updated successfully", workshop);
});

// ADMIN only — assigns (or reassigns) the WORKSHOP_MANAGER for a workshop.
// The target user's role is promoted to WORKSHOP_MANAGER and their
// `workshop` reference set, which is what scopes every manager-only action
// elsewhere (services/employees/inventory/appointment status).
const assignManager = asyncHandler(async (req, res) => {
  const { firstName, lastName, email, phone } = req.body;

  if (!firstName?.trim() || !lastName?.trim() || !email?.trim() || !phone?.trim()) {
    throw new ApiError(400, "firstName, lastName, email and phone are required.");
  }

  const workshop = await Workshop.findById(req.params.id);
  if (!workshop) {
    throw new ApiError(404, "Workshop not found.");
  }

  const user = await User.findOne({ email: email.trim().toLowerCase() });
  if (!user) {
    throw new ApiError(
      404,
      "No registered user was found with this email. Ask the person to create an account first.",
    );
  }

  if (user.role === "ADMIN") {
    throw new ApiError(400, "An ADMIN cannot be assigned as a workshop manager.");
  }

  if (user.workshop && user.workshop.toString() !== workshop._id.toString()) {
    throw new ApiError(409, "This user already belongs to another workshop.");
  }

  if (workshop.manager && workshop.manager.toString() !== user._id.toString()) {
    await User.findByIdAndUpdate(workshop.manager, {
      workshop: null,
      role: "CUSTOMER",
    });
  }

  user.firstName = firstName.trim();
  user.lastName = lastName.trim();
  user.phone = phone.trim();
  user.role = "WORKSHOP_MANAGER";
  user.workshop = workshop._id;

  if (req.file) {
    const { uploadBufferToCloudinary, deleteFromCloudinary } = await import("../config/cloudinary.js");
    const result = await uploadBufferToCloudinary(req.file.buffer, {
      folder: "car-detailing/profiles",
    });
    await deleteFromCloudinary(user.profilePicture?.publicId);
    user.profilePicture = {
      url: result.secure_url,
      publicId: result.public_id,
    };
  }

  await user.save();

  workshop.manager = user._id;
  await workshop.save();

  logger.info(`User ${user._id} assigned as manager of workshop ${workshop._id}`);

  return sendResponse(res, 200, "Workshop manager assigned successfully", workshop);
});

// Feature 2: workshop manager (own workshop) or admin can add an employee
// (SERVICE_ADVISOR or MECHANIC) to the workshop's roster.
const addEmployee = asyncHandler(async (req, res) => {
  const { firstName, lastName, email, phone, role } = req.body;

  if (!["SERVICE_ADVISOR", "MECHANIC"].includes(role)) {
    throw new ApiError(400, "role must be SERVICE_ADVISOR or MECHANIC.");
  }

  if (!firstName?.trim() || !lastName?.trim() || !email?.trim() || !phone?.trim()) {
    throw new ApiError(400, "firstName, lastName, email and phone are required.");
  }

  const workshop = await Workshop.findById(req.params.id);
  if (!workshop) {
    throw new ApiError(404, "Workshop not found.");
  }

  const user = await User.findOne({ email: email.trim().toLowerCase() });
  if (!user) {
    throw new ApiError(
      404,
      "No registered user was found with this email. Ask the person to create an account first.",
    );
  }

  if (["ADMIN", "WORKSHOP_MANAGER"].includes(user.role)) {
    throw new ApiError(400, "This user cannot be assigned as a workshop employee.");
  }

  if (user.workshop && user.workshop.toString() !== workshop._id.toString()) {
    throw new ApiError(409, "This user already belongs to another workshop.");
  }

  user.firstName = firstName.trim();
  user.lastName = lastName.trim();
  user.phone = phone.trim();
  user.role = role;
  user.workshop = workshop._id;

  if (req.file) {
    const { uploadBufferToCloudinary, deleteFromCloudinary } = await import("../config/cloudinary.js");
    const result = await uploadBufferToCloudinary(req.file.buffer, {
      folder: "car-detailing/profiles",
    });
    await deleteFromCloudinary(user.profilePicture?.publicId);
    user.profilePicture = {
      url: result.secure_url,
      publicId: result.public_id,
    };
  }

  await user.save();

  logger.info(`User ${user._id} added to workshop ${workshop._id} as ${role}`);

  return sendResponse(res, 200, "Employee added successfully", user);
});

// Feature 2: remove an employee from the workshop roster (reverts them to a
// plain CUSTOMER account).
const removeEmployee = asyncHandler(async (req, res) => {
  const { employeeId } = req.params;

  const workshop = await Workshop.findById(req.params.id);
  if (!workshop) {
    throw new ApiError(404, "Workshop not found.");
  }

  const user = await User.findById(employeeId);
  if (!user || !user.workshop || user.workshop.toString() !== workshop._id.toString()) {
    throw new ApiError(404, "Employee not found at this workshop.");
  }

  if (workshop.manager && workshop.manager.toString() === employeeId) {
    throw new ApiError(
      400,
      "Cannot remove the workshop manager this way — assign a new manager instead.",
    );
  }

  user.workshop = null;
  user.role = "CUSTOMER";
  await user.save();

  logger.info(`User ${employeeId} removed from workshop ${workshop._id}`);

  return sendResponse(res, 200, "Employee removed successfully", user);
});

// Feature 2: list everyone (manager + employees) scoped to this workshop.
const getWorkshopEmployees = asyncHandler(async (req, res) => {
  const employees = await User.find({ workshop: req.params.id }).select(
    "firstName lastName email phone role profilePicture isBlocked createdAt",
  );

  return sendResponse(res, 200, "Employees fetched successfully", employees);
});

export {
  getAllWorkshops,
  getWorkshopById,
  createWorkshop,
  updateWorkshop,
  assignManager,
  addEmployee,
  removeEmployee,
  getWorkshopEmployees,
};

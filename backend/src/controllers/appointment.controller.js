import { asyncHandler } from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import logger from "../utils/logger.js";
import sendResponse from "../helpers/response.js";
import Appointment from "../models/appointment.model.js";
import Workshop from "../models/workshop.model.js";
import Service from "../models/service.model.js";
import User from "../models/user.model.js";
import Notification from "../models/notification.model.js";
import {
  sendAppointmentConfirmationEmail,
  sendAppointmentStatusEmail,
  sendInvoiceEmail,
} from "../config/mailer.js";
import { buildInvoicePdf, generateInvoiceNumber } from "../utils/invoice.js";

// A WORKSHOP_MANAGER may only act on appointments booked at their own
// workshop (feature 5/6). ADMIN can act on any appointment.
const assertCanManageAppointment = (req, workshopId) => {
  if (req.user.role === "ADMIN") return;

  if (req.user.role !== "WORKSHOP_MANAGER") {
    throw new ApiError(403, "You are not allowed to do this.");
  }

  if (!req.user.workshop || req.user.workshop.toString() !== workshopId.toString()) {
    throw new ApiError(403, "You can only manage appointments for your own workshop.");
  }
};

const bookAppointment = asyncHandler(async (req, res) => {
  const {
    workshopId,
    serviceIds,
    vehicle,
    appointmentDate,
    timeSlot,
    contactPhone,
    notes,
  } = req.body;

  const workshop = await Workshop.findById(workshopId);
  if (!workshop) {
    throw new ApiError(404, "Workshop not found.");
  }

  if (!workshop.isActive || workshop.status !== "Open") {
    throw new ApiError(400, "This workshop is not currently accepting appointments.");
  }

  if (!Array.isArray(serviceIds) || serviceIds.length === 0) {
    throw new ApiError(400, "At least one service must be selected.");
  }

  const workshopServiceIds = new Set(
    (workshop.services || []).map((id) => id.toString()),
  );
  const notOfferedHere = serviceIds.filter(
    (id) => !workshopServiceIds.has(id.toString()),
  );
  if (notOfferedHere.length > 0) {
    throw new ApiError(
      400,
      "One or more selected services are not offered at this workshop.",
    );
  }

  const services = await Service.find({
    _id: { $in: serviceIds },
    isActive: true,
  });

  if (services.length !== serviceIds.length) {
    throw new ApiError(
      400,
      "One or more selected services are invalid or unavailable.",
    );
  }

  const existing = await Appointment.findOne({
    workshop: workshopId,
    appointmentDate,
    timeSlot,
    user: req.user._id,
    status: { $in: ["PENDING", "CONFIRMED"] },
  });

  if (existing) {
    throw new ApiError(
      409,
      "You already have an appointment for this workshop at this date and time slot.",
    );
  }

  // Feature 4: estimate pricing at booking time — sum of each selected
  // service's starting price. Shown to the customer immediately and
  // emailed in the confirmation below.
  const estimatedCost = services.reduce(
    (total, service) => total + (service.startingPrice || 0),
    0,
  );

  let appointment;
  try {
    appointment = await Appointment.create({
      user: req.user._id,
      workshop: workshopId,
      services: serviceIds,
      vehicle,
      appointmentDate,
      timeSlot,
      contactPhone,
      notes,
      estimatedCost,
      statusHistory: [{ status: "PENDING", changedBy: req.user._id }],
    });
  } catch (error) {
    if (error.code === 11000) {
      throw new ApiError(
        409,
        "You already have an appointment for this workshop at this date and time slot.",
      );
    }
    throw error;
  }

  logger.info(
    `Appointment ${appointment._id} booked by user ${req.user._id} at workshop ${workshopId}`,
  );

  // Feature 1: confirmation email after a successful booking. Best-effort —
  // a failed email should never fail the booking itself.
  try {
    await sendAppointmentConfirmationEmail({
      to: req.user.email,
      name: req.user.firstName,
      appointment,
      workshopName: workshop.name,
      serviceNames: services.map((s) => s.name),
    });
  } catch (error) {
    logger.error(`Failed to send booking confirmation email: ${error.message}`);
  }

  // Feature 3: notify the workshop's manager dashboard that a new
  // appointment has come in. Best-effort — a failed notification should
  // never fail the booking itself.
  try {
    await Notification.create({
      workshop: workshopId,
      appointment: appointment._id,
      type: "NEW_APPOINTMENT",
      message: `${req.user.firstName} ${req.user.lastName} booked ${services
        .map((s) => s.name)
        .join(", ")} for ${appointment.appointmentDate.toDateString()} at ${timeSlot}.`,
    });
  } catch (error) {
    logger.error(`Failed to create booking notification: ${error.message}`);
  }

  return sendResponse(res, 201, "Appointment booked successfully", appointment);
});

// Used by the frontend's admin/ManageBookings.jsx page. Restricted to
// ADMIN/WORKSHOP_MANAGER via the "authorize" middleware on the route. A
// WORKSHOP_MANAGER only ever sees their own workshop's appointments.
const getAllAppointments = asyncHandler(async (req, res) => {
  const { status, workshop } = req.query;

  const filter = {};
  if (status) filter.status = status;

  if (req.user.role === "WORKSHOP_MANAGER") {
    if (!req.user.workshop) {
      return sendResponse(res, 200, "Appointments fetched successfully", []);
    }
    filter.workshop = req.user.workshop;
  } else if (workshop) {
    filter.workshop = workshop;
  }

  const appointments = await Appointment.find(filter)
    .populate("user", "firstName lastName email phone")
    .populate("workshop", "name location image status isActive manager")
    .populate("services", "name category startingPrice estimatedTime icon")
    .sort({ createdAt: -1 });

  return sendResponse(
    res,
    200,
    "Appointments fetched successfully",
    appointments,
  );
});

// Used by the frontend's MyBookings.jsx page.
const getMyAppointments = asyncHandler(async (req, res) => {
  const appointments = await Appointment.find({ user: req.user._id })
    .populate("workshop", "name location image status isActive")
    .populate("services", "name category startingPrice estimatedTime icon")
    .sort({ createdAt: -1 });

  return sendResponse(
    res,
    200,
    "Appointments fetched successfully",
    appointments,
  );
});

// Used by the frontend's booking detail view.
const getAppointmentById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const appointment = await Appointment.findById(id)
    .populate("workshop", "name location image status isActive manager")
    .populate("services", "name category startingPrice estimatedTime icon");

  if (!appointment) {
    throw new ApiError(404, "Appointment not found.");
  }

  const isOwner = appointment.user.toString() === req.user._id.toString();
  const isAdmin = req.user.role === "ADMIN";
  const isOwnWorkshopManager =
    req.user.role === "WORKSHOP_MANAGER" &&
    req.user.workshop &&
    req.user.workshop.toString() === appointment.workshop._id.toString();

  if (!isOwner && !isAdmin && !isOwnWorkshopManager) {
    throw new ApiError(403, "You are not allowed to view this appointment.");
  }

  return sendResponse(
    res,
    200,
    "Appointment fetched successfully",
    appointment,
  );
});

// Used by the frontend's MyBookings.jsx cancel action.
const cancelAppointment = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { cancelReason } = req.body;

  const appointment = await Appointment.findById(id);

  if (!appointment) {
    throw new ApiError(404, "Appointment not found.");
  }

  const isOwner = appointment.user.toString() === req.user._id.toString();

  if (!isOwner) {
    // Feature 5/6: only the appointment's own workshop manager (or admin)
    // can act on someone else's appointment.
    assertCanManageAppointment(req, appointment.workshop);
  }

  if (!["PENDING", "CONFIRMED"].includes(appointment.status)) {
    throw new ApiError(
      400,
      `This appointment can no longer be cancelled (status: ${appointment.status}).`,
    );
  }

  appointment.status = "CANCELLED";
  appointment.cancelReason = cancelReason || null;
  appointment.cancelledBy = req.user._id;
  appointment.statusHistory.push({
    status: "CANCELLED",
    changedBy: req.user._id,
    note: cancelReason || "",
  });
  await appointment.save();

  logger.info(`Appointment ${appointment._id} cancelled by user ${req.user._id}`);

  return sendResponse(res, 200, "Appointment cancelled successfully", appointment);
});

// Feature 5/6: only the workshop manager of the appointment's own workshop
// (or an admin) can move a repair through its status lifecycle. Sends a
// progress-update email each time (feature 1), and on COMPLETED generates +
// emails the invoice (feature 4).
const updateAppointmentStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status, note, finalCost } = req.body;

  const VALID_STATUSES = ["PENDING", "CONFIRMED", "IN_PROGRESS", "COMPLETED", "CANCELLED"];
  if (!VALID_STATUSES.includes(status)) {
    throw new ApiError(400, "Invalid status value.");
  }

  const appointment = await Appointment.findById(id)
    .populate("workshop", "name location")
    .populate("services", "name category startingPrice estimatedTime icon");

  if (!appointment) {
    throw new ApiError(404, "Appointment not found.");
  }

  assertCanManageAppointment(req, appointment.workshop._id);

  if (appointment.status === "COMPLETED" || appointment.status === "CANCELLED") {
    throw new ApiError(
      400,
      `This appointment is already ${appointment.status.toLowerCase()} and cannot be updated further.`,
    );
  }

  if (status === "IN_PROGRESS") {
    if (appointment.status !== "CONFIRMED") {
      throw new ApiError(400, "A confirmed appointment must be moved into progress next.");
    }
    if (appointment.estimatePayment?.status !== "PAID") {
      throw new ApiError(
        400,
        "The customer must pay the estimated amount before the repair can start.",
      );
    }
  }

  if (status === "COMPLETED") {
    if (appointment.status !== "IN_PROGRESS") {
      throw new ApiError(400, "The repair must be IN_PROGRESS before it can be completed.");
    }
    if (appointment.estimatePayment?.status !== "PAID") {
      throw new ApiError(400, "The estimated amount must be paid before completion.");
    }
    const suppliedFinalCost =
      finalCost !== undefined && finalCost !== null && finalCost !== ""
        ? Number(finalCost)
        : appointment.finalCost ?? appointment.estimatedCost ?? 0;

    if (!Number.isFinite(suppliedFinalCost) || suppliedFinalCost < 0) {
      throw new ApiError(400, "Final cost must be a valid non-negative number.");
    }

    appointment.finalCost = suppliedFinalCost;
  }

  appointment.status = status;
  appointment.statusHistory.push({
    status,
    changedBy: req.user._id,
    note: note || "",
  });

  // The final invoice is deliberately NOT generated here. The remaining
  // balance must be paid through Razorpay first; the invoice is generated
  // after successful final payment verification.
  await appointment.save();

  const customer = await User.findById(appointment.user);

  try {
    if (customer) {
      await sendAppointmentStatusEmail({
        to: customer.email,
        name: customer.firstName,
        appointment,
        workshopName: appointment.workshop.name,
        newStatus: status,
        note,
      });
    }
  } catch (error) {
    logger.error(`Failed to send status email: ${error.message}`);
  }

  logger.info(
    `Appointment ${appointment._id} status set to ${status} by user ${req.user._id}`,
  );

  return sendResponse(res, 200, "Appointment status updated successfully", appointment);
});

// Feature 4: download the invoice PDF for a completed appointment. Owner,
// the appointment's own workshop manager, or an admin may fetch it.
const getAppointmentInvoice = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const appointment = await Appointment.findById(id)
    .populate("workshop", "name location manager")
    .populate("services", "name category startingPrice estimatedTime icon");

  if (!appointment) {
    throw new ApiError(404, "Appointment not found.");
  }

  const isOwner = appointment.user.toString() === req.user._id.toString();
  if (!isOwner) {
    assertCanManageAppointment(req, appointment.workshop._id);
  }

  if (appointment.status !== "COMPLETED") {
    throw new ApiError(400, "The invoice is only available once the repair is completed.");
  }

  if (appointment.finalPayment?.status !== "PAID") {
    throw new ApiError(400, "Please complete the final payment before downloading the invoice.");
  }

  const customer = await User.findById(appointment.user);

  const buffer = await buildInvoicePdf({
    appointment,
    user: customer,
    workshop: appointment.workshop,
    services: appointment.services,
  });

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename="${appointment.invoiceNumber || "invoice"}.pdf"`,
  );
  return res.status(200).send(buffer);
});

export {
  bookAppointment,
  getAllAppointments,
  getMyAppointments,
  getAppointmentById,
  cancelAppointment,
  updateAppointmentStatus,
  getAppointmentInvoice,
};

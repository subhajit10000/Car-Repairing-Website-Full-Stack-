import { asyncHandler } from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import sendResponse from "../helpers/response.js";
import Appointment from "../models/appointment.model.js";
import User from "../models/user.model.js";
import Workshop from "../models/workshop.model.js";
import Message from "../models/message.model.js";
import { uploadBufferToCloudinary } from "../config/cloudinary.js";
import { sendRepairPhotoEmail, sendAdvisorCustomerEmail } from "../config/mailer.js";
import { createRazorpayOrder, verifyRazorpaySignature } from "../config/razorpay.js";
import { buildInvoicePdf, generateInvoiceNumber } from "../utils/invoice.js";
import { sendInvoiceEmail } from "../config/mailer.js";

const getWorkshopAppointments = asyncHandler(async (req, res) => {
  if (!req.user.workshop) return sendResponse(res, 200, "Appointments fetched", []);
  const filter = { workshop: req.user.workshop };
  if (req.user.role === "MECHANIC") filter.assignedMechanic = req.user._id;
  const appointments = await Appointment.find(filter)
    .populate("user", "firstName lastName email phone")
    .populate("workshop", "name location")
    .populate("services", "name startingPrice estimatedTime")
    .populate("assignedMechanic", "firstName lastName email")
    .sort({ appointmentDate: 1, createdAt: -1 });
  return sendResponse(res, 200, "Appointments fetched", appointments);
});

const assignMechanic = asyncHandler(async (req, res) => {
  const { mechanicId } = req.body;
  const appointment = await Appointment.findById(req.params.id);
  if (!appointment) throw new ApiError(404, "Appointment not found.");
  if (req.user.role !== "ADMIN" && appointment.workshop.toString() !== req.user.workshop?.toString()) {
    throw new ApiError(403, "You can only manage your workshop appointments.");
  }
  const mechanic = await User.findOne({ _id: mechanicId, role: "MECHANIC", workshop: appointment.workshop, isBlocked: false });
  if (!mechanic) throw new ApiError(404, "Mechanic not found in this workshop.");
  appointment.assignedMechanic = mechanic._id;
  await appointment.save();
  return sendResponse(res, 200, "Mechanic assigned", appointment);
});

const uploadRepairPhoto = asyncHandler(async (req, res) => {
  const { stage = "AFTER_REPAIR", caption = "" } = req.body;
  if (!["MID_REPAIR", "AFTER_REPAIR"].includes(stage)) throw new ApiError(400, "Invalid repair photo stage.");
  if (!req.file) throw new ApiError(400, "Please select an image.");

  const appointment = await Appointment.findById(req.params.id).populate("workshop", "name");
  if (!appointment) throw new ApiError(404, "Appointment not found.");
  if (req.user.role !== "MECHANIC") throw new ApiError(403, "Only mechanics can upload repair photos.");
  if (!appointment.assignedMechanic || appointment.assignedMechanic.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "You are not assigned to this repair.");
  }

  const result = await uploadBufferToCloudinary(req.file.buffer, { folder: "car-detailing/repair-updates" });
  const photo = { url: result.secure_url, publicId: result.public_id, stage, caption };
  appointment.repairPhotos.push(photo);
  await appointment.save();

  const customer = await User.findById(appointment.user);
  if (customer?.email) {
    try {
      await sendRepairPhotoEmail({
        to: customer.email,
        name: customer.firstName,
        appointment,
        workshopName: appointment.workshop.name,
        photoUrl: result.secure_url,
        stage,
        caption,
      });
    } catch (error) {
      // Upload succeeds even when SMTP is temporarily unavailable.
    }
  }

  return sendResponse(res, 201, "Repair photo uploaded and emailed to customer", photo);
});

const sendAdvisorMessage = asyncHandler(async (req, res) => {
  const { subject, message } = req.body;
  if (!message?.trim()) throw new ApiError(400, "Message is required.");
  if (!req.user.workshop) throw new ApiError(400, "Service advisor is not assigned to a workshop.");

  const appointment = await Appointment.findById(req.params.id).populate("workshop", "name");
  if (!appointment) throw new ApiError(404, "Appointment not found.");
  if (appointment.workshop._id.toString() !== req.user.workshop.toString()) throw new ApiError(403, "Appointment is outside your workshop.");

  const customer = await User.findById(appointment.user);
  if (!customer) throw new ApiError(404, "Customer not found.");
  await sendAdvisorCustomerEmail({
    to: customer.email,
    name: customer.firstName,
    advisorName: `${req.user.firstName} ${req.user.lastName}`,
    workshopName: appointment.workshop.name,
    subject,
    message: message.trim(),
  });
  return sendResponse(res, 200, "Email sent to customer.");
});

// Feature 1: service advisor sends a message (text and/or an image) to the
// customer for a specific appointment. Unlike the plain email above, this is
// persisted so the customer can see the full conversation later from their
// Community page — the email is still sent, best-effort, as a heads-up.
const sendCustomerMessage = asyncHandler(async (req, res) => {
  const { text = "", subject = "" } = req.body;
  const trimmedText = text?.trim() || "";

  if (!trimmedText && !req.file) {
    throw new ApiError(400, "Add a message or an image.");
  }
  if (!req.user.workshop) {
    throw new ApiError(400, "Service advisor is not assigned to a workshop.");
  }

  const appointment = await Appointment.findById(req.params.id).populate("workshop", "name");
  if (!appointment) throw new ApiError(404, "Appointment not found.");
  if (appointment.workshop._id.toString() !== req.user.workshop.toString()) {
    throw new ApiError(403, "Appointment is outside your workshop.");
  }

  let image = { url: "", publicId: "" };
  if (req.file) {
    const result = await uploadBufferToCloudinary(req.file.buffer, {
      folder: "car-detailing/messages",
    });
    image = { url: result.secure_url, publicId: result.public_id };
  }

  const savedMessage = await Message.create({
    appointment: appointment._id,
    workshop: appointment.workshop._id,
    sender: req.user._id,
    recipient: appointment.user,
    text: trimmedText,
    image,
  });

  const customer = await User.findById(appointment.user);
  if (customer?.email) {
    try {
      await sendAdvisorCustomerEmail({
        to: customer.email,
        name: customer.firstName,
        advisorName: `${req.user.firstName} ${req.user.lastName}`,
        workshopName: appointment.workshop.name,
        subject,
        message: trimmedText || "Sent you a photo update — check the Community tab to view it.",
        imageUrl: image.url || null,
      });
    } catch (error) {
      // Message is already saved and visible in-app even if SMTP is down.
    }
  }

  const populated = await savedMessage.populate("sender", "firstName lastName role profilePicture");

  return sendResponse(res, 201, "Message sent", populated);
});

// Feature 1: full message thread for one appointment. Available to the
// customer who owns it, the workshop's own SERVICE_ADVISOR/WORKSHOP_MANAGER,
// and any ADMIN.
const getConversation = asyncHandler(async (req, res) => {
  const appointment = await Appointment.findById(req.params.id);
  if (!appointment) throw new ApiError(404, "Appointment not found.");

  const isOwner = appointment.user.toString() === req.user._id.toString();
  const isAdmin = req.user.role === "ADMIN";
  const isStaffHere =
    ["WORKSHOP_MANAGER", "SERVICE_ADVISOR"].includes(req.user.role) &&
    req.user.workshop &&
    req.user.workshop.toString() === appointment.workshop.toString();

  if (!isOwner && !isAdmin && !isStaffHere) {
    throw new ApiError(403, "You are not allowed to view this conversation.");
  }

  const messages = await Message.find({ appointment: appointment._id })
    .populate("sender", "firstName lastName role profilePicture")
    .sort({ createdAt: 1 });

  return sendResponse(res, 200, "Conversation fetched", messages);
});

// Feature 1: every message addressed to the logged-in customer, across every
// appointment/workshop — the data source for the "Community" sidebar page.
const getMyConversations = asyncHandler(async (req, res) => {
  const messages = await Message.find({ recipient: req.user._id })
    .populate("sender", "firstName lastName role profilePicture")
    .populate("workshop", "name")
    .populate("appointment", "vehicle appointmentDate status")
    .sort({ createdAt: -1 });

  return sendResponse(res, 200, "Messages fetched", messages);
});

const createPaymentOrder = asyncHandler(async (req, res) => {
  const { stage = "ESTIMATE" } = req.body;
  if (!["ESTIMATE", "FINAL"].includes(stage)) {
    throw new ApiError(400, "stage must be ESTIMATE or FINAL.");
  }

  const appointment = await Appointment.findById(req.params.id);
  if (!appointment) throw new ApiError(404, "Appointment not found.");
  if (appointment.user.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "You can only pay your own appointment.");
  }

  let amount;
  let payment;
  if (stage === "ESTIMATE") {
    if (appointment.status === "CANCELLED") throw new ApiError(400, "Cancelled appointments cannot be paid.");
    if (appointment.estimatePayment?.status === "PAID") {
      return sendResponse(res, 200, "Estimated amount is already paid.", {
        stage,
        alreadyPaid: true,
        payment: appointment.estimatePayment,
      });
    }
    amount = Number(appointment.estimatedCost || 0);
    payment = appointment.estimatePayment;
  } else {
    if (appointment.status !== "COMPLETED") {
      throw new ApiError(400, "Final payment is available only after the repair is completed.");
    }
    if (appointment.finalPayment?.status === "PAID") {
      return sendResponse(res, 200, "Final payment is already paid.", {
        stage,
        alreadyPaid: true,
        payment: appointment.finalPayment,
      });
    }

    const estimatedPaid = Number(appointment.estimatePayment?.amount || appointment.estimatedCost || 0);
    amount = Math.max(Number(appointment.finalCost || 0) - estimatedPaid, 0);
    payment = appointment.finalPayment;
  }

  if (amount <= 0) {
    payment.status = "PAID";
    payment.amount = 0;
    payment.method = "NO_BALANCE";
    payment.paidAt = new Date();
    await appointment.save();

    if (stage === "FINAL") {
      await generateAndEmailInvoice(appointment);
    }

    return sendResponse(res, 200, "No payment is due for this stage.", {
      stage,
      alreadyPaid: true,
      payment,
    });
  }

  const order = await createRazorpayOrder({
    amount: amount * 100,
    receipt: `cd_${appointment._id}_${stage.toLowerCase()}_${Date.now()}`,
    notes: {
      appointmentId: appointment._id.toString(),
      paymentStage: stage,
    },
  });

  payment.amount = amount;
  payment.orderId = order.id;
  payment.status = "PENDING";
  await appointment.save();

  return sendResponse(res, 201, "Razorpay order created", {
    stage,
    amount,
    currency: "INR",
    orderId: order.id,
    keyId: order.key_id,
    appointmentId: appointment._id,
  });
});

const generateAndEmailInvoice = async (appointmentIdOrDocument) => {
  const appointment =
    typeof appointmentIdOrDocument === "object" && appointmentIdOrDocument._id
      ? appointmentIdOrDocument
      : await Appointment.findById(appointmentIdOrDocument)
          .populate("workshop", "name location")
          .populate("services", "name category startingPrice estimatedTime icon");

  if (!appointment.invoiceNumber) {
    appointment.invoiceNumber = generateInvoiceNumber(appointment);
    appointment.invoiceGeneratedAt = new Date();
    await appointment.save();
  }

  const customer = await User.findById(appointment.user);
  if (!customer) return;

  const populated =
    appointment.workshop?.name
      ? appointment
      : await Appointment.findById(appointment._id)
          .populate("workshop", "name location")
          .populate("services", "name category startingPrice estimatedTime icon");

  const invoiceBuffer = await buildInvoicePdf({
    appointment: populated,
    user: customer,
    workshop: populated.workshop,
    services: populated.services,
  });

  await sendInvoiceEmail({
    to: customer.email,
    name: customer.firstName,
    appointment: populated,
    workshopName: populated.workshop.name,
    serviceNames: populated.services.map((s) => s.name),
    attachmentBuffer: invoiceBuffer,
  });
};

const verifyPayment = asyncHandler(async (req, res) => {
  const {
    stage = "ESTIMATE",
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
  } = req.body;

  if (!["ESTIMATE", "FINAL"].includes(stage)) {
    throw new ApiError(400, "stage must be ESTIMATE or FINAL.");
  }
  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    throw new ApiError(400, "Razorpay payment verification details are required.");
  }

  const appointment = await Appointment.findById(req.params.id);
  if (!appointment) throw new ApiError(404, "Appointment not found.");
  if (appointment.user.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "You can only pay your own appointment.");
  }

  const payment = stage === "ESTIMATE"
    ? appointment.estimatePayment
    : appointment.finalPayment;

  if (payment?.orderId !== razorpay_order_id) {
    throw new ApiError(400, "This Razorpay order does not belong to this payment.");
  }

  let valid = false;
  try {
    valid = verifyRazorpaySignature({
      orderId: razorpay_order_id,
      paymentId: razorpay_payment_id,
      signature: razorpay_signature,
    });
  } catch (error) {
    throw new ApiError(500, error.message);
  }

  if (!valid) {
    payment.status = "FAILED";
    await appointment.save();
    throw new ApiError(400, "Invalid Razorpay payment signature.");
  }

  payment.status = "PAID";
  payment.paymentId = razorpay_payment_id;
  payment.signature = razorpay_signature;
  payment.method = "RAZORPAY_TEST";
  payment.paidAt = new Date();

  if (stage === "FINAL") {
    appointment.payment = {
      status: "PAID",
      method: "RAZORPAY_TEST",
      transactionId: razorpay_payment_id,
      paidAt: payment.paidAt,
    };
  }

  await appointment.save();

  if (stage === "FINAL") {
    try {
      await generateAndEmailInvoice(appointment._id);
    } catch (error) {
      // Payment is already verified; invoice/email can be retried separately.
    }
  }

  return sendResponse(res, 200, "Payment verified successfully", {
    stage,
    payment,
    invoiceGenerated: stage === "FINAL",
  });
});

const submitFeedback = asyncHandler(async (req, res) => {
  const { rating, comment = "" } = req.body;
  const numericRating = Number(rating);
  if (!Number.isInteger(numericRating) || numericRating < 1 || numericRating > 5) throw new ApiError(400, "Rating must be an integer from 1 to 5.");
  const appointment = await Appointment.findById(req.params.id);
  if (!appointment) throw new ApiError(404, "Appointment not found.");
  if (appointment.user.toString() !== req.user._id.toString()) throw new ApiError(403, "You can only review your own repair.");
  if (appointment.status !== "COMPLETED") throw new ApiError(400, "Feedback is available after the repair is completed.");
  if (appointment.feedback?.rating) throw new ApiError(409, "Feedback has already been submitted for this repair.");

  appointment.feedback = { rating: numericRating, comment: comment.trim(), submittedAt: new Date() };
  await appointment.save();

  const stats = await Appointment.aggregate([
    { $match: { workshop: appointment.workshop, "feedback.rating": { $ne: null } } },
    { $group: { _id: "$workshop", avg: { $avg: "$feedback.rating" }, count: { $sum: 1 } } },
  ]);
  const stat = stats[0];
  if (stat) await Workshop.findByIdAndUpdate(appointment.workshop, { rating: Math.round(stat.avg * 10) / 10, reviews: stat.count });

  return sendResponse(res, 201, "Feedback submitted", appointment.feedback);
});

export {
  getWorkshopAppointments,
  assignMechanic,
  uploadRepairPhoto,
  sendAdvisorMessage,
  sendCustomerMessage,
  getConversation,
  getMyConversations,
  createPaymentOrder,
  verifyPayment,
  submitFeedback,
};

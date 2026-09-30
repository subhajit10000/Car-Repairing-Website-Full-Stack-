import { asyncHandler } from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import sendResponse from "../helpers/response.js";
import Message from "../models/message.model.js";
import Appointment from "../models/appointment.model.js";
import { uploadBufferToCloudinary } from "../config/cloudinary.js";
import { sendAdvisorCustomerEmail } from "../config/mailer.js";

// Anyone tied to the appointment (its customer, the workshop's own
// SERVICE_ADVISOR/WORKSHOP_MANAGER, or an ADMIN) may read/send in this
// conversation. Everyone else is rejected.
const assertCanAccessConversation = (req, appointment) => {
  const isOwner = appointment.user.toString() === req.user._id.toString();
  if (isOwner) return;
  if (req.user.role === "ADMIN") return;
  if (["WORKSHOP_MANAGER", "SERVICE_ADVISOR"].includes(req.user.role)) {
    if (req.user.workshop && req.user.workshop.toString() === appointment.workshop.toString()) {
      return;
    }
  }
  throw new ApiError(403, "You are not part of this conversation.");
};

// GET /messages/appointment/:id — full thread for one repair.
const getConversation = asyncHandler(async (req, res) => {
  const appointment = await Appointment.findById(req.params.id);
  if (!appointment) throw new ApiError(404, "Appointment not found.");

  assertCanAccessConversation(req, appointment);

  const messages = await Message.find({ appointment: appointment._id })
    .populate("sender", "firstName lastName role profilePicture")
    .sort({ createdAt: 1 });

  // Customer viewing their own thread marks staff messages as read.
  if (appointment.user.toString() === req.user._id.toString()) {
    await Message.updateMany(
      { appointment: appointment._id, senderRole: { $ne: "CUSTOMER" }, readByCustomer: false },
      { $set: { readByCustomer: true } },
    );
  }

  return sendResponse(res, 200, "Conversation fetched successfully", messages);
});

// POST /messages/appointment/:id — send a text and/or image message.
// SERVICE_ADVISOR/WORKSHOP_MANAGER messages also best-effort email the
// customer, same as the original advisor-email feature.
const sendMessage = asyncHandler(async (req, res) => {
  const { text = "" } = req.body;
  if (!text.trim() && !req.file) {
    throw new ApiError(400, "Message text or an image is required.");
  }

  const appointment = await Appointment.findById(req.params.id).populate("workshop", "name");
  if (!appointment) throw new ApiError(404, "Appointment not found.");

  assertCanAccessConversation(req, appointment);

  let image = { url: "", publicId: "" };
  if (req.file) {
    const result = await uploadBufferToCloudinary(req.file.buffer, {
      folder: "car-detailing/messages",
    });
    image = { url: result.secure_url, publicId: result.public_id };
  }

  const message = await Message.create({
    appointment: appointment._id,
    workshop: appointment.workshop._id,
    sender: req.user._id,
    senderRole: req.user.role,
    text: text.trim(),
    image,
  });

  if (req.user.role !== "CUSTOMER") {
    const Customer = (await import("../models/user.model.js")).default;
    const customer = await Customer.findById(appointment.user);
    if (customer?.email) {
      try {
        await sendAdvisorCustomerEmail({
          to: customer.email,
          name: customer.firstName,
          advisorName: `${req.user.firstName} ${req.user.lastName}`,
          workshopName: appointment.workshop.name,
          subject: "New message about your repair",
          message: text.trim() || "Your service advisor shared a photo with you — open the Community tab to view it.",
        });
      } catch (error) {
        // Best-effort — the in-app message already succeeded.
      }
    }
  }

  await message.populate("sender", "firstName lastName role profilePicture");

  return sendResponse(res, 201, "Message sent successfully", message);
});

// GET /messages/my — CUSTOMER only. One row per appointment that has at
// least one message, newest activity first, for the Community sidebar.
const getMyConversations = asyncHandler(async (req, res) => {
  const myAppointments = await Appointment.find({ user: req.user._id })
    .populate("workshop", "name location image")
    .populate("services", "name");

  const summaries = (
    await Promise.all(
      myAppointments.map(async (appointment) => {
        const [lastMessage, unreadCount] = await Promise.all([
          Message.findOne({ appointment: appointment._id }).sort({ createdAt: -1 }),
          Message.countDocuments({
            appointment: appointment._id,
            senderRole: { $ne: "CUSTOMER" },
            readByCustomer: false,
          }),
        ]);
        if (!lastMessage) return null; // only show appointments with an active conversation
        return {
          appointment: {
            _id: appointment._id,
            status: appointment.status,
            vehicle: appointment.vehicle,
            workshop: appointment.workshop,
            services: appointment.services,
          },
          lastMessage,
          unreadCount,
        };
      }),
    )
  ).filter(Boolean);

  summaries.sort(
    (a, b) => new Date(b.lastMessage?.createdAt || 0) - new Date(a.lastMessage?.createdAt || 0),
  );

  return sendResponse(res, 200, "Conversations fetched successfully", summaries);
});

export { getConversation, sendMessage, getMyConversations };

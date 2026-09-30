import { asyncHandler } from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import sendResponse from "../helpers/response.js";
import Appointment from "../models/appointment.model.js";
import Conversation from "../models/conversation.model.js";
import User from "../models/user.model.js";
import { uploadBufferToCloudinary } from "../config/cloudinary.js";

const getConversationForAppointment = async (id, user) => {
  const appointment = await Appointment.findById(id).populate("workshop", "name");
  if (!appointment) throw new ApiError(404, "Appointment not found.");

  const allowed =
    appointment.user.toString() === user._id.toString() ||
    (user.role === "SERVICE_ADVISOR" &&
      user.workshop &&
      appointment.workshop._id.toString() === user.workshop.toString()) ||
    (user.role === "WORKSHOP_MANAGER" &&
      user.workshop &&
      appointment.workshop._id.toString() === user.workshop.toString()) ||
    user.role === "ADMIN";

  if (!allowed) throw new ApiError(403, "You are not allowed to access this conversation.");

  let conversation = await Conversation.findOne({ appointment: appointment._id });
  if (!conversation) {
    conversation = await Conversation.create({
      appointment: appointment._id,
      customer: appointment.user,
      workshop: appointment.workshop._id,
    });
  }
  return conversation;
};

const getMyConversations = asyncHandler(async (req, res) => {
  const filter =
    req.user.role === "CUSTOMER"
      ? { customer: req.user._id }
      : req.user.role === "SERVICE_ADVISOR" || req.user.role === "WORKSHOP_MANAGER"
        ? { workshop: req.user.workshop }
        : {};

  const conversations = await Conversation.find(filter)
    .populate("appointment", "appointmentDate timeSlot status vehicle")
    .populate("customer", "firstName lastName email profilePicture")
    .populate("workshop", "name")
    .populate("messages.sender", "firstName lastName role profilePicture")
    .sort({ lastMessageAt: -1, updatedAt: -1 });

  return sendResponse(res, 200, "Conversations fetched", conversations);
});

const getConversation = asyncHandler(async (req, res) => {
  const conversation = await getConversationForAppointment(req.params.appointmentId, req.user);
  await conversation.populate([
    { path: "appointment", select: "appointmentDate timeSlot status vehicle" },
    { path: "customer", select: "firstName lastName email profilePicture" },
    { path: "workshop", select: "name" },
    { path: "messages.sender", select: "firstName lastName role profilePicture" },
  ]);
  return sendResponse(res, 200, "Conversation fetched", conversation);
});

const sendMessage = asyncHandler(async (req, res) => {
  const { text = "" } = req.body;
  const hasText = Boolean(text?.trim());
  const hasImage = Boolean(req.file);
  if (!hasText && !hasImage) throw new ApiError(400, "Message text or an image is required.");

  const conversation = await getConversationForAppointment(req.params.appointmentId, req.user);

  // Customers may reply, but only service advisors/admins/managers may send
  // repair communication initiated by the workshop.
  const image = { url: "", publicId: "", fileName: "" };
  let type = "TEXT";
  if (hasImage) {
    if (!["SERVICE_ADVISOR", "WORKSHOP_MANAGER", "ADMIN"].includes(req.user.role)) {
      throw new ApiError(403, "Only workshop communication staff can send images.");
    }
    const result = await uploadBufferToCloudinary(req.file.buffer, {
      folder: "car-detailing/community",
    });
    image.url = result.secure_url;
    image.publicId = result.public_id;
    image.fileName = req.file.originalname || "repair-image";
    type = "IMAGE";
  }

  conversation.messages.push({
    sender: req.user._id,
    senderRole: req.user.role,
    type,
    text: hasText ? text.trim() : "",
    image,
  });
  conversation.lastMessageAt = new Date();
  await conversation.save();

  const updated = await Conversation.findById(conversation._id)
    .populate("appointment", "appointmentDate timeSlot status vehicle")
    .populate("customer", "firstName lastName email profilePicture")
    .populate("workshop", "name")
    .populate("messages.sender", "firstName lastName role profilePicture");

  return sendResponse(res, 201, "Message sent", updated);
});

export { getMyConversations, getConversation, sendMessage };

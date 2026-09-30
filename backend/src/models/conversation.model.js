import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    sender: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    senderRole: {
      type: String,
      enum: ["CUSTOMER", "SERVICE_ADVISOR", "WORKSHOP_MANAGER", "ADMIN"],
      required: true,
    },
    type: { type: String, enum: ["TEXT", "IMAGE"], default: "TEXT" },
    text: { type: String, trim: true, default: "" },
    image: {
      url: { type: String, default: "" },
      publicId: { type: String, default: "" },
      fileName: { type: String, default: "" },
    },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: true },
);

const conversationSchema = new mongoose.Schema(
  {
    appointment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Appointment",
      required: true,
      unique: true,
      index: true,
    },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    workshop: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Workshop",
      required: true,
      index: true,
    },
    messages: { type: [messageSchema], default: [] },
    lastMessageAt: { type: Date, default: null, index: true },
  },
  { timestamps: true },
);

const Conversation = mongoose.model("Conversation", conversationSchema);
export default Conversation;

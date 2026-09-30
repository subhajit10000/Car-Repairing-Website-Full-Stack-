import mongoose from "mongoose";

// Feature: persisted service-advisor <-> customer conversation, scoped to a
// single appointment. Lets a customer see the full thread (including any
// images) in their "Community" page instead of only ever getting it by
// email — see controllers/stakeholder.controller.js.
const messageSchema = new mongoose.Schema(
  {
    appointment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Appointment",
      required: true,
      index: true,
    },

    workshop: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Workshop",
      required: true,
      index: true,
    },

    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    text: {
      type: String,
      trim: true,
      default: "",
    },

    image: {
      url: { type: String, default: "" },
      publicId: { type: String, default: "" },
    },
  },
  {
    timestamps: true,
  }
);

messageSchema.pre("validate", function (next) {
  if (!this.text?.trim() && !this.image?.url) {
    return next(new Error("A message needs either text or an image."));
  }
  next();
});

const Message = mongoose.model("Message", messageSchema);

export default Message;

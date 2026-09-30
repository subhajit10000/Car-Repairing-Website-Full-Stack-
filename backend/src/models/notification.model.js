import mongoose from "mongoose";

// Feature: lets a workshop manager's dashboard show a notification whenever
// a customer books an appointment at their workshop — see
// controllers/appointment.controller.js (bookAppointment) and
// controllers/notification.controller.js.
const notificationSchema = new mongoose.Schema(
  {
    workshop: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Workshop",
      required: true,
      index: true,
    },

    appointment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Appointment",
      default: null,
    },

    type: {
      type: String,
      enum: ["NEW_APPOINTMENT"],
      default: "NEW_APPOINTMENT",
    },

    message: {
      type: String,
      required: true,
      trim: true,
    },

    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

const Notification = mongoose.model("Notification", notificationSchema);

export default Notification;

import mongoose from "mongoose";

const appointmentSchema = new mongoose.Schema(
  {
    user: {
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

    services: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Service",
        required: true,
      },
    ],

    vehicle: {
      make: {
        type: String,
        required: true,
        trim: true,
      },
      model: {
        type: String,
        required: true,
        trim: true,
      },
      year: {
        type: Number,
      },
      regNumber: {
        type: String,
        required: true,
        trim: true,
        uppercase: true,
      },
    },

    appointmentDate: {
      type: Date,
      required: true,
      index: true,
    },

    timeSlot: {
      type: String,
      required: true,
      trim: true,
    },

    contactPhone: {
      type: String,
      required: true,
      trim: true,
    },

    notes: {
      type: String,
      trim: true,
      default: "",
    },

    status: {
      type: String,
      enum: ["PENDING", "CONFIRMED", "IN_PROGRESS", "COMPLETED", "CANCELLED"],
      default: "PENDING",
      index: true,
    },

    // Snapshot of the sum of each selected service's startingPrice, taken at
    // booking time (see controllers/appointment.controller.js bookAppointment).
    estimatedCost: {
      type: Number,
      min: 0,
    },

    // Set by the workshop manager once the repair is complete (or updated
    // mid-repair if the real cost differs from the estimate). Used to
    // generate the invoice — see controllers/appointment.controller.js
    // getAppointmentInvoice.
    finalCost: {
      type: Number,
      min: 0,
      default: null,
    },

    invoiceNumber: {
      type: String,
      default: null,
    },

    invoiceGeneratedAt: {
      type: Date,
      default: null,
    },

    // Every status transition, and who made it — lets a customer see repair
    // progress over time and gives the confirmation/progress emails an
    // audit trail to draw on.
    statusHistory: [
      {
        status: {
          type: String,
          enum: ["PENDING", "CONFIRMED", "IN_PROGRESS", "COMPLETED", "CANCELLED"],
        },
        changedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        changedAt: {
          type: Date,
          default: Date.now,
        },
        note: {
          type: String,
          trim: true,
          default: "",
        },
      },
    ],

    assignedMechanic: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    cancelReason: {
      type: String,
      trim: true,
      default: null,
    },

    cancelledBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    // Two-stage payment lifecycle:
    // 1) the estimated amount must be paid before the repair can enter IN_PROGRESS
    // 2) any remaining balance is paid after COMPLETED.
    estimatePayment: {
      status: { type: String, enum: ["PENDING", "PAID", "FAILED"], default: "PENDING" },
      amount: { type: Number, min: 0, default: 0 },
      orderId: { type: String, default: null },
      paymentId: { type: String, default: null },
      signature: { type: String, default: null },
      method: { type: String, default: null },
      paidAt: { type: Date, default: null },
    },

    finalPayment: {
      status: { type: String, enum: ["PENDING", "PAID", "FAILED"], default: "PENDING" },
      amount: { type: Number, min: 0, default: 0 },
      orderId: { type: String, default: null },
      paymentId: { type: String, default: null },
      signature: { type: String, default: null },
      method: { type: String, default: null },
      paidAt: { type: Date, default: null },
    },

    // Kept for backwards compatibility with older records/front-end code.
    payment: {
      status: { type: String, enum: ["PENDING", "PAID", "FAILED"], default: "PENDING" },
      method: { type: String, default: null },
      transactionId: { type: String, default: null },
      paidAt: { type: Date, default: null },
    },

    feedback: {
      rating: { type: Number, min: 1, max: 5, default: null },
      comment: { type: String, maxlength: 1000, default: "" },
      submittedAt: { type: Date, default: null },
    },

    repairPhotos: [{
      url: { type: String, required: true },
      publicId: { type: String, default: "" },
      stage: { type: String, enum: ["MID_REPAIR", "AFTER_REPAIR"], default: "AFTER_REPAIR" },
      caption: { type: String, default: "" },
      uploadedAt: { type: Date, default: Date.now },
    }],
  },
  {
    timestamps: true,
  }
);

// Prevent the same user from double-booking the exact same workshop/date/timeSlot
appointmentSchema.index(
  { user: 1, workshop: 1, appointmentDate: 1, timeSlot: 1 },
  {
    unique: true,
    partialFilterExpression: { status: { $in: ["PENDING", "CONFIRMED"] } },
  }
);

const Appointment = mongoose.model("Appointment", appointmentSchema);

export default Appointment;

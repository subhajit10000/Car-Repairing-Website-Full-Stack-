import mongoose from "mongoose";

const workshopSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },

    image: {
      type: String,
      required: true,
      trim: true,
    },

    location: {
      type: String,
      required: true,
      trim: true,
    },

    distance: {
      type: Number,
      min: 0,
    },

    rating: {
      type: Number,
      min: 0,
      max: 5,
      default: 0,
    },

    reviews: {
      type: Number,
      min: 0,
      default: 0,
    },

    status: {
      type: String,
      enum: ["Open", "Closed"],
      default: "Closed",
    },

    openingTime: {
      type: String,
      required: true,
      trim: true,
    },

    closingTime: {
      type: String,
      required: true,
      trim: true,
    },

    services: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Service",
      },
    ],

    startingPrice: {
      type: Number,
      required: true,
      min: 0,
    },

    nextAvailable: {
      type: String,
      trim: true,
    },

    // The single WORKSHOP_MANAGER responsible for this workshop. Only this
    // user (or an ADMIN) can manage this workshop's services, employees,
    // inventory and appointment statuses — see
    // middlewares/workshopOwnership.middleware.js.
    manager: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
      index: true,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual populate: everyone (manager + SERVICE_ADVISORs + MECHANICs) whose
// User.workshop points at this workshop. There is no stored `employees`
// array on this document — this virtual is what makes
// `.populate("employees")` (see controllers/manager.controller.js) work.
workshopSchema.virtual("employees", {
  ref: "User",
  localField: "_id",
  foreignField: "workshop",
});

const Workshop = mongoose.model("Workshop", workshopSchema);

export default Workshop;

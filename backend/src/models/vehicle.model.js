import mongoose from "mongoose";

const vehicleSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

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

    color: {
      type: String,
      trim: true,
      default: "",
    },

    notes: {
      type: String,
      trim: true,
      default: "",
    },

    // Photo of the vehicle, stored on Cloudinary. See
    // config/cloudinary.js and controllers/vehicle.controller.js
    // (uploadVehicleImage).
    image: {
      url: {
        type: String,
        default: null,
      },
      publicId: {
        type: String,
        default: null,
      },
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// A user shouldn't be able to add the exact same registration number twice.
vehicleSchema.index({ owner: 1, regNumber: 1 }, { unique: true });

const Vehicle = mongoose.model("Vehicle", vehicleSchema);

export default Vehicle;

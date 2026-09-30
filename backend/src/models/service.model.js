import mongoose from "mongoose";

const serviceSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },

    category: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
      trim: true,
    },

    icon: {
      type: String,
      default: "🔧",
      trim: true,
    },

    startingPrice: {
      type: Number,
      required: true,
      min: 0,
    },

    estimatedTime: {
      type: String,
      required: true,
      trim: true,
    },

    availableAt:[
          {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Workshop",
          },
        ],

    includes: [
      {
        type: String,
        trim: true,
      },
    ],

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

const Service = mongoose.model("Service", serviceSchema);

export default Service;
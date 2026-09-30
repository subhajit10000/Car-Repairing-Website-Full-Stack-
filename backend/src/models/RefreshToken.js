import mongoose from "mongoose";

// device information


const refreshTokenSchema = new mongoose.Schema(
    {

        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true
        },

        token: {
            type: String,
            required: true
        },
        expiredAt: {
            type: Date,
            required: true,
            index: {
                expires: 0,
            }
        },

        userAgent: {
            type: String,
            default: "",
        },
        ipAddress: {
            type: String,
            default: ""
        }

    },
    {
        timestamps: true,
    }
);


const refreshToken = mongoose.model("RefreshToken", refreshTokenSchema);

export default refreshToken;
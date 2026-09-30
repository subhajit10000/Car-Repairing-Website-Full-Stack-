import User from "../models/user.model.js";
import  ApiError  from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { verifyAccessToken } from "../utils/jwt.js";
import logger from "../utils/logger.js";

const authMiddleware = asyncHandler(async (req, res, next) => {
    let token;

    const authHeader = req.headers['authorization'];
    if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.split(" ")[1] 
        // token = authHeader.replace("Bearer ","")
    }
    if (!token && req.cookies?.accessToken) {
        token = req.cookies.accessToken;
    }
    if (!token) {
        throw new ApiError(401, "Access token is required")
    }

    const decoded = await verifyAccessToken(token);

    const user = await User.findById(decoded.id);
    logger.info(user);
    if (!user) {
        throw new ApiError(401, "User not found.")
    }
    if (user.isBlocked) {
        throw new ApiError(403, "Your account is blocked.")
    }
    req.user = user;
    next();

})

export default authMiddleware;
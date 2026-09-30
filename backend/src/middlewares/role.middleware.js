import ApiError from "../utils/ApiError.js";


const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return next(
                new ApiError(401, "Unauthorized. Please login first.")
            );
        }



        if (!roles.includes(req.user.role)) {
            return next(
                new ApiError(403, "Unauthorized. You don't have permission.")
            );
        }


        next();
    }
}


export default authorize;
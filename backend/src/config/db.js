import mongoose from "mongoose";

import env from "../config/env.js";
import logger from "../utils/logger.js";
const connectDB = async () => {
    try {
        await mongoose.connect(env.MONGO_URI);

        logger.info('MongoDB Connection done.')


    } catch (error) {
        logger.error(error.message);
        process.exit(1);
    }
}


export default connectDB;
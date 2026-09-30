import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import compression from "compression";
import morgan from "morgan";
import env from "../src/config/env.js";
import authRouter from "./routes/auth.route.js";
// import userRouter from "./routes/user.routes.js"
import { apiLimiter } from "./middlewares/rateLimiter.js";
import errorHandler from "./middlewares/error.middleware.js"
import serviceRouter from "./routes/service.route.js";
import workshopRouter from "./routes/workshop.route.js"
import appointmentRoute from "./routes/appointment.route.js";
import vehicleRoute from "./routes/vehicle.route.js";
import inventoryRoute from "./routes/inventory.route.js";
import userRoute from "./routes/user.route.js";
import stakeholderRoute from "./routes/stakeholder.route.js";
import managerRoute from "./routes/manager.route.js";
import analyticsRoute from "./routes/analytics.route.js";
const App = express();
App.use(helmet()); // security

App.use(
    cors({
        // "*" combined with credentials: true is rejected by browsers, so if
        // CLIENT_URL isn't set (env.CLIENT_URL === undefined), reflect the
        // request's own origin instead of falling back to a wildcard.
        origin: env.CLIENT_URL || true,
        credentials: true,
    })
);
App.use(apiLimiter);
App.use(express.json({ limit: '50kb' }));
App.use(express.urlencoded({ extended: true }))

App.use(cookieParser());
App.use(compression());

if (env.NODE_ENV === "development") {
    App.use(morgan("dev"));
}
App.get('/', (req, res) => {
    res.send('Authentication API running')
})
App.use("/api/v1/auth", authRouter);
App.use("/api/v1/services", serviceRouter);
App.use("/api/v1/workshops", workshopRouter);

App.use("/api/v1/appointments", appointmentRoute);
App.use("/api/v1/vehicles", vehicleRoute);
App.use("/api/v1/users", userRoute);
App.use("/api/v1/stakeholder", stakeholderRoute);
App.use("/api/v1/manager", managerRoute);
App.use("/api/v1/analytics", analyticsRoute);
App.use("/api/v1", inventoryRoute);

App.use((req, res) => {
    res.status(404).json({
        success: false,
        message: "Route not found"
    })
})

App.use(errorHandler);
export default App;

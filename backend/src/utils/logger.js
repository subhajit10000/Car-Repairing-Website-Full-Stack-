import winston from "winston";
import "winston-daily-rotate-file";

const { combine, timestamp, json, errors } = winston.format;

const logFormat = combine(
    errors({ stack: true }),
    timestamp({
        format: () =>
            new Date().toLocaleString("en-IN", {
                timeZone: "Asia/Kolkata",
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
                hour12: true,
            }),
    }),
    json()
);

const logger = winston.createLogger({
    level: process.env.NODE_ENV === "development" ? "debug" : "info",

    format: logFormat,

    transports: [
        new winston.transports.Console(),

        new winston.transports.DailyRotateFile({
            filename: "logs/application-%DATE%.log",
            datePattern: "YYYY-MM-DD",
            maxSize: "1m",
            maxFiles: "14d",
            zippedArchive: true,
        }),
    ],

    exitOnError: false,
});

export default logger;
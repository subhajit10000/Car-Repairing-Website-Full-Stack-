import dotenv from "dotenv";

dotenv.config();

const env = {
    PORT: process.env.PORT || 5001,
    NODE_ENV: process.env.NODE_ENV || "development",

    MONGO_URI: process.env.MONGO_URI,
    ACCESS_TOKEN_SECRET: process.env.ACCESS_TOKEN_SECRET,
    ACCESS_TOKEN_EXPIRES: process.env.ACCESS_TOKEN_EXPIRES || "15m",

    REFRESH_TOKEN_SECRET: process.env.REFRESH_TOKEN_SECRET,
    REFRESH_TOKEN_EXPIRES: process.env.REFRESH_TOKEN_EXPIRES || "7d",


    CRYPTO_SECRET: process.env.CRYPTO_SECRET,
    CRYPTO_ALGORITHM: process.env.CRYPTO_ALGORITHM || "aes-256-cbc",
    CRYPTO_IV: process.env.CRYPTO_IV,

    OTP_LENGTH: process.env.OTP_LENGTH || 6,
    OTP_EXPIRY_MINUTES: process.env.OTP_EXPIRY_MINUTES || 5,

    BCRYPT_SALT_ROUNDS: process.env.BCRYPT_SALT_ROUNDS || 12,
    JWT_AUDIENCE: process.env.JWT_AUDIENCE,
    JWT_ISSUER: process.env.JWT_ISSUER,


    CLIENT_URL: process.env.CLIENT_URL,
}

const REQUIRED_KEYS = [
    "MONGO_URI",
    "ACCESS_TOKEN_SECRET",
    "REFRESH_TOKEN_SECRET",
    "CRYPTO_SECRET",
];

const missing = REQUIRED_KEYS.filter((key) => !env[key]);
if (missing.length > 0) {
    throw new Error(
        `Missing required environment variable(s): ${missing.join(", ")}. ` +
        `Set them in your .env file before starting the server.`
    );
}


if (env.CRYPTO_ALGORITHM === "aes-256-cbc" && Buffer.from(env.CRYPTO_SECRET, "hex").length !== 32) {
    throw new Error(
        "CRYPTO_SECRET must be a 64-character hex string (32 bytes) for aes-256-cbc. " +
        `Got ${env.CRYPTO_SECRET.length} characters.`
    );
}

export default env;

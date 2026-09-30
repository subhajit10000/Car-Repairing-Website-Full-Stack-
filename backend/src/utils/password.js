import bcrypt from "bcryptjs";
import env from "../config/env.js";

const hashPassword = async (password) => {
    return await bcrypt.hash(password, Number(env.BCRYPT_SALT_ROUNDS));
};

const comparePassword = async (password, hashedPassword) => {
    return await bcrypt.compare(password, hashedPassword);
};

export { hashPassword, comparePassword };
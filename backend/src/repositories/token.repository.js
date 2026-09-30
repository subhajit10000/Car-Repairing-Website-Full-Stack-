import RefreshToken from "../models/RefreshToken.js";

const createRefreshToken = async ({ user, token, expiredAt, userAgent, ipAddress }) => {
    return await RefreshToken.create({ user, token, expiredAt, userAgent, ipAddress });
};

const findRefreshToken = async (token) => {
    return await RefreshToken.findOne({ token });
};

const findRefreshTokensByUser = async (userId) => {
    return await RefreshToken.find({ user: userId });
};

const deleteRefreshToken = async (token) => {
    return await RefreshToken.findOneAndDelete({ token });
};

const deleteRefreshTokensByUser = async (userId) => {
    return await RefreshToken.deleteMany({ user: userId });
};

export {
    createRefreshToken,
    findRefreshToken,
    findRefreshTokensByUser,
    deleteRefreshToken,
    deleteRefreshTokensByUser,
};

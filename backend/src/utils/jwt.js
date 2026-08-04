const jwt = require("jsonwebtoken");

if (!process.env.JWT_SECRET) throw new Error("JWT_SECRET env var is required");

const ACCESS_SECRET = process.env.JWT_SECRET;

const signAccess  = (payload, options = {}) => jwt.sign(payload, ACCESS_SECRET, { expiresIn: "7d", ...options });
const verifyAccess = (token) => jwt.verify(token, ACCESS_SECRET);

module.exports = { signAccess, verifyAccess };
const jwt = require("jsonwebtoken");

if (!process.env.JWT_SECRET)         throw new Error("JWT_SECRET env var is required");
if (!process.env.JWT_REFRESH_SECRET) throw new Error("JWT_REFRESH_SECRET env var is required");

const ACCESS_SECRET  = process.env.JWT_SECRET;
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;

const signAccess  = (payload, options = {}) => jwt.sign(payload, ACCESS_SECRET,  { expiresIn: "7d", ...options });
const signRefresh = (payload) => jwt.sign(payload, REFRESH_SECRET, { expiresIn: "30d" });

const verifyAccess  = (token) => jwt.verify(token, ACCESS_SECRET);
const verifyRefresh = (token) => jwt.verify(token, REFRESH_SECRET);

module.exports = { signAccess, signRefresh, verifyAccess, verifyRefresh };
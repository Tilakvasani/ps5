const jwt = require("jsonwebtoken");

const ACCESS_SECRET  = process.env.JWT_SECRET         || "zupwell_access_secret";
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || "zupwell_refresh_secret";

const signAccess  = (payload) => jwt.sign(payload, ACCESS_SECRET,  { expiresIn: "7d"  });
const signRefresh = (payload) => jwt.sign(payload, REFRESH_SECRET, { expiresIn: "30d" });

const verifyAccess  = (token) => jwt.verify(token, ACCESS_SECRET);
const verifyRefresh = (token) => jwt.verify(token, REFRESH_SECRET);

module.exports = { signAccess, signRefresh, verifyAccess, verifyRefresh };

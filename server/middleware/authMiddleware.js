const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  const header = req.header("Authorization");

  if (!header) {
    return res.status(401).json({ message: "Access Denied. No token provided." });
  }

  const token = header.startsWith("Bearer ") ? header.slice(7) : header;

  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    req.user = verified;
    next();
  } catch (error) {
    return res.status(403).json({ message: "Invalid or expired token" });
  }
};

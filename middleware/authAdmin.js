const jwt = require("jsonwebtoken");

const authAdmin = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Authorization token missing" });
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const { user } = decoded;

    // ✅ Hardcoded admin check (mobile = 9999999999 → id = 'admin-static-id')
    if (user.id === "admin-static-id" && user.role === "admin") {
      req.user = user;
      return next();
    }

    // ✅ Normal admin from DB
    if (user.role === "admin") {
      req.user = user;
      return next();
    }

    return res.status(403).json({ message: "Access denied. Admin only." });
  } catch (err) {
    console.error("Admin Auth Error:", err);
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

module.exports = authAdmin;

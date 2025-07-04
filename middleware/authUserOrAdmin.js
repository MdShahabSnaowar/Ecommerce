const jwt = require("jsonwebtoken");

const authUserOrAdmin = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Authorization token missing" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const { user } = decoded;

    // Accept both roles
    if (user.role === "admin" || user.role === "customer") {
      req.user = user;
      return next();
    }


    return res.status(403).json({ message: "Access denied. Not authorized user." });
  } catch (err) {
    console.error("User/Admin Auth Error:", err);
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

module.exports = authUserOrAdmin;

const jwt = require("jsonwebtoken");

// 1. Verify Token Exists & Is Valid
exports.verifyToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  // Expected format: "Bearer <token>"
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "Access denied. No token provided." });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Attach user info to request
    next();
  } catch (err) {
    res.status(403).json({ error: "Invalid token." });
  }
};

// 2. Verify User is Admin
exports.verifyAdmin = (req, res, next) => {
  if (!req.user || !req.user.is_admin) {
    return res.status(403).json({ error: "Access denied. Admins only." });
  }
  next();
};

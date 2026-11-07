const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "super_secret_jwt_key_2026";

/**
 * Verify JWT token from Authorization header (Bearer token)
 */
const verifyToken = (req, res, next) => {
  const authHeader = req.headers["authorization"] || req.headers["Authorization"];

  if (!authHeader) {
    return res.status(401).json({ error: "Access denied. No authorization token provided." });
  }

  try {
    const token = authHeader.startsWith("Bearer ")
      ? authHeader.slice(7).trim()
      : authHeader.trim();

    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // { id, username, role, employeeId, department }
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid or expired token. Please log in again." });
  }
};

/**
 * Role-based access control middleware
 * Example: requireRole(['admin', 'supervisor'])
 */
const requireRole = (allowedRoles = []) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized. Authentication required." });
    }

    const userRole = (req.user.role || "").toLowerCase();
    const normalizedAllowed = allowedRoles.map((r) => r.toLowerCase());

    if (allowedRoles.length > 0 && !normalizedAllowed.includes(userRole)) {
      return res.status(403).json({
        error: `Forbidden. Role '${req.user.role}' does not have sufficient permissions. Allowed roles: ${allowedRoles.join(", ")}`,
      });
    }

    next();
  };
};

module.exports = {
  verifyToken,
  requireRole,
};

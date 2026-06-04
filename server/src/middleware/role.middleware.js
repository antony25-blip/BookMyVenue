// Authorize specific roles
// Usage: authorizeRoles("admin", "venue_owner")
exports.authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Not authenticated",
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Required role: [${roles.join(", ")}]. Your role: ${req.user.role}`,
      });
    }

    next();
  };
};
export const requireRole = (...roles) => (req, res, next) => {
  if (!req.user) return res.status(401).json({ success: false, message: "Not authenticated" });

  // Role hierarchy: higher number -> more privileges
  const rank = { User: 0, Staff: 1, Admin: 2, SuperAdmin: 3 };

  const normalize = (r) => r.charAt(0).toUpperCase() + r.slice(1);
  const requiredRanks = roles.map((r) => rank[normalize(r)]).filter((r) => r !== undefined);
  if (requiredRanks.length === 0) {
    return res.status(500).json({ success: false, message: "Server misconfiguration: invalid role requirement" });
  }

  const minRequiredRank = Math.min(...requiredRanks);
  const userRoleNorm = normalize(req.user.role || "");
  const userRank = rank[userRoleNorm];
  if (userRank === undefined) return res.status(403).json({ success: false, message: "Forbidden: unknown role" });

  // Allow access if user's rank >= minimum required rank (SuperAdmin can access Admin routes)
  if (userRank < minRequiredRank) {
    return res.status(403).json({ success: false, message: "Forbidden: insufficient role" });
  }

  next();
};

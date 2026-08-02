const jwt = require("jsonwebtoken");
const prisma = require("../config/db");

/**
 * Verifies the JWT in the Authorization header and attaches the
 * authenticated user (without passwordHash) to req.user.
 */
async function requireAuth(req, res, next) {
  try {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : null;

    if (!token) {
      return res.status(401).json({ success: false, message: "Authentication required" });
    }

    const payload = jwt.verify(token, process.env.JWT_SECRET);

    const user = await prisma.user.findUnique({ where: { id: payload.sub } });
    if (!user) {
      return res.status(401).json({ success: false, message: "User no longer exists" });
    }

    req.user = { id: user.id, role: user.role, name: user.name, email: user.email };
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: "Invalid or expired token" });
  }
}

/**
 * Restricts a route to one or more roles. Use after requireAuth.
 * Example: router.post("/", requireAuth, requireRole("SHOP_OWNER", "ADMIN"), handler)
 */
function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ success: false, message: "You do not have permission to do this" });
    }
    next();
  };
}

/**
 * Attaches req.user if a valid token is present, but does not
 * reject the request if it's missing — useful for routes that are
 * public but behave differently for logged-in users (e.g. search).
 */
async function optionalAuth(req, _res, next) {
  try {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : null;
    if (!token) return next();

    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await prisma.user.findUnique({ where: { id: payload.sub } });
    if (user) {
      req.user = { id: user.id, role: user.role, name: user.name, email: user.email };
    }
  } catch (_err) {
    // ignore invalid token for optional auth
  }
  next();
}

module.exports = { requireAuth, requireRole, optionalAuth };

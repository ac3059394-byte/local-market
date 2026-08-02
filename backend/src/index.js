require("dotenv").config();

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const xss = require("xss-clean");

const { notFoundHandler, errorHandler } = require("./middleware/errorHandler");

const authRoutes = require("./routes/auth.routes");
const shopRoutes = require("./routes/shop.routes");
const productRoutes = require("./routes/product.routes");
const searchRoutes = require("./routes/search.routes");
const reviewRoutes = require("./routes/review.routes");
const engagementRoutes = require("./routes/engagement.routes");
const categoryRoutes = require("./routes/category.routes");
const adminRoutes = require("./routes/admin.routes");

const app = express();
app.set("trust proxy", 1);

// ---------- Security & core middleware ----------
app.use(helmet());
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    credentials: true,
  })
);
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(xss()); // sanitizes req.body/query/params against XSS payloads
app.use(morgan(process.env.NODE_ENV === "development" ? "dev" : "combined"));

// Global rate limit — tune per-route (e.g. stricter on /auth) as you scale.
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 300,
    standardHeaders: true,
    legacyHeaders: false,
  })
);

// Stricter limiter specifically for auth endpoints (brute-force protection).
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 20 });

// ---------- Health check ----------
app.get("/api/health", (_req, res) => res.json({ success: true, message: "OK" }));

// ---------- Routes ----------
app.use("/api/auth", authLimiter, authRoutes);
app.use("/api/shops", shopRoutes);
app.use("/api/products", productRoutes);
app.use("/api/search", searchRoutes);
app.use("/api", reviewRoutes);       // /api/shops/:shopId/reviews, /api/reviews/:id
app.use("/api", engagementRoutes);   // /api/favorites, /api/reports, /api/inquiries
app.use("/api/categories", categoryRoutes);
app.use("/api/admin", adminRoutes);

// ---------- 404 + error handling (must be last) ----------
app.use(notFoundHandler);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Local Market API running on http://localhost:${PORT}`);
});

module.exports = app;

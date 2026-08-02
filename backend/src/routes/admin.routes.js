const express = require("express");
const { requireAuth, requireRole } = require("../middleware/auth");
const {
  getDashboardStats, listUsers, listReports, resolveReport,
  verifyShop, toggleFeatureShop, setMembershipTier, approveProduct,
} = require("../controllers/adminController");

const router = express.Router();

// Every route below requires an authenticated ADMIN.
router.use(requireAuth, requireRole("ADMIN"));

router.get("/dashboard", getDashboardStats);
router.get("/users", listUsers);
router.get("/reports", listReports);
router.patch("/reports/:id", resolveReport);
router.patch("/shops/:id/verify", verifyShop);
router.patch("/shops/:id/feature", toggleFeatureShop);
router.patch("/shops/:id/membership", setMembershipTier);
router.patch("/products/:id/approve", approveProduct);

module.exports = router;

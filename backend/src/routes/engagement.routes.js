const express = require("express");
const { requireAuth, requireRole } = require("../middleware/auth");
const {
  addFavorite, removeFavorite, getMyFavorites,
  createReport, createInquiry, getShopInquiries,
} = require("../controllers/engagementController");

const router = express.Router();

router.get("/favorites", requireAuth, getMyFavorites);
router.post("/favorites", requireAuth, addFavorite);
router.delete("/favorites/:id", requireAuth, removeFavorite);

router.post("/reports", requireAuth, createReport);

router.post("/inquiries", requireAuth, createInquiry);
router.get("/shops/:shopId/inquiries", requireAuth, requireRole("SHOP_OWNER", "ADMIN"), getShopInquiries);

module.exports = router;

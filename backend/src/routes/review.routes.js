const express = require("express");
const { requireAuth } = require("../middleware/auth");
const { createReview, getShopReviews, deleteReview, likeReview } = require("../controllers/reviewController");

const router = express.Router();

router.get("/shops/:shopId/reviews", getShopReviews);
router.post("/shops/:shopId/reviews", requireAuth, createReview);
router.delete("/reviews/:id", requireAuth, deleteReview);
router.post("/reviews/:id/like", requireAuth, likeReview);

module.exports = router;

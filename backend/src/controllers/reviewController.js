const prisma = require("../config/db");
const { AppError, asyncHandler } = require("../middleware/errorHandler");

// Recalculates a shop's averageRating and reviewCount after a review changes.
async function refreshShopRating(shopId) {
  const agg = await prisma.review.aggregate({
    where: { shopId },
    _avg: { rating: true },
    _count: { rating: true },
  });
  await prisma.shop.update({
    where: { id: shopId },
    data: {
      averageRating: agg._avg.rating || 0,
      reviewCount: agg._count.rating || 0,
    },
  });
}

// POST /api/shops/:shopId/reviews
const createReview = asyncHandler(async (req, res) => {
  const { shopId } = req.params;
  const { rating, comment, photos = [] } = req.body;

  if (rating < 1 || rating > 5) throw new AppError("Rating must be between 1 and 5", 422);

  const review = await prisma.review.create({
    data: { userId: req.user.id, shopId, rating: Number(rating), comment, photos },
  });

  await refreshShopRating(shopId);
  res.status(201).json({ success: true, data: review });
});

// GET /api/shops/:shopId/reviews
const getShopReviews = asyncHandler(async (req, res) => {
  const reviews = await prisma.review.findMany({
    where: { shopId: req.params.shopId },
    include: { user: { select: { name: true, avatarUrl: true } } },
    orderBy: { createdAt: "desc" },
  });
  res.json({ success: true, data: reviews });
});

// DELETE /api/reviews/:id  (author or admin)
const deleteReview = asyncHandler(async (req, res) => {
  const review = await prisma.review.findUnique({ where: { id: req.params.id } });
  if (!review) throw new AppError("Review not found", 404);
  if (review.userId !== req.user.id && req.user.role !== "ADMIN") {
    throw new AppError("You do not have permission to delete this review", 403);
  }
  await prisma.review.delete({ where: { id: req.params.id } });
  await refreshShopRating(review.shopId);
  res.json({ success: true, message: "Review deleted" });
});

// POST /api/reviews/:id/like
const likeReview = asyncHandler(async (req, res) => {
  const review = await prisma.review.update({
    where: { id: req.params.id },
    data: { likeCount: { increment: 1 } },
  });
  res.json({ success: true, data: review });
});

module.exports = { createReview, getShopReviews, deleteReview, likeReview };

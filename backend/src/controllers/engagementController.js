const prisma = require("../config/db");
const { AppError, asyncHandler } = require("../middleware/errorHandler");

// ---------- Favorites (wishlist) ----------

// POST /api/favorites  { shopId? , productId? }
const addFavorite = asyncHandler(async (req, res) => {
  const { shopId, productId } = req.body;
  if (!shopId && !productId) throw new AppError("shopId or productId is required", 422);

  const favorite = await prisma.favorite.upsert({
    where: {
      userId_shopId_productId: {
        userId: req.user.id,
        shopId: shopId || null,
        productId: productId || null,
      },
    },
    update: {},
    create: { userId: req.user.id, shopId, productId },
  });
  res.status(201).json({ success: true, data: favorite });
});

// DELETE /api/favorites/:id
const removeFavorite = asyncHandler(async (req, res) => {
  const favorite = await prisma.favorite.findUnique({ where: { id: req.params.id } });
  if (!favorite || favorite.userId !== req.user.id) throw new AppError("Favorite not found", 404);
  await prisma.favorite.delete({ where: { id: req.params.id } });
  res.json({ success: true, message: "Removed from favorites" });
});

// GET /api/favorites  (current user's wishlist)
const getMyFavorites = asyncHandler(async (req, res) => {
  const favorites = await prisma.favorite.findMany({
    where: { userId: req.user.id },
    include: { shop: true, product: { include: { shop: { select: { name: true, city: true } } } } },
    orderBy: { createdAt: "desc" },
  });
  res.json({ success: true, data: favorites });
});

// ---------- Reports (fake listing / abuse) ----------

// POST /api/reports  { shopId?, productId?, reason }
const createReport = asyncHandler(async (req, res) => {
  const { shopId, productId, reason } = req.body;
  if (!reason) throw new AppError("A reason is required", 422);
  if (!shopId && !productId) throw new AppError("shopId or productId is required", 422);

  const report = await prisma.report.create({
    data: { userId: req.user.id, shopId, productId, reason },
  });
  res.status(201).json({ success: true, data: report });
});

// ---------- Inquiries (customer contacts a shop) ----------

// POST /api/inquiries  { shopId, message }
const createInquiry = asyncHandler(async (req, res) => {
  const { shopId, message } = req.body;
  if (!shopId || !message) throw new AppError("shopId and message are required", 422);

  const inquiry = await prisma.inquiry.create({
    data: { userId: req.user.id, shopId, message },
  });

  // Notify the shop owner
  const shop = await prisma.shop.findUnique({ where: { id: shopId } });
  if (shop) {
    await prisma.notification.create({
      data: {
        userId: shop.ownerId,
        title: "New inquiry received",
        body: `${req.user.name} sent an inquiry about your shop "${shop.name}"`,
      },
    });
  }

  res.status(201).json({ success: true, data: inquiry });
});

// GET /api/shops/:shopId/inquiries  (shop owner)
const getShopInquiries = asyncHandler(async (req, res) => {
  const shop = await prisma.shop.findUnique({ where: { id: req.params.shopId } });
  if (!shop) throw new AppError("Shop not found", 404);
  if (shop.ownerId !== req.user.id && req.user.role !== "ADMIN") {
    throw new AppError("You do not have permission to view these inquiries", 403);
  }
  const inquiries = await prisma.inquiry.findMany({
    where: { shopId: req.params.shopId },
    include: { user: { select: { name: true, phone: true, email: true } } },
    orderBy: { createdAt: "desc" },
  });
  res.json({ success: true, data: inquiries });
});

module.exports = {
  addFavorite, removeFavorite, getMyFavorites,
  createReport, createInquiry, getShopInquiries,
};

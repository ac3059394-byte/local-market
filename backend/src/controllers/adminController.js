const prisma = require("../config/db");
const { AppError, asyncHandler } = require("../middleware/errorHandler");

// GET /api/admin/dashboard
const getDashboardStats = asyncHandler(async (_req, res) => {
  const [userCount, shopCount, productCount, pendingReports, reviewCount] = await Promise.all([
    prisma.user.count(),
    prisma.shop.count(),
    prisma.product.count(),
    prisma.report.count({ where: { status: "PENDING" } }),
    prisma.review.count(),
  ]);

  res.json({
    success: true,
    data: { userCount, shopCount, productCount, pendingReports, reviewCount },
  });
});

// GET /api/admin/users
const listUsers = asyncHandler(async (req, res) => {
  const { role, page = 1, limit = 25 } = req.query;
  const take = Math.min(Number(limit), 100);
  const skip = (Number(page) - 1) * take;

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where: role ? { role } : undefined,
      select: { id: true, name: true, email: true, phone: true, role: true, isVerified: true, createdAt: true },
      orderBy: { createdAt: "desc" },
      take,
      skip,
    }),
    prisma.user.count({ where: role ? { role } : undefined }),
  ]);

  res.json({ success: true, data: users, pagination: { page: Number(page), limit: take, total } });
});

// GET /api/admin/reports
const listReports = asyncHandler(async (req, res) => {
  const { status = "PENDING" } = req.query;
  const reports = await prisma.report.findMany({
    where: { status },
    include: {
      user: { select: { name: true, email: true } },
      shop: { select: { name: true } },
      product: { select: { name: true } },
    },
    orderBy: { createdAt: "desc" },
  });
  res.json({ success: true, data: reports });
});

// PATCH /api/admin/reports/:id  { status: "REVIEWED" | "DISMISSED" }
const resolveReport = asyncHandler(async (req, res) => {
  const { status } = req.body;
  if (!["REVIEWED", "DISMISSED"].includes(status)) throw new AppError("Invalid status", 422);
  const report = await prisma.report.update({ where: { id: req.params.id }, data: { status } });
  res.json({ success: true, data: report });
});

// PATCH /api/admin/shops/:id/verify
const verifyShop = asyncHandler(async (req, res) => {
  const shop = await prisma.shop.update({ where: { id: req.params.id }, data: { isVerified: true } });
  res.json({ success: true, data: shop });
});

// PATCH /api/admin/shops/:id/feature
const toggleFeatureShop = asyncHandler(async (req, res) => {
  const shop = await prisma.shop.findUnique({ where: { id: req.params.id } });
  if (!shop) throw new AppError("Shop not found", 404);
  const updated = await prisma.shop.update({
    where: { id: req.params.id },
    data: { isFeatured: !shop.isFeatured },
  });
  res.json({ success: true, data: updated });
});

// PATCH /api/admin/shops/:id/membership  { tier: "FREE" | "PREMIUM" }
const setMembershipTier = asyncHandler(async (req, res) => {
  const { tier } = req.body;
  if (!["FREE", "PREMIUM"].includes(tier)) throw new AppError("Invalid membership tier", 422);
  const shop = await prisma.shop.update({ where: { id: req.params.id }, data: { membershipTier: tier } });
  res.json({ success: true, data: shop });
});

// PATCH /api/admin/products/:id/approve
const approveProduct = asyncHandler(async (req, res) => {
  const product = await prisma.product.update({ where: { id: req.params.id }, data: { isApproved: true } });
  res.json({ success: true, data: product });
});

module.exports = {
  getDashboardStats, listUsers, listReports, resolveReport,
  verifyShop, toggleFeatureShop, setMembershipTier, approveProduct,
};

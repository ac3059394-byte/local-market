const prisma = require("../config/db");
const { asyncHandler } = require("../middleware/errorHandler");

// GET /api/search/products
// Query params: q, city, state, pincode, category, brand, minPrice, maxPrice,
//               deliveryOnly, sortBy (relevance|price_asc|price_desc|newest|discount), page, limit
const searchProducts = asyncHandler(async (req, res) => {
  const {
    q, city, state, pincode, category, brand,
    minPrice, maxPrice, deliveryOnly, sortBy = "relevance",
    page = 1, limit = 20,
  } = req.query;

  const where = {
    isApproved: true,
    status: { not: "DISCONTINUED" },
    ...(q && {
      OR: [
        { name: { contains: q, mode: "insensitive" } },
        { brand: { contains: q, mode: "insensitive" } },
        { description: { contains: q, mode: "insensitive" } },
        { shop: { name: { contains: q, mode: "insensitive" } } },
      ],
    }),
    ...(brand && { brand: { equals: brand, mode: "insensitive" } }),
    ...(category && { category: { slug: category } }),
    ...(deliveryOnly === "true" && { deliveryAvailable: true }),
    ...((minPrice || maxPrice) && {
      sellingPrice: {
        ...(minPrice && { gte: Number(minPrice) }),
        ...(maxPrice && { lte: Number(maxPrice) }),
      },
    }),
    shop: {
      ...(city && { city: { equals: city, mode: "insensitive" } }),
      ...(state && { state: { equals: state, mode: "insensitive" } }),
      ...(pincode && { pincode }),
    },
  };

  const orderBy = {
    price_asc: { sellingPrice: "asc" },
    price_desc: { sellingPrice: "desc" },
    newest: { createdAt: "desc" },
    discount: { discountPercent: "desc" },
    relevance: { viewCount: "desc" }, // simple proxy; swap for full-text rank at scale
  }[sortBy] || { viewCount: "desc" };

  const take = Math.min(Number(limit) || 20, 50);
  const skip = (Math.max(Number(page), 1) - 1) * take;

  const [items, total] = await Promise.all([
    prisma.product.findMany({
      where,
      include: {
        shop: { select: { id: true, name: true, city: true, state: true, isVerified: true, membershipTier: true, averageRating: true } },
        category: { select: { name: true, slug: true } },
      },
      orderBy,
      take,
      skip,
    }),
    prisma.product.count({ where }),
  ]);

  res.json({
    success: true,
    data: items,
    pagination: { page: Number(page), limit: take, total, totalPages: Math.ceil(total / take) },
  });
});

// GET /api/search/shops
// Query params: q, city, state, pincode, category, openNow, page, limit
const searchShops = asyncHandler(async (req, res) => {
  const { q, city, state, pincode, category, page = 1, limit = 20 } = req.query;

  const where = {
    ...(q && {
      OR: [
        { name: { contains: q, mode: "insensitive" } },
        { description: { contains: q, mode: "insensitive" } },
      ],
    }),
    ...(city && { city: { equals: city, mode: "insensitive" } }),
    ...(state && { state: { equals: state, mode: "insensitive" } }),
    ...(pincode && { pincode }),
    ...(category && { categories: { some: { category: { slug: category } } } }),
  };

  const take = Math.min(Number(limit) || 20, 50);
  const skip = (Math.max(Number(page), 1) - 1) * take;

  const [items, total] = await Promise.all([
    prisma.shop.findMany({
      where,
      orderBy: [{ isFeatured: "desc" }, { averageRating: "desc" }],
      take,
      skip,
    }),
    prisma.shop.count({ where }),
  ]);

  res.json({
    success: true,
    data: items,
    pagination: { page: Number(page), limit: take, total, totalPages: Math.ceil(total / take) },
  });
});

// GET /api/search/suggestions?q=...
// Lightweight autosuggest for the search box (product names + brands + shop names).
const getSuggestions = asyncHandler(async (req, res) => {
  const { q } = req.query;
  if (!q || q.trim().length < 2) return res.json({ success: true, data: [] });

  const [products, shops] = await Promise.all([
    prisma.product.findMany({
      where: { isApproved: true, name: { contains: q, mode: "insensitive" } },
      select: { id: true, name: true, brand: true },
      take: 5,
    }),
    prisma.shop.findMany({
      where: { name: { contains: q, mode: "insensitive" } },
      select: { id: true, name: true, city: true },
      take: 5,
    }),
  ]);

  const suggestions = [
    ...products.map((p) => ({ type: "product", id: p.id, label: p.name, meta: p.brand })),
    ...shops.map((s) => ({ type: "shop", id: s.id, label: s.name, meta: s.city })),
  ];

  res.json({ success: true, data: suggestions });
});

module.exports = { searchProducts, searchShops, getSuggestions };

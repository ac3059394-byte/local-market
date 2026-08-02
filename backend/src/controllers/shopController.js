const prisma = require("../config/db");
const { AppError, asyncHandler } = require("../middleware/errorHandler");

// POST /api/shops  (SHOP_OWNER)
const createShop = asyncHandler(async (req, res) => {
  const {
    name, ownerName, gstNumber, mobileNumber, whatsappNumber, email,
    addressLine, pincode, state, district, city, latitude, longitude,
    googleMapsUrl, openingTime, closingTime, weeklyHoliday, description,
    categoryIds = [],
  } = req.body;

  const shop = await prisma.shop.create({
    data: {
      ownerId: req.user.id,
      name, ownerName, gstNumber, mobileNumber, whatsappNumber, email,
      addressLine, pincode, state, district, city,
      latitude: Number(latitude), longitude: Number(longitude),
      googleMapsUrl, openingTime, closingTime, weeklyHoliday, description,
      categories: {
        create: categoryIds.map((categoryId) => ({ category: { connect: { id: categoryId } } })),
      },
    },
    include: { categories: { include: { category: true } } },
  });

  res.status(201).json({ success: true, data: shop });
});

// GET /api/shops/:id
const getShop = asyncHandler(async (req, res) => {
  const shop = await prisma.shop.findUnique({
    where: { id: req.params.id },
    include: {
      categories: { include: { category: true } },
      products: { where: { isApproved: true }, take: 20, orderBy: { createdAt: "desc" } },
      _count: { select: { products: true, reviews: true } },
    },
  });
  if (!shop) throw new AppError("Shop not found", 404);
  res.json({ success: true, data: shop });
});

// PATCH /api/shops/:id  (owner or admin)
const updateShop = asyncHandler(async (req, res) => {
  const shop = await prisma.shop.findUnique({ where: { id: req.params.id } });
  if (!shop) throw new AppError("Shop not found", 404);
  if (shop.ownerId !== req.user.id && req.user.role !== "ADMIN") {
    throw new AppError("You do not have permission to edit this shop", 403);
  }

  const allowedFields = [
    "name", "ownerName", "gstNumber", "mobileNumber", "whatsappNumber", "email",
    "addressLine", "pincode", "state", "district", "city", "latitude", "longitude",
    "googleMapsUrl", "openingTime", "closingTime", "weeklyHoliday", "description",
  ];
  const data = {};
  for (const field of allowedFields) {
    if (req.body[field] !== undefined) data[field] = req.body[field];
  }

  const updated = await prisma.shop.update({ where: { id: req.params.id }, data });
  res.json({ success: true, data: updated });
});

// DELETE /api/shops/:id  (owner or admin)
const deleteShop = asyncHandler(async (req, res) => {
  const shop = await prisma.shop.findUnique({ where: { id: req.params.id } });
  if (!shop) throw new AppError("Shop not found", 404);
  if (shop.ownerId !== req.user.id && req.user.role !== "ADMIN") {
    throw new AppError("You do not have permission to delete this shop", 403);
  }
  await prisma.shop.delete({ where: { id: req.params.id } });
  res.json({ success: true, message: "Shop deleted" });
});

// GET /api/shops/mine  (SHOP_OWNER)
const getMyShops = asyncHandler(async (req, res) => {
  const shops = await prisma.shop.findMany({
    where: { ownerId: req.user.id },
    include: { _count: { select: { products: true, reviews: true } } },
    orderBy: { createdAt: "desc" },
  });
  res.json({ success: true, data: shops });
});

// POST /api/shops/:id/logo  (multipart upload via multer/cloudinary)
const uploadLogo = asyncHandler(async (req, res) => {
  if (!req.file) throw new AppError("No file uploaded", 400);
  const shop = await prisma.shop.update({
    where: { id: req.params.id },
    data: { logoUrl: req.file.path },
  });
  res.json({ success: true, data: { logoUrl: shop.logoUrl } });
});

// POST /api/shops/:id/banner
const uploadBanner = asyncHandler(async (req, res) => {
  if (!req.file) throw new AppError("No file uploaded", 400);
  const shop = await prisma.shop.update({
    where: { id: req.params.id },
    data: { bannerUrl: req.file.path },
  });
  res.json({ success: true, data: { bannerUrl: shop.bannerUrl } });
});

// POST /api/shops/:id/photos  (multiple)
const uploadPhotos = asyncHandler(async (req, res) => {
  if (!req.files || req.files.length === 0) throw new AppError("No files uploaded", 400);
  const urls = req.files.map((f) => f.path);
  const shop = await prisma.shop.findUnique({ where: { id: req.params.id } });
  const updated = await prisma.shop.update({
    where: { id: req.params.id },
    data: { photos: [...shop.photos, ...urls] },
  });
  res.json({ success: true, data: { photos: updated.photos } });
});

// GET /api/shops/nearby?lat=..&lng=..&radiusKm=5
// Simple bounding-box + haversine filter. For scale, replace with
// PostGIS (ST_DWithin) — see README "Scaling notes".
const getNearbyShops = asyncHandler(async (req, res) => {
  const lat = parseFloat(req.query.lat);
  const lng = parseFloat(req.query.lng);
  const radiusKm = parseFloat(req.query.radiusKm) || 5;

  if (Number.isNaN(lat) || Number.isNaN(lng)) {
    throw new AppError("lat and lng query params are required", 422);
  }

  // Rough bounding box to cut down candidates before precise filtering.
  const latDelta = radiusKm / 111; // ~111km per degree latitude
  const lngDelta = radiusKm / (111 * Math.cos((lat * Math.PI) / 180));

  const candidates = await prisma.shop.findMany({
    where: {
      latitude: { gte: lat - latDelta, lte: lat + latDelta },
      longitude: { gte: lng - lngDelta, lte: lng + lngDelta },
    },
    take: 200,
  });

  const toRad = (deg) => (deg * Math.PI) / 180;
  const haversineKm = (lat1, lon1, lat2, lon2) => {
    const R = 6371;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
    return R * 2 * Math.asin(Math.sqrt(a));
  };

  const nearby = candidates
    .map((shop) => ({ ...shop, distanceKm: haversineKm(lat, lng, shop.latitude, shop.longitude) }))
    .filter((shop) => shop.distanceKm <= radiusKm)
    .sort((a, b) => a.distanceKm - b.distanceKm);

  res.json({ success: true, data: nearby });
});

module.exports = {
  createShop, getShop, updateShop, deleteShop, getMyShops,
  uploadLogo, uploadBanner, uploadPhotos, getNearbyShops,
};

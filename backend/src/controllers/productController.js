const prisma = require("../config/db");
const { AppError, asyncHandler } = require("../middleware/errorHandler");

async function assertOwnsShop(shopId, user) {
  const shop = await prisma.shop.findUnique({ where: { id: shopId } });
  if (!shop) throw new AppError("Shop not found", 404);
  if (shop.ownerId !== user.id && user.role !== "ADMIN") {
    throw new AppError("You do not have permission to manage products for this shop", 403);
  }
  return shop;
}

// POST /api/products  (SHOP_OWNER)
const createProduct = asyncHandler(async (req, res) => {
  const {
    shopId, categoryId, name, description, brand, model, sku, barcode,
    sellingPrice, mrp, discountPercent, quantity, unit,
    deliveryAvailable, pickupAvailable, images = [],
  } = req.body;

  await assertOwnsShop(shopId, req.user);

  const product = await prisma.product.create({
    data: {
      shopId, categoryId, name, description, brand, model, sku, barcode,
      sellingPrice, mrp, discountPercent, unit,
      quantity: Number(quantity) || 0,
      deliveryAvailable: !!deliveryAvailable,
      pickupAvailable: pickupAvailable !== undefined ? !!pickupAvailable : true,
      images,
      status: Number(quantity) > 0 ? "IN_STOCK" : "OUT_OF_STOCK",
    },
  });

  res.status(201).json({ success: true, data: product });
});

// GET /api/products/:id
const getProduct = asyncHandler(async (req, res) => {
  const product = await prisma.product.update({
    where: { id: req.params.id },
    data: { viewCount: { increment: 1 } },
    include: { shop: true, category: true },
  });
  if (!product) throw new AppError("Product not found", 404);
  res.json({ success: true, data: product });
});

// PATCH /api/products/:id  (owner or admin)
const updateProduct = asyncHandler(async (req, res) => {
  const existing = await prisma.product.findUnique({ where: { id: req.params.id } });
  if (!existing) throw new AppError("Product not found", 404);
  await assertOwnsShop(existing.shopId, req.user);

  const allowedFields = [
    "name", "description", "categoryId", "brand", "model", "sku", "barcode",
    "sellingPrice", "mrp", "discountPercent", "quantity", "unit", "status",
    "deliveryAvailable", "pickupAvailable", "images",
  ];
  const data = {};
  for (const field of allowedFields) {
    if (req.body[field] !== undefined) data[field] = req.body[field];
  }
  // Keep status in sync when quantity is explicitly updated and status wasn't.
  if (data.quantity !== undefined && data.status === undefined) {
    data.status = Number(data.quantity) > 0 ? "IN_STOCK" : "OUT_OF_STOCK";
  }

  const product = await prisma.product.update({ where: { id: req.params.id }, data });
  res.json({ success: true, data: product });
});

// DELETE /api/products/:id  (owner or admin)
const deleteProduct = asyncHandler(async (req, res) => {
  const existing = await prisma.product.findUnique({ where: { id: req.params.id } });
  if (!existing) throw new AppError("Product not found", 404);
  await assertOwnsShop(existing.shopId, req.user);

  await prisma.product.delete({ where: { id: req.params.id } });
  res.json({ success: true, message: "Product deleted" });
});

// GET /api/shops/:shopId/products
const getProductsByShop = asyncHandler(async (req, res) => {
  const products = await prisma.product.findMany({
    where: { shopId: req.params.shopId, isApproved: true },
    orderBy: { createdAt: "desc" },
  });
  res.json({ success: true, data: products });
});

// PATCH /api/products/:id/stock  (quick stock/price update — dashboard shortcut)
const quickUpdateStock = asyncHandler(async (req, res) => {
  const existing = await prisma.product.findUnique({ where: { id: req.params.id } });
  if (!existing) throw new AppError("Product not found", 404);
  await assertOwnsShop(existing.shopId, req.user);

  const { quantity, sellingPrice } = req.body;
  const data = {};
  if (quantity !== undefined) {
    data.quantity = Number(quantity);
    data.status = Number(quantity) > 0 ? "IN_STOCK" : "OUT_OF_STOCK";
  }
  if (sellingPrice !== undefined) data.sellingPrice = sellingPrice;

  const product = await prisma.product.update({ where: { id: req.params.id }, data });
  res.json({ success: true, data: product });
});

// POST /api/products/:id/images
const uploadProductImages = asyncHandler(async (req, res) => {
  if (!req.files || req.files.length === 0) throw new AppError("No files uploaded", 400);
  const existing = await prisma.product.findUnique({ where: { id: req.params.id } });
  if (!existing) throw new AppError("Product not found", 404);
  await assertOwnsShop(existing.shopId, req.user);

  const urls = req.files.map((f) => f.path);
  const product = await prisma.product.update({
    where: { id: req.params.id },
    data: { images: [...existing.images, ...urls] },
  });
  res.json({ success: true, data: { images: product.images } });
});

module.exports = {
  createProduct, getProduct, updateProduct, deleteProduct,
  getProductsByShop, quickUpdateStock, uploadProductImages,
};

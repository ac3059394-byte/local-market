const express = require("express");
const { requireAuth, requireRole } = require("../middleware/auth");
const { makeUploader } = require("../config/cloudinary");
const {
  createProduct, getProduct, updateProduct, deleteProduct,
  quickUpdateStock, uploadProductImages,
} = require("../controllers/productController");

const router = express.Router();
const productImageUpload = makeUploader("products");

router.get("/:id", getProduct);
router.post("/", requireAuth, requireRole("SHOP_OWNER", "ADMIN"), createProduct);
router.patch("/:id", requireAuth, requireRole("SHOP_OWNER", "ADMIN"), updateProduct);
router.patch("/:id/stock", requireAuth, requireRole("SHOP_OWNER", "ADMIN"), quickUpdateStock);
router.delete("/:id", requireAuth, requireRole("SHOP_OWNER", "ADMIN"), deleteProduct);
router.post(
  "/:id/images",
  requireAuth,
  requireRole("SHOP_OWNER", "ADMIN"),
  productImageUpload.array("images", 8),
  uploadProductImages
);

module.exports = router;

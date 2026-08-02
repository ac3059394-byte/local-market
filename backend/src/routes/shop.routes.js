const express = require("express");
const { requireAuth, requireRole } = require("../middleware/auth");
const { makeUploader } = require("../config/cloudinary");
const {
  createShop, getShop, updateShop, deleteShop, getMyShops,
  uploadLogo, uploadBanner, uploadPhotos, getNearbyShops,
} = require("../controllers/shopController");

const router = express.Router();

const logoUpload = makeUploader("shops/logos");
const bannerUpload = makeUploader("shops/banners");
const photosUpload = makeUploader("shops/photos");

router.get("/nearby", getNearbyShops);
router.get("/mine", requireAuth, requireRole("SHOP_OWNER", "ADMIN"), getMyShops);
router.get("/:id", getShop);

router.post("/", requireAuth, requireRole("SHOP_OWNER", "ADMIN"), createShop);
router.patch("/:id", requireAuth, requireRole("SHOP_OWNER", "ADMIN"), updateShop);
router.delete("/:id", requireAuth, requireRole("SHOP_OWNER", "ADMIN"), deleteShop);

router.post("/:id/logo", requireAuth, requireRole("SHOP_OWNER", "ADMIN"), logoUpload.single("logo"), uploadLogo);
router.post("/:id/banner", requireAuth, requireRole("SHOP_OWNER", "ADMIN"), bannerUpload.single("banner"), uploadBanner);
router.post("/:id/photos", requireAuth, requireRole("SHOP_OWNER", "ADMIN"), photosUpload.array("photos", 10), uploadPhotos);

module.exports = router;

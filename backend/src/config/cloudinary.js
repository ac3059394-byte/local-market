const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const multer = require("multer");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Reusable upload middleware. folder can be "shops", "products", "reviews", "avatars".
function makeUploader(folder) {
  const storage = new CloudinaryStorage({
    cloudinary,
    params: {
      folder: `local-market/${folder}`,
      allowed_formats: ["jpg", "jpeg", "png", "webp"],
      transformation: [{ width: 1600, crop: "limit", quality: "auto" }],
    },
  });

  return multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB per image
  });
}

module.exports = { cloudinary, makeUploader };

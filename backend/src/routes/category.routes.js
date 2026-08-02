const express = require("express");
const { requireAuth, requireRole } = require("../middleware/auth");
const { getCategories, createCategory, deleteCategory } = require("../controllers/categoryController");

const router = express.Router();

router.get("/", getCategories);
router.post("/", requireAuth, requireRole("ADMIN"), createCategory);
router.delete("/:id", requireAuth, requireRole("ADMIN"), deleteCategory);

module.exports = router;

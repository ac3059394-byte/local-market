const prisma = require("../config/db");
const { AppError, asyncHandler } = require("../middleware/errorHandler");

// GET /api/categories  (tree of top-level categories with children)
const getCategories = asyncHandler(async (req, res) => {
  const categories = await prisma.category.findMany({
    where: { parentId: null },
    include: { children: true },
    orderBy: { name: "asc" },
  });
  res.json({ success: true, data: categories });
});

// POST /api/categories  (ADMIN)
const createCategory = asyncHandler(async (req, res) => {
  const { name, slug, iconUrl, parentId } = req.body;
  if (!name || !slug) throw new AppError("name and slug are required", 422);
  const category = await prisma.category.create({ data: { name, slug, iconUrl, parentId } });
  res.status(201).json({ success: true, data: category });
});

// DELETE /api/categories/:id  (ADMIN)
const deleteCategory = asyncHandler(async (req, res) => {
  await prisma.category.delete({ where: { id: req.params.id } });
  res.json({ success: true, message: "Category deleted" });
});

module.exports = { getCategories, createCategory, deleteCategory };

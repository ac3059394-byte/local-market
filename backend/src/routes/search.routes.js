const express = require("express");
const { searchProducts, searchShops, getSuggestions } = require("../controllers/searchController");

const router = express.Router();

router.get("/products", searchProducts);
router.get("/shops", searchShops);
router.get("/suggestions", getSuggestions);

module.exports = router;

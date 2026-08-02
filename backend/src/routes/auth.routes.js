const express = require("express");
const { body } = require("express-validator");
const validate = require("../middleware/validate");
const { requireAuth } = require("../middleware/auth");
const { signup, login, refresh, me } = require("../controllers/authController");

const router = express.Router();

router.post(
  "/signup",
  [
    body("name").trim().notEmpty().withMessage("Name is required"),
    body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
    body("email").optional().isEmail().withMessage("Invalid email"),
    body("phone").optional().isMobilePhone().withMessage("Invalid phone number"),
  ],
  validate,
  signup
);

router.post(
  "/login",
  [
    body("emailOrPhone").notEmpty().withMessage("Email or phone is required"),
    body("password").notEmpty().withMessage("Password is required"),
  ],
  validate,
  login
);

router.post("/refresh", refresh);
router.get("/me", requireAuth, me);

module.exports = router;

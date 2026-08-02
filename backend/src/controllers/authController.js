const bcrypt = require("bcryptjs");
const prisma = require("../config/db");
const { AppError, asyncHandler } = require("../middleware/errorHandler");
const { signAccessToken, signRefreshToken, verifyRefreshToken } = require("../utils/jwt");

// POST /api/auth/signup
const signup = asyncHandler(async (req, res) => {
  const { name, email, phone, password, role } = req.body;

  if (!email && !phone) {
    throw new AppError("Email or phone number is required", 422);
  }

  const existing = await prisma.user.findFirst({
    where: { OR: [email ? { email } : undefined, phone ? { phone } : undefined].filter(Boolean) },
  });
  if (existing) throw new AppError("An account with this email or phone already exists", 409);

  const passwordHash = password ? await bcrypt.hash(password, 12) : null;

  const user = await prisma.user.create({
    data: {
      name,
      email,
      phone,
      passwordHash,
      // Only allow CUSTOMER or SHOP_OWNER at signup; ADMIN is granted manually.
      role: role === "SHOP_OWNER" ? "SHOP_OWNER" : "CUSTOMER",
    },
  });

  const accessToken = signAccessToken(user);
  const refreshToken = signRefreshToken(user);

  res.status(201).json({
    success: true,
    data: {
      user: { id: user.id, name: user.name, email: user.email, phone: user.phone, role: user.role },
      accessToken,
      refreshToken,
    },
  });
});

// POST /api/auth/login
const login = asyncHandler(async (req, res) => {
  const { emailOrPhone, password } = req.body;

  const user = await prisma.user.findFirst({
    where: { OR: [{ email: emailOrPhone }, { phone: emailOrPhone }] },
  });
  if (!user || !user.passwordHash) throw new AppError("Invalid credentials", 401);

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) throw new AppError("Invalid credentials", 401);

  const accessToken = signAccessToken(user);
  const refreshToken = signRefreshToken(user);

  res.json({
    success: true,
    data: {
      user: { id: user.id, name: user.name, email: user.email, phone: user.phone, role: user.role },
      accessToken,
      refreshToken,
    },
  });
});

// POST /api/auth/refresh
const refresh = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) throw new AppError("Refresh token is required", 400);

  let payload;
  try {
    payload = verifyRefreshToken(refreshToken);
  } catch (_err) {
    throw new AppError("Invalid or expired refresh token", 401);
  }

  const user = await prisma.user.findUnique({ where: { id: payload.sub } });
  if (!user) throw new AppError("User no longer exists", 401);

  res.json({ success: true, data: { accessToken: signAccessToken(user) } });
});

// GET /api/auth/me
const me = asyncHandler(async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
    select: { id: true, name: true, email: true, phone: true, role: true, avatarUrl: true, createdAt: true },
  });
  res.json({ success: true, data: user });
});

// NOTE: Google Login and Phone OTP verification are intentionally left as
// stubs — wire these to Google's OAuth token verification endpoint and
// your chosen OTP provider (e.g. MSG91, Twilio Verify) respectively, then
// call signAccessToken/signRefreshToken the same way as login() above.

module.exports = { signup, login, refresh, me };

const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // ---- Categories ----
  const electronics = await prisma.category.upsert({
    where: { slug: "electronics" },
    update: {},
    create: { name: "Electronics", slug: "electronics" },
  });
  const grocery = await prisma.category.upsert({
    where: { slug: "grocery" },
    update: {},
    create: { name: "Grocery", slug: "grocery" },
  });
  const fashion = await prisma.category.upsert({
    where: { slug: "fashion" },
    update: {},
    create: { name: "Fashion", slug: "fashion" },
  });

  // ---- Users ----
  const ownerPassword = await bcrypt.hash("password123", 12);
  const owner = await prisma.user.upsert({
    where: { email: "owner@example.com" },
    update: {},
    create: {
      name: "Ramesh Gupta",
      email: "owner@example.com",
      passwordHash: ownerPassword,
      role: "SHOP_OWNER",
      isVerified: true,
    },
  });

  const adminPassword = await bcrypt.hash("admin123", 12);
  await prisma.user.upsert({
    where: { email: "admin@example.com" },
    update: {},
    create: {
      name: "Platform Admin",
      email: "admin@example.com",
      passwordHash: adminPassword,
      role: "ADMIN",
      isVerified: true,
    },
  });

  const customerPassword = await bcrypt.hash("customer123", 12);
  await prisma.user.upsert({
    where: { email: "customer@example.com" },
    update: {},
    create: {
      name: "Anjali Sharma",
      email: "customer@example.com",
      passwordHash: customerPassword,
      role: "CUSTOMER",
    },
  });

  // ---- Shop ----
  const shop = await prisma.shop.create({
    data: {
      ownerId: owner.id,
      name: "Gupta Electronics & Mobile Store",
      ownerName: "Ramesh Gupta",
      mobileNumber: "9876543210",
      whatsappNumber: "9876543210",
      email: "guptaelectronics@example.com",
      addressLine: "Shop No. 12, Aminabad Market",
      pincode: "226018",
      state: "Uttar Pradesh",
      district: "Lucknow",
      city: "Lucknow",
      latitude: 26.8467,
      longitude: 80.9462,
      openingTime: "10:00",
      closingTime: "20:00",
      weeklyHoliday: "Sunday",
      description: "Trusted electronics and mobile store serving Lucknow since 1998.",
      isVerified: true,
      categories: { create: [{ categoryId: electronics.id }] },
    },
  });

  // ---- Products ----
  await prisma.product.createMany({
    data: [
      {
        shopId: shop.id,
        categoryId: electronics.id,
        name: "Samsung Galaxy M14 5G",
        description: "6GB RAM, 128GB storage, 6000mAh battery",
        brand: "Samsung",
        sellingPrice: 12999,
        mrp: 15999,
        discountPercent: 18.7,
        quantity: 25,
        unit: "pcs",
        deliveryAvailable: true,
        pickupAvailable: true,
      },
      {
        shopId: shop.id,
        categoryId: electronics.id,
        name: "boAt Airdopes 141",
        description: "True wireless earbuds with 42h playback",
        brand: "boAt",
        sellingPrice: 1299,
        mrp: 2490,
        discountPercent: 47.8,
        quantity: 60,
        unit: "pcs",
        deliveryAvailable: true,
        pickupAvailable: true,
      },
      {
        shopId: shop.id,
        categoryId: electronics.id,
        name: "Havells 1200mm Ceiling Fan",
        description: "Energy efficient, high air delivery",
        brand: "Havells",
        sellingPrice: 1899,
        mrp: 2200,
        discountPercent: 13.7,
        quantity: 0,
        unit: "pcs",
        deliveryAvailable: false,
        pickupAvailable: true,
        status: "OUT_OF_STOCK",
      },
    ],
  });

  console.log("Seed complete.");
  console.log("Login as shop owner: owner@example.com / password123");
  console.log("Login as admin:      admin@example.com / admin123");
  console.log("Login as customer:   customer@example.com / customer123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

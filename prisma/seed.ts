import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { fleet } from "../src/config/fleet";
import { testimonials } from "../src/config/testimonials";

const prisma = new PrismaClient();

async function main() {
  // Admin user
  const passwordHash = await bcrypt.hash(process.env.SEED_ADMIN_PASSWORD ?? "itrcabs@2026", 12);
  await prisma.adminUser.upsert({
    where: { email: "admin@itrcabs.com" },
    update: {},
    create: {
      email: "admin@itrcabs.com",
      name: "ITR Admin",
      passwordHash,
      role: "SUPER_ADMIN",
    },
  });

  // Pricing config
  await prisma.pricingConfig.upsert({
    where: { id: "global" },
    update: {},
    create: { id: "global" },
  });

  // Fleet
  for (const [i, v] of fleet.entries()) {
    await prisma.vehicle.upsert({
      where: { slug: v.slug },
      update: {
        basePrice: v.basePrice,
        perDayPrice: v.perDayPrice,
        extraKmRate: v.extraKmRate,
      },
      create: {
        slug: v.slug,
        name: v.name,
        category: v.category,
        tagline: v.tagline,
        description: v.description,
        seats: v.seats,
        luggage: v.luggage,
        ac: v.ac,
        fuel: v.fuel,
        basePrice: v.basePrice,
        perDayPrice: v.perDayPrice,
        extraKmRate: v.extraKmRate,
        driverBata: v.driverBata,
        illustration: v.illustration,
        features: v.features,
        examples: v.examples,
        popular: v.popular ?? false,
        sortOrder: i,
      },
    });
  }

  // Testimonials
  const count = await prisma.testimonial.count();
  if (count === 0) {
    await prisma.testimonial.createMany({
      data: testimonials.map((t) => ({
        name: t.name,
        role: t.role,
        location: t.location,
        rating: t.rating,
        text: t.text,
        trip: t.trip,
      })),
    });
  }

  console.log("✔ Seed complete");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
